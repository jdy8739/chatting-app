import axios from "axios";
import { useRouter } from "next/router";
import { userInfo } from "os";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import webstomp from "webstomp-client";
import Seo from "../../components/commons/Seo";
import UserContainer from "../../components/[id]/UserContainer";
import { IUserSignedInInfo } from "../../lib/store/modules/signInReducer";
import { IMessageBody, IParticipants } from "../../types/types";
import { DISBANDED, generateRandonUserId, getNowTime, MASTER, toastConfig } from "../../utils/utils";

export enum SEND_PROTOCOL {
    MESSEGE = 'message',
    DELETE = 'delete',
    BINARY = 'binary',
}

export enum RECEIVE_PROTOCOL {
    SUBSCRIBE = 0,
    BAN = 2,
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
let stomp: any;
let currentUserName: string = '';
let previousShowCnt = 0;
let imageFile: ArrayBuffer;

const CHAT_REMAIN_NUMBER_LIMIT = 10;

const STMOP_MESSAGE_SIZE_LIMIT = 500000;

const fetchRoomOwnerAndPreviousChat = async (id: number, count: number, password?: string) :Promise<IChatRoomInfo> => {
    return await (await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/room/message/${id}?offset=${count}`, { password })).data;
}

function ChattingRoom({ id, roomName, password, previousChat, roomOwner, roomOwnerId }: IChatRoomProps) {
    let newMessage: string;
    const router = useRouter();
    const [messages, setMessages] = useState<IMessageBody[]>(previousChat);
    const [isAllChatShown, setIsAllChatShown] = useState(previousChat.length < CHAT_REMAIN_NUMBER_LIMIT);
    const [targetChatNumber, setTargetChatNumber] = useState(-1);
    const [participants, setParticipants] = useState<IParticipants[]>([]);
    const { userNo, userId, userNickName } = useSelector(({ signInReducer: {userInfo} }: { signInReducer: {userInfo: IUserSignedInInfo} }) => userInfo);
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
            const isSentFromMaster = (newMessage.writer === MASTER);
            if (isSentFromMaster && newMessage.message === DISBANDED) {
                expelUser('This room is disbanded.');
                return;
            }
            const msgNo = newMessage.msgNo;
            const participantsListChanged = (
                msgNo !== null && msgNo >= RECEIVE_PROTOCOL.SUBSCRIBE && msgNo <= RECEIVE_PROTOCOL.BAN
            );
            if (isSentFromMaster && participantsListChanged)
                reflectNewMessageAndUser(newMessage);
            else updateMessageList(newMessage);
            window.scrollTo(0, document.body.scrollHeight);
        }, { roomId: id, userId: (userId || currentUserName) })
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
        if ((newMessageInfo.writer === MASTER) && !window.isNaN(target)) {
            setMessages(messages => {
                const copied = [...messages];
                const targetIndex = copied.findIndex(chat => chat.msgNo === target);
                copied[targetIndex]['isDeleted'] = true;
                return copied;
            })
            return;
        } else {
            setMessages(messages => {
                const copied = [...messages];
                copied.push(newMessageInfo);
                return copied;
            });
        }
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
        const { messageList } = await fetchRoomOwnerAndPreviousChat(id, previousShowCnt, password);
        if (messageList) {
            if (messageList.length < CHAT_REMAIN_NUMBER_LIMIT) setIsAllChatShown(true);
            setMessages(messages => {
                const copied = [...messageList, ...messages];
                return copied;
            })
        }
    };
    const handleChatDblClick = (index: number) => {
        if (index === targetChatNumber) setTargetChatNumber(-1);
        else setTargetChatNumber(index);
    }
    const deleteChat = async (id: number, msgNo: number) => {
        const { status } = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/room/del_message/${id}?msg_no=${msgNo}`);
        if (status === 200) {
            shootChatMessage(SEND_PROTOCOL.DELETE, {
                msgNo: 0,
                roomId: String(id), 
                message: String(msgNo),
                writer: MASTER,
                writerNo: (userNo > 0) ? userNo : null,
            })
            setTargetChatNumber(-1);
        }
    }
    const shootChatMessage = (target: SEND_PROTOCOL, message: IMessageBody) => {
        if (socket && stomp) {
            stomp.send(`/pub/chat/${target}`, 
            JSON.stringify(message), 
            { sampleHeader: 'sampleHeader' });
        }
    }
    const expelUser = (sentence: string) => {
        toast.error(sentence, toastConfig);
        router.push('/chat/list');
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
        } else if (imageFile.byteLength > STMOP_MESSAGE_SIZE_LIMIT) {
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
    const checkIfIsMyChat = function <T>(arg: T) {
        if (typeof arg === 'string')
        return (arg === currentUserName);
        else if (typeof arg === 'number')
        return (arg === userNo);
    };
    useEffect(() => {
        currentUserName = userNickName ? userNickName : generateRandonUserId();
        socket = new WebSocket('ws://localhost:5000/stomp/chat');
        stomp = webstomp.over(socket);
        stomp.connect({}, () => {
            subscribeNewMessage();
        });
        stomp.debug = () => null;
        /* currentUserId = participants[0];
        setPreviousRoomId(id);
        setParticipants([{ id: currentUserId, nickName: '' }]); */
        return () => {
            stomp.disconnect(() => null, {});
            currentUserName = '';
            previousShowCnt = 0;
        }
    }, []);
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
            {/* 재랜더링 시 불필요한 연산을 방지하 위해, 컴포넌트로 넣는 작업이 필요해 보임 */}
            <div className="container">
                {messages.map((msg, i) => 
                    <div key={i} 
                        className={`chat-box ${
                            (checkIfIsMyChat(msg.writer) ||
                            checkIfIsMyChat(msg.writerNo)) ? 'my-chat-box' : 'others-chat-box'}`}
                    >   
                        {(i === 0) ? <ChatInfo writer={msg.writer} /> :
                        (messages[i - 1].writer !== msg.writer) && 
                        <ChatInfo
                            writer={msg.writer}
                            isRoomOwner={(msg.writerNo === roomOwner)}
                        />}
                        {(msg.writer === MASTER) ?
                        <span className="master-chat">{msg.message}</span> :
                        <>
                            {(i !== 0) && 
                            (messages[i - 1].time !== msg.time) &&
                            (((userNo < 0) && checkIfIsMyChat(msg.writer)) || checkIfIsMyChat(msg.writerNo)) &&
                            <ChatTimeComponent 
                                time={msg.time || ''}
                            />}
                            <span
                                onDoubleClick={() => 
                                    (checkIfIsMyChat(msg.writer) || (roomOwner === userNo)) ? handleChatDblClick(i) : null}
                                className={`chat 
                                    ${checkIfIsMyChat(msg.writer) ||
                                    checkIfIsMyChat(msg.writerNo) ? 'my-chat' : 'others-chat'}
                                    ${msg.isDeleted ? 'deleted-chat' : ''}
                                `}
                            >
                                {!msg.isDeleted &&
                                (targetChatNumber === i) &&
                                <span
                                    onClick={() => deleteChat(id, msg.msgNo)}
                                    className="delete-btn">
                                    x
                                </span>}
                                <ChatContent 
                                    isDeleted={msg.isDeleted}
                                    isPicture={msg.isPicture}
                                    content={msg.message}
                                    msgNo={msg.msgNo}
                                    roomId={id}
                                />
                            </span>
                            {(i !== 0) && 
                            (messages[i - 1].time !== msg.time) && 
                            (!checkIfIsMyChat(msg.writer) && (msg.writerNo !== userNo)) &&
                            <ChatTimeComponent 
                                time={msg.time || ''}
                            />
                            }
                        </>}
                    </div>
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
                <style>{`
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
        const results = await fetchRoomOwnerAndPreviousChat(id, previousShowCnt, password);
        owner = results.owner;
        ownerId = results.ownerId;
        previousChat = results.messageList;
        previousChat?.reverse();
        previousChat?.forEach(chat => {if (chat.isDeleted) chat.message = ''});
    } catch (e) {
        console.log(`Failed to fetch previous chat of room id ${id}.`);
        return {
            redirect: {
                permanent: false,
                destination: "/chat/list",
            },
            props: {},
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

function ChatInfo({ writer, isRoomOwner }: { writer: string, isRoomOwner?: boolean }) {
    return (
        <>
            {(writer !== MASTER) &&
            <span>
                {isRoomOwner && 
                <img
                    src="/crown.png"
                    width="30px"
                    height="25px"
                />}
                <h5>{writer.slice(0, 9)}</h5>
            </span>}
        </>
    );
}

function ChatTimeComponent({ time }: { time: string}) {
    return (<>&emsp;<span className="time">{time}</span>&emsp;</>)
}

interface IMessageContent {
    content: string,
    roomId: number,
    msgNo: number,
    isDeleted?: boolean,
    isPicture?: boolean,
}

function ChatContent({ isDeleted, isPicture, content, roomId, msgNo }: IMessageContent) {
    return (
        <>
            {(isPicture && !isDeleted) ? 
            <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/room/content-pic/${roomId}/${msgNo}`}
                className="content-img"
            /> :
            <span>{isDeleted ? 'deleted message' : content}</span>}
        </>
    )
}

export default ChattingRoom;