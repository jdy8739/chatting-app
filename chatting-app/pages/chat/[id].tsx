import axios from "axios";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import webstomp, { Client } from "webstomp-client";
import Seo from "../../components/commons/Seo";
import MessageComponent from "../../components/[id]/MessageComponent";
import UserContainer from "../../components/[id]/UserContainer";
import { Iipdata, IMessageBody, IParticipants } from "../../types/types";
import { CHATO_TOKEN, generateRandonUserId, getAccessToken, getNowTime, toastConfig } from "../../utils/utils";
import { IUserInfoSelector } from "./list";

export enum SEND_PROTOCOL {
    MESSEGE = 'message',
    DELETE = 'delete',
    BINARY = 'binary',
}

export enum RECEIVE_PROTOCOL {
    SUBSCRIBE = 0,
    BAN = 2,
}

export enum MASTER_PROTOCOL {
    MASTER = "MASTER",
    DISBANDED = "disbanded",
}

enum LIMIT {
    CHAT_REMAIN_NUMBER = 10,
    STMOP_MESSAGE_SIZE = 500000,
}

interface IChatRoomProps {
    id: number,
    roomName: string,
    previousChat: IMessageBody[],
    password?: string,
    roomOwner: number | null,
    roomOwnerId: string,
}

interface IChatRoomInfo {
    owner: number | null, 
    ownerId: string,
    messageList?: IMessageBody[] | undefined,
}
  
let socket: WebSocket;
let stomp: Client;
let currentUserName: string = '';
let previousShowCnt = 0;
let imageFile: ArrayBuffer;
let timeOut: NodeJS.Timeout;

