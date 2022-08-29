import axios from "axios";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Seo from "../../components/commons/Seo";
import InputInterface from "../../components/[id]/InputInterface";
import MessageComponent from "../../components/[id]/MessageComponent";
import UserContainer from "../../components/[id]/UserContainer";
import { Iipdata, IMessageBody, IParticipants } from "../../types/types";
import { LIMIT, MASTER_PROTOCOL, RECEIVE_PROTOCOL, SEND_PROTOCOL } from "../../utils/enums";
import { IUserInfoSelector } from "../../utils/interfaces";
import { API_KEY_REQUEST_URL, CHATO_TOKEN, generateRandonUserId, getAccessToken, SocketStomp, toastConfig } from "../../utils/utils";

interface IChatRoomProps {
    id: number,
    roomName: string,
    previousChat: IMessageBody[],
    password?: string,
    roomOwner: number | null,
    roomOwnerId: string,
    numberOfParticipants: number,
}

interface IChatRoomInfo {
    owner: number | null, 
    ownerId: string,
    messageList?: IMessageBody[] | undefined,
    numberOfParticipants: number,
}

interface IFetchMessagesProps {
    id: number, 
    userNo: number | null, 
    count: number, 
    password?: string, 
    ipAddress?: string,
}

let socketStomp: SocketStomp;
let currentUserName: string = '';
let previousShowCnt = 0;
let timeOut: NodeJS.Timeout;

const fetchRoomOwnerAndPreviousChat = async ({
    id, 
    userNo, 
    count, 
    password, 
    ipAddress}: IFetchMessagesProps) :Promise<IChatRoomInfo> => {
    return await (await axios.post(`/room/message/${id}?offset=${count}`, { password, ipAddress, userNo })).data;
}

