import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import webstomp from "webstomp-client";
import Seo from "../../components/commons/Seo";
import UserContainer from "../../components/[id]/UserContainer";
import { IMessageBody } from "../../types/types";
import { DISBANDED, generateRandonUserId, MASTER, setPreviousRoomId, toastConfig } from "../../utils/utils";

interface IChatRoomProps {
    id: number,
    roomName: string,
    previousChat: IMessageBody[],
    password?: string,
    roomOwner: string
}

interface IChatRoomInfo {
    owner: string,
    messageList?: IMessageBody[] | undefined,
}

let socket: WebSocket;
let stomp: any;
let randomUserId: string = '';
let previousShowCnt = 0;

const fetchRoomOwnerAndPreviousChat = async (id: number, count: number, password?: string) => {
    const { owner, messageList }: IChatRoomInfo = await (await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/room/message/${id}?offset=${count}`, { password })).data;
    messageList?.reverse();
    return { owner, messageList };
}

function ChattingRoom({ id, roomName, password, previousChat, roomOwner }: IChatRoomProps) {
    let newMessage: string;
    const router = useRouter();
    const [messages, setMessages] = useState<IMessageBody[]>(previousChat);
    const [isAllChatShown, setIsAllChatShown] = useState(previousChat.length < 10);
    const [targetChatNumber, setTargetChatNumber] = useState(-1);
    const [participants, setParticipants] = useState<string[]>([]);
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
            const now = new Date();
            const time = `${now.getHours()}:${now.getMinutes()}`;
            shootChatMessage('message', {
                msgNo: 0,
                roomId: String(id), 
                message: newMessage,
                writer: randomUserId, 
                time: time
            });
            textAreaRef.current?.setSelectionRange(0, 0);
        }
    }
    const subscribeNewMessage = () => {
        stomp.subscribe(`/sub/chat/room/${id}`, ({ body }: { body: string }) => {
            const newMessage: IMessageBody = JSON.parse(body);
            const isSentFromMaster = (newMessage.writer === MASTER);
            const msgNo = newMessage.msgNo;
            if (isSentFromMaster && newMessage.message === DISBANDED) {
                expelUser('This room is disbanded.');
                return;
            }
            if (isSentFromMaster && (msgNo >= 0 && msgNo <= 2)) {
                const targetId = newMessage.message;
                if (msgNo === 2) {
                    if (targetId === randomUserId) expelUser('You are banned!');
                    newMessage.message = `${targetId.slice(0, 9)} has been banned.`;
                } else newMessage.message = `${targetId.slice(0, 9)} has just ${msgNo ? 'left' : 'joined'} the room.`;
                if (targetId !== randomUserId) updateParticipantsList(targetId, Boolean(msgNo));
            }
            updateMessageList(newMessage);
            window.scrollTo(0, document.body.scrollHeight);
        }, { roomId: id, userId: randomUserId })
    };
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
    const updateParticipantsList = (targetUserId: string, isUserOut: boolean) => {
        setParticipants(participants => {
            if (isUserOut) {
                const targetIndex = participants.findIndex(participant => participant === targetUserId);
                if (targetIndex === -1) return participants;
                participants.splice(targetIndex, 1);
            } else participants.push(targetUserId);
            return [...participants];
        })
    }
    const showPreviousChat = async () => {
        setTargetChatNumber(-1);
        previousShowCnt += 1;
        const { messageList } = await fetchRoomOwnerAndPreviousChat(id, previousShowCnt, password);
        if (messageList) {
            if (messageList.length < 10) {
                setIsAllChatShown(true);
            }
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
            shootChatMessage('delete', {
                msgNo: 0,
                roomId: String(id), 
                message: String(msgNo),
                writer: MASTER,
            })
            setTargetChatNumber(-1);
        }
    }
    const shootChatMessage = (target: string, message: IMessageBody) => {
        if (socket && stomp) {
            stomp.send(`/pub/chat/${target}`, JSON.stringify(message));
        }
    }
    const expelUser = (sentence: string) => {
        toast.error(sentence, toastConfig);
        router.push('/chat/list');
    }
    useEffect(() => {
        randomUserId = generateRandonUserId();
        socket = new WebSocket('ws://localhost:5000/stomp/chat');
        stomp = webstomp.over(socket);
        stomp.connect({}, () => {
            subscribeNewMessage();
        });
        stomp.debug = () => null;
        setPreviousRoomId(id);
        return () => {
            stomp.disconnect(() => null, {});
            randomUserId = '';
            previousShowCnt = 0;
        }
    }, []);
    return (
        <>
            <Seo title={`Chato room ${roomName}`} />
            {
                isAllChatShown ||
                <div
                    className="previous-chat-show"
                    onClick={showPreviousChat}
                >
                    <h4>show previous</h4>
                </div>
            }
            <UserContainer
                roomId={id}
                participants={participants}
                setParticipants={setParticipants}
                myId={randomUserId}
                isMyOwnRoom={randomUserId === roomOwner}
            />
            <div className="container">
                {
                    messages.map((msg, i) => 
                        <div key={i} 
                            className={`chat-box ${msg.writer === randomUserId ? 'my-chat-box' : 'others-chat-box'}`}
                        >   
                            {
                                i === 0 ? <NameOfTheChatUser msg={msg}/> :
                                messages[i - 1].writer !== msg.writer && 
                                <NameOfTheChatUser msg={msg}/>
                            }
                            {
                                msg.writer === MASTER ?
                                <span className="master-chat">{msg.message}</span> :
                                <>
                                    {i !== 0 && 
                                    messages[i - 1].time !== msg.time && 
                                    msg.writer === randomUserId &&
                                    <ChatTimeComponent 
                                        time={msg.time || ''}
                                        isMyMessage={msg.writer === randomUserId}
                                    />}
                                    <span
                                        onDoubleClick={() => msg.writer === randomUserId ? handleChatDblClick(i) : null}
                                        className={`chat 
                                        ${msg.writer === randomUserId ? 'my-chat' : 'others-chat'}
                                        ${msg.isDeleted ? 'deleted-chat' : ''}
                                        `}
                                    >
                                        {!msg.isDeleted && targetChatNumber === i &&
                                        <span
                                            onClick={() => deleteChat(id, msg.msgNo)}
                                            className="delete-btn">x
                                        </span>}
                                        {msg.isDeleted ? 'deleted message' : msg.message}
                                    </span>
                                    {i !== 0 && 
                                    messages[i - 1].time !== msg.time && 
                                    msg.writer !== randomUserId &&
                                    <ChatTimeComponent 
                                        time={msg.time || ''}
                                        isMyMessage={msg.writer === randomUserId} 
                                    />}
                                </>
                            }
                        </div>
                    )
                }
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
    let owner: string;
    let previousChat: IMessageBody[] | undefined;
    try {
        const results = await fetchRoomOwnerAndPreviousChat(id, previousShowCnt, password);
        owner = results.owner;
        previousChat = results.messageList;
        previousChat?.forEach(chat => {if (chat.isDeleted) chat.message = ''});
    } catch (e) {
        console.log(`Failed to fetch previous chat of room id ${id}.`);
        return {
            redirect: {
                permanent: false,
                destination: "/chat/list",
            },
            props:{},
        };
    }
    return {
        props: {
            id,
            roomName: roomName || '',
            previousChat: previousChat ? previousChat : [],
            password: password || null,
            roomOwner: owner,
        }
    };
}

function NameOfTheChatUser({ msg }: { msg: IMessageBody }) {
    return msg.writer !== MASTER ? <h5>{msg.writer.slice(0, 9)}</h5> : null;
}

function ChatTimeComponent({ time, isMyMessage }: { time: string, isMyMessage: boolean }) {
    return (
        <span>
            { !isMyMessage && <>&ensp;</> }
            <span className="time">{time}</span>
            { isMyMessage && <>&ensp;</> }
        </span>
    )
}

export default ChattingRoom;