const fetchRoomOwnerAndPreviousChat = async (id: number, count: number, password?: string, ipAddress?: string) :Promise<IChatRoomInfo> => {
    return await (await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/room/message/${id}?offset=${count}`, { password, ipAddress })).data;
}

function ChattingRoom({ id, roomName, password, previousChat, roomOwner, roomOwnerId }: IChatRoomProps) {
    let newMessage: string;
    const router = useRouter();
    const [messages, setMessages] = useState<IMessageBody[]>(previousChat);
    const [isAllChatShown, setIsAllChatShown] = useState(previousChat.length < LIMIT.CHAT_REMAIN_NUMBER);
    const [targetChatNumber, setTargetChatNumber] = useState(-1);
    const [participants, setParticipants] = useState<IParticipants[]>([]);
    const { userNo, userId, userNickName } = useSelector(({ signInReducer: {userInfo} }: IUserInfoSelector) => userInfo);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        sendChat();
    };
    const handleTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.keyCode === 13) sendChat();
    }
    const sendChat = () => {
        if (textAreaRef.current?.value === '') return;
        if (textAreaRef.current) {
            newMessage = textAreaRef.current.value;
            textAreaRef.current.value = '';
        }
        if (socket && stomp) {
            shootChatMessage(SEND_PROTOCOL.MESSEGE, {
                msgNo: 0,
                roomId: String(id), 
                message: newMessage,
                writer: currentUserName,
                writerNo: (userNo > 0) ? userNo : null,
                time: getNowTime(),
            });
            textAreaRef.current?.setSelectionRange(0, 0);
        }
    }
    const subscribeNewMessage = () => {
        stomp.subscribe(`/sub/chat/room/${id}`, ({ body }: { body: string }) => {
            const newMessage: IMessageBody = JSON.parse(body);
            const isSentFromMaster = (newMessage.writer === MASTER_PROTOCOL.MASTER);
            if (isSentFromMaster && newMessage.message === MASTER_PROTOCOL.DISBANDED) {
                expelUser('This room is disbanded.');
                return;
            }
            const msgNo = newMessage.msgNo;
            const participantsListChanged = (
                (msgNo !== null) && (msgNo >= RECEIVE_PROTOCOL.SUBSCRIBE) && (msgNo <= RECEIVE_PROTOCOL.BAN)
            );
            if (isSentFromMaster && participantsListChanged)
                reflectNewMessageAndUser(newMessage);
            else updateMessageList(newMessage);
        }, { roomId: String(id), userId: (userId || currentUserName) })
    }
    const reflectNewMessageAndUser = (newMessage: IMessageBody) => {
        const msgNo = newMessage.msgNo;
        const [targetId, targetNickName] = newMessage.message.split('/');
        if (msgNo === RECEIVE_PROTOCOL.BAN) {
            if (userId ? (targetId === userId) : (targetId === currentUserName))
                expelUser('You are banned!');
            newMessage.message = `${targetId.slice(0, 9)} has been banned.`;
        } else newMessage.message = `${targetId.slice(0, 9)} has just ${msgNo ? 'left' : 'joined'} the room.`;
        updateParticipantsList({
            id: targetId,
            nickName: targetNickName,
        }, Boolean(msgNo));
        updateMessageList(newMessage);
    }
    const updateMessageList = (newMessageInfo: IMessageBody) => {
        const message = newMessageInfo.message;
        const target = Number(message);
        if ((newMessageInfo.writer === MASTER_PROTOCOL.MASTER) && !window.isNaN(target)) {
            setMessages(messages => {
                const copied = [...messages];
                const targetIndex = copied.findIndex(chat => chat.msgNo === target);
                copied[targetIndex]['isDeleted'] = true;
                return copied;
            })
            return;
        } else 
            setMessages(messages => [...messages, newMessageInfo]);
            window.scrollTo(0, document.body.scrollHeight);
    };
    const updateParticipantsList = (targetUser: IParticipants, isUserOut: boolean) => {
        setParticipants(participants => {
            if (isUserOut) {
                const targetIndex = participants.findIndex(participant => participant.id === targetUser.id);
                if (targetIndex === -1) return participants;
                participants.splice(targetIndex, 1);
            } else participants.push(targetUser);
            return [...participants];
        })
    }
    const showPreviousChat = async () => {
        setTargetChatNumber(-1);
        previousShowCnt += 1;
        const { messageList: newMessages } = await fetchRoomOwnerAndPreviousChat(id, previousShowCnt, password);
        if (newMessages) {
            if (newMessages.length < LIMIT.CHAT_REMAIN_NUMBER) setIsAllChatShown(true);
            setMessages(messages => {
                const copied = [...newMessages.reverse(), ...messages];
                return copied;
            })
        }
    };
    const handleChatDblClick = useCallback((index: number, isNumberMatches: boolean) => {
        /* targetChatNumber이 변경되지않음. (해결)*/
        if (isNumberMatches) {
            clearTimeout(timeOut);
            setTargetChatNumber(-1);
        } else {
            setTargetChatNumber(index);
            clearTimeout(timeOut);
            timeOut = setTimeout(() => {
                setTargetChatNumber(-1);
            }, 3000)
        }
    }, [])
    const deleteChat = useCallback(async (id: number, msgNo: number) => {
        const { status } = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/room/del_message/${id}?msg_no=${msgNo}`);
        if (status === 200) {
            shootChatMessage(SEND_PROTOCOL.DELETE, {
                msgNo: 0,
                roomId: String(id), 
                message: String(msgNo),
                writer: MASTER_PROTOCOL.MASTER,
                writerNo: (userNo > 0) ? userNo : null,
            })
            setTargetChatNumber(-1);
        }
    }, [])
    const shootChatMessage = useCallback((target: SEND_PROTOCOL, message: IMessageBody) => {
        if (socket && stomp) {
            stomp.send(`/pub/chat/${target}`, 
            JSON.stringify(message), 
            { sampleHeader: 'sampleHeader' });
        }
    }, [])
    const expelUser = async (sentence: string) => {
        try {
            if (!id) throw new Error();
            const {data: { ip }}: { data: Iipdata } = await axios.get(`https://api.ipdata.co?api-key=${process.env.NEXT_PUBLIC_IPDATA_API_KEY}`);
            axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/add_banned`, {
                roomId: id,
                ipAddress: ip,
                userName: currentUserName,
            })
        } catch (e) {} finally {
            toast.error(sentence, toastConfig);
            router.push('/chat/list');
        }
    }
    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files) {
            const targetFile = e.currentTarget.files[0];
            const fileReader = new FileReader();
            fileReader.onload = (readerEvent) => {
                const result = readerEvent.target?.result;
                if (result && typeof result !== 'string') {
                    imageFile = new Uint8Array(result);
                }
            }
            fileReader.readAsArrayBuffer(targetFile);
        }
    }
    const shootBinaryImageMessage = () => {
        if (!imageFile) {
            toast.error('No picture has been chosen.', toastConfig);
        } else if (imageFile.byteLength > LIMIT.STMOP_MESSAGE_SIZE) {
            toast.error('The picture size exceeds the limit.', toastConfig);
        } else {
            const headers = { 
                'content-type': 'application/octet-stream',
                'image-size': (imageFile.byteLength),
                'room-id': id,
                'writer': currentUserName,
                'writer-no': (userNo > 0) ? userNo : null,
                'time': getNowTime(),
            }
            Object.freeze(headers);
            if (socket && stomp) {
                stomp.send(`/pub/chat/${SEND_PROTOCOL.BINARY}`,
                imageFile,
                headers)
            }
        }
    }
    const checkIfIsMyChat = useCallback(function <T>(arg: T) {
        if (typeof arg === 'string')
        return (arg === currentUserName);
        else if (typeof arg === 'number') {
            return (arg === userNo);
        }
    }, [])
    const startAndSubscribeChatting = () => {
        currentUserName = userNickName ? userNickName : generateRandonUserId();
        stomp.connect({}, () => { subscribeNewMessage(); });
    }
    useEffect(() => {
        socket = new WebSocket('ws://localhost:5000/stomp/chat');
        stomp = webstomp.over(socket);
        stomp.debug = () => null;
        if (!getAccessToken(CHATO_TOKEN))
            startAndSubscribeChatting();
        return () => {
            stomp.disconnect(() => null, {});
            currentUserName = '';
            previousShowCnt = 0;
            clearTimeout(timeOut);
        }
    }, []);
    useEffect(() => {if (userNo !== -1) startAndSubscribeChatting()}, [userNo]);
    return (
        <>
            <Seo title={`Chato room ${roomName}`} />
            {isAllChatShown ||
            <div
                className="previous-chat-show"
                onClick={showPreviousChat}
            >
                <h4>show previous</h4>
            </div>}
            <UserContainer
                roomId={id}
                participants={participants}
                myId={userId}
                myUserNo={userNo}
                roomOwner={roomOwner}
                roomOwnerId={roomOwnerId}
                setParticipants={setParticipants}
                shootChatMessage={shootChatMessage}
            />
            {/* 재랜더링 시 불필요한 연산을 방지하 위해, 컴포넌트로 넣는 작업이 필요해 보임. (해결) */}
            <div className="container">
                {messages.map((msg, i) => 
                    (<MessageComponent
                        key={i}
                        index={i}
                        msg={msg}
                        isDeleted={msg.isDeleted}
                        prevWriter={messages[i - 1]?.writer}
                        prevTime={messages[i - 1]?.time}
                        checkIfIsMyChat={checkIfIsMyChat}
                        deleteChat={deleteChat}
                        handleChatDblClick={handleChatDblClick}
                        userNo={userNo}
                        roomOwner={roomOwner}
                        roomId={id}
                        isNumberMatches={(targetChatNumber === i)}
                    />)
                )}
                <input
                    type="file"
                    onChange={handleOnChange}
                />
                <button
                    className="picture-submit"
                    onClick={shootBinaryImageMessage}
                >send picture</button>
                <form 
                    onSubmit={handleChatSubmit}
                    className="chat-form"
                >
                    <textarea 
                        ref={textAreaRef}
                        onKeyDown={handleTextAreaKeyDown}
                    />
                    <button className="submit-button">submit</button>
                </form>
                <style jsx>{`
                    .chat-form { 
                        width: 100%;
                        display: flex;
                        margin-top: 30px;
                    }
                    textarea { 
                        width: 80%;
                        min-height: 100px;
                        border: none;
                        border-radius: 12px;
                        padding: 12px;
                        resize: vertical;
                    }
                    .submit-button {
                        width: 20%;
                        margin: 0;
                        font-size: 20px;
                        font-weight: bold;
                    }
                    .time {
                        font-size: 7px;
                        color: gray;
                    }
                    .previous-chat-show {
                        width: 100vw;
                        height: 100px;
                        background-color: gray;
                        position: absolute;
                        top: 65px;
                        opacity: 0.4;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #c0c0c0;
                        z-index: 10;
                    }
                    .content-img {
                        max-width: 300px;
                        height: auto;
                        padding: 14px;
                        border-radius: inherit;
                        background-color: inherit;
                    }
                    .picture-submit {
                        border: 1px solid rgb(0, 219, 146);
                    }
                    input[type=file]::-webkit-file-upload-button {
                        border: 1px solid rgb(0, 219, 146);
                        border-radius: 12px;
                        padding: 10px;
                        background-color: transparent;
                    }
                `}</style>
            </div>
        </>
    )
};

interface IServerProps { 
    params: {id: number}, 
    query: {roomName?: string, password?: string} 
}

export async function getServerSideProps({ params: { id }, query: { roomName, password }}: IServerProps) {
    let owner: (number | null);
    let ownerId: string;
    let previousChat: (IMessageBody[] | undefined);
    try {
        const {data: { ip }}: { data: Iipdata } = await axios.get(`https://api.ipdata.co?api-key=${process.env.NEXT_PUBLIC_IPDATA_API_KEY}`);
        const results = await fetchRoomOwnerAndPreviousChat(id, previousShowCnt, password, ip);
        owner = results.owner;
        ownerId = results.ownerId;
        previousChat = results.messageList?.reverse();
        previousChat?.forEach(chat => {if (chat.isDeleted) chat.message = ''});
    } catch (e) {
        console.log(`Failed to enter the chat room id ${id}.`);
        return {
            redirect: {
                permanent: false,
                destination: "/room_exception",
            },
            props: {}
        };
    }
    return {
        props: {
            id,
            roomName: (roomName || ''),
            previousChat: (previousChat ? previousChat : []),
            password: (password || null),
            roomOwner: owner,
            roomOwnerId: ownerId,
        }
    };
}

export default ChattingRoom;