function ChattingRoom({ 
    id,
    roomName,
    password,
    previousChat,
    roomOwner,
    numberOfParticipants,
    roomOwnerId }: IChatRoomProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<IMessageBody[]>(previousChat);
    const [isAllChatShown, setIsAllChatShown] = useState(previousChat.length < LIMIT.CHAT_REMAIN_NUMBER);
    const [targetChatNumber, setTargetChatNumber] = useState(-1);
    const [participants, setParticipants] = useState<IParticipants[]>([]);
    const [numberOfPcps, setNumberOfPcps] = useState(numberOfParticipants);
    const { userNo, userId, userNickName } = useSelector(({ signInReducer: {userInfo} }: IUserInfoSelector) => userInfo);
    const subscribeNewMessage = () => {
        socketStomp.stomp.subscribe(`/sub/chat/room/${id}`, ({ body }: { body: string }) => {
            const newMessage: IMessageBody = JSON.parse(body);
            const isSentFromMaster = (newMessage.writer === MASTER_PROTOCOL.MASTER);
            if (isSentFromMaster && newMessage.message === MASTER_PROTOCOL.DISBANDED) {
                expelUser('This room is disbanded.');
            } else {
                const msgNo = newMessage.msgNo;
                const isParticipantsListChanged = (msgNo >= RECEIVE_PROTOCOL.SUBSCRIBE) && (msgNo <= RECEIVE_PROTOCOL.BAN);
                if (isSentFromMaster && isParticipantsListChanged)
                    reflectNewMessageAndUser(newMessage);
                else updateMessageList(newMessage);
            }
        }, { roomId: String(id), userId: (userId || currentUserName) });
    }
    const reflectNewMessageAndUser = (newMessage: IMessageBody) => {
        const msgNo = newMessage.msgNo;
        const [targetId, targetNickName] = newMessage.message.split('/');
        if (msgNo === RECEIVE_PROTOCOL.BAN) {
            if (userId ? (targetId === userId) : (targetId === currentUserName))
                expelUser('You are banned!');
            newMessage.message = `${targetId.slice(0, 9)} has been banned.`;
        } else if (msgNo !== null) {
            newMessage.message = `${targetId.slice(0, 9)} has just ${msgNo ? 'left' : 'joined'} the room.`;
            updateParticipantsList({
                id: targetId,
                nickName: (targetNickName === 'null') ? null : targetNickName,
            }, Boolean(msgNo));
        }
        updateMessageList(newMessage);
    }
    const updateMessageList = (newMessageInfo: IMessageBody) => {
        const message = newMessageInfo.message;
        const target = Number(message);
        const isSentFromMaster = (newMessageInfo.writer === MASTER_PROTOCOL.MASTER);
        if (isSentFromMaster && !window.isNaN(target)) {
            setMessages(messages => {
                const copied = [...messages];
                const targetIndex = copied.findIndex(chat => chat.msgNo === target);
                copied[targetIndex]['isDeleted'] = true;
                return copied;
            })
            return;
        } else setMessages(messages => [...messages, newMessageInfo]);
        if (!isSentFromMaster) scrollViewDown();
    };
    const scrollViewDown = () => {
        const scrollDown = (document.body.scrollHeight - document.documentElement.scrollTop < 1000);
        if (scrollDown) window.scrollTo(0, document.body.scrollHeight);
    }
    const updateParticipantsList = (targetUser: IParticipants, isUserOut: boolean) => {
        setNumberOfPcps(numberOfPcps => (isUserOut) ? (numberOfPcps - 1) : (numberOfPcps + 1));
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
        if (!isAllChatShown) {
            const { messageList: newMessages } = await fetchRoomOwnerAndPreviousChat({
                id, userNo, count: ++previousShowCnt, password
            });
            if (newMessages && newMessages.length > 0) {
                if (newMessages.length < LIMIT.CHAT_REMAIN_NUMBER) setIsAllChatShown(true);
                setTargetChatNumber(-1);
                setMessages(messages => {
                    const copied = [...newMessages.reverse(), ...messages];
                    return copied;
                })
            }
        }
    }
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
        const { status } = await axios.delete(`/room/del_message/${id}?msg_no=${msgNo}`);
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
        if (socketStomp) {
            socketStomp.stomp.send(`/pub/chat/${target}`, 
            JSON.stringify(message), 
            { sampleHeader: 'sampleHeader' });
        }
    }, [])
    const expelUser = async (sentence: string) => {
        try { if (!id) throw new Error();
            const {data: { ip }}: { data: Iipdata } = await axios.get(`${API_KEY_REQUEST_URL}${process.env.NEXT_PUBLIC_IPDATA_API_KEY}`);
            axios.post(`/user/add_banned`, {
                roomId: id,
                ipAddress: ip,
                userName: currentUserName,
            }).then(() => {
                toast.error(sentence, toastConfig);
                router.push('/chat/list');
            })
        } catch (e) { toast.error('There are some erros. Please reconnect.', toastConfig) };
    }
    const checkIfIsMyChat = useCallback(<T extends Object>(arg: T) => {
        if (typeof arg === 'string') return (arg === currentUserName);
        else if (typeof arg === 'number') return (arg === userNo);
    }, [])
    const startAndSubscribeChatting = () => {
        currentUserName = userNickName ? userNickName : generateRandonUserId();
        socketStomp.stomp.connect({}, () => { subscribeNewMessage(); });
    }
    useEffect(() => {
        socketStomp = new SocketStomp();
        if (!getAccessToken(CHATO_TOKEN))
            startAndSubscribeChatting();
        return () => {
            socketStomp.stomp.disconnect(() => null, {});
            currentUserName = '';
            previousShowCnt = 0;
            clearTimeout(timeOut);
        }
    }, []);
    useEffect(() => {if (userNo !== -1) startAndSubscribeChatting()}, [userNo]);

    /* start making props for message-components. */
    interface IMessageProps {
        prevWriter: string,
        prevTime?: string,
        isNumberMatches: boolean,
        index: number
    }
    const array: IMessageProps[] = [];
    let count = 0;
    for (const message of messages) {
        const prevWriter = messages[count - 1]?.writer;
        const prevTime = messages[count - 1]?.time;
        const isNumberMatches = (targetChatNumber === count);
        array.push({ prevWriter, prevTime, isNumberMatches, index: count });
        count ++;
    }
    const profileAndRoomInfo = { userNo, roomOwner, roomId: id };
    const comparisonLogicFunctions = { checkIfIsMyChat, deleteChat, handleChatDblClick };
    /* props making end. */
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
                myId={(userId || currentUserName)}
                myUserNo={userNo}
                roomOwner={roomOwner}
                roomOwnerId={roomOwnerId}
                setParticipants={setParticipants}
                shootChatMessage={shootChatMessage}
                numberOfPcps={numberOfPcps}
            />
            {/* 재랜더링 시 불필요한 연산을 방지하 위해, 컴포넌트로 넣는 작업이 필요해 보임. (해결) */}
            <div className="container">
                {messages.map((msg, i) => {
                    return (<MessageComponent
                        key={i}
                        msg={msg}
                        {...array[i]}
                        {...profileAndRoomInfo}
                        {...comparisonLogicFunctions}
                    />)
                }
                )}
                <InputInterface
                    socketStomp={socketStomp}
                    roomId={id}
                    isMyRoom={(roomOwner === userNo)}
                    userNo={userNo}
                    currentUserName={currentUserName}
                    shootChatMessage={shootChatMessage}
                />
                <style jsx>{`
                    textarea { 
                        width: 80%;
                        min-height: 100px;
                        border: none;
                        border-radius: 12px;
                        padding: 12px;
                        resize: vertical;
                    }
                    .time {
                        font-size: 7px;
                        color: gray;
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
                <style>{`
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
                    @media screen and (max-width: 768px) {
                        .previous-chat-show {
                            top: 130px;
                        }
                    }
                `}</style>
            </div>
        </>
    )
};

interface IServerProps { 
    params: {id: number}, 
    query: {roomName?: string, password?: string, userNo: number | null} 
}

export async function getServerSideProps({ params: { id }, query: { roomName, password, userNo }}: IServerProps) {
    let owner: (number | null);
    let ownerId: string;
    let previousChat: (IMessageBody[] | undefined);
    let numberOfParticipants;
    try {
        if (!userNo) userNo = null;
        const {data: { ip }}: { data: Iipdata } = await axios.get(`${API_KEY_REQUEST_URL}${process.env.NEXT_PUBLIC_IPDATA_API_KEY}`);
        const results = await fetchRoomOwnerAndPreviousChat({id, userNo, count: previousShowCnt, password, ipAddress: ip});
        owner = results.owner;
        ownerId = results.ownerId;
        numberOfParticipants = results.numberOfParticipants;
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
            numberOfParticipants,
        }
    };
}

export default ChattingRoom;