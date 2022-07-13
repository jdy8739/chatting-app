import axios from "axios";
import { Router, useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import webstomp from "webstomp-client";
import Seo from "../../components/Seo";
import { generateRandonUserId } from "../../utils/utils";

interface IMessageBody {
    roomId: string,
    message: string,
    writer: string,
    time?: string,
    isDeleted?: boolean,
}

interface IChatRoomProps {
    id: number,
    roomName: string,
    previousChat: IMessageBody[],
    password?: string
}

let socket: WebSocket;
let stomp: any;
let randonUserId: string = '';
let previousShowCnt = 0;

const MASTER = 'MASTER';
const REJECTED = 'rejected';

const fetchPreviousChat = async (id: number, count: number, password?: string) => {
    const previousChat = await (await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/room/message/${id}?offset=${count}`, { password })).data;
    previousChat?.reverse();
    return previousChat;
}

function ChattingRoom({ id, roomName, password, previousChat }: IChatRoomProps) {
    let newMessage: string;
    const router = useRouter();
    const [messages, setMessages] = useState<IMessageBody[]>(previousChat);
    const [isAllChatShown, setIsAllChatShown] = useState(previousChat.length < 10);
    const [targetChatNumber, setTargetChatNumber] = useState(-1);
    const [isModalShown, setIsModalShown] = useState(false);
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
            stomp.send('/pub/chat/message', JSON.stringify({
                roomId: id, 
                message: newMessage,
                writer: randonUserId, 
                time: time
            }));
            textAreaRef.current?.setSelectionRange(0, 0);
        }
    }
    const sendMasterMessage = (isUserEntered: boolean) => {
        const masterMsg = isUserEntered ? 'joined' : 'left'
        if (socket && stomp) {
            stomp.send('/pub/chat/enter_or_leave', JSON.stringify({
                roomId: id, message: `${randonUserId.slice(0, 9)} has just ${masterMsg} the room.`, writer: MASTER }));
        }
    }
    const subscribeNewMessage = () => {
        stomp.subscribe(`/sub/chat/room/${id}`, ({ body }: { body: string }) => {
            const newMessage: IMessageBody = JSON.parse(body);
            updateMessageList(newMessage);
            window.scrollTo(0, document.body.scrollHeight);
        })
    };
    const updateMessageList = (newMessageInfo: IMessageBody) => {
        if (newMessageInfo.writer === MASTER && newMessageInfo.message === REJECTED) {
            stomp.disconnect(() => {
                router.push('/chat/list');
            }, {})
            return;
        }
        setMessages(messages => {
            const copied = [...messages];
            copied.push(newMessageInfo);
            return copied;
        });
    };
    const showPreviousChat = async () => {
        setTargetChatNumber(-1);
        previousShowCnt += 1;
        const previousChat = await fetchPreviousChat(id, previousShowCnt, password);
        if (previousChat) {
            if (previousChat.length < 10) {
                setIsAllChatShown(true);
            }
            setMessages(messages => {
                const copied = [...previousChat, ...messages];
                return copied;
            })
        }
    };
    const handleChatDblClick = (index: number) => {
        if (index === targetChatNumber) setTargetChatNumber(-1);
        else setTargetChatNumber(index);
    }
    const deleteChat = () => {
        
    }
    useEffect(() => {
        socket = new WebSocket('ws://localhost:5000/stomp/chat');
        stomp = webstomp.over(socket);
        stomp.connect({}, () => {
            subscribeNewMessage();
            sendMasterMessage(true);
        });
        stomp.debug = () => null;
        randonUserId = generateRandonUserId();
        return () => {
            sendMasterMessage(false);
            randonUserId = '';
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
            <div className="container">
                {
                    messages.map((msg, i) => 
                        <div key={i} 
                            className={`chat-box ${msg.writer === randonUserId ? 'my-chat-box' : 'others-chat-box'}`}
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
                                    msg.writer === randonUserId &&
                                    <ChatTimeComponent 
                                        time={msg.time || ''}
                                        isMyMessage={msg.writer === randonUserId} 
                                    />}
                                    <span
                                        onDoubleClick={() => msg.writer === randonUserId ? handleChatDblClick(i) : null}
                                        className={`chat ${msg.writer === randonUserId ? 'my-chat' : 'others-chat'}`}
                                    >
                                        {targetChatNumber === i && 
                                        <span
                                            onClick={() => deleteChat()}
                                            className="delete-btn">x
                                        </span>}
                                        {msg.message}
                                    </span>
                                    {i !== 0 && 
                                    messages[i - 1].time !== msg.time && 
                                    msg.writer !== randonUserId &&
                                    <ChatTimeComponent 
                                        time={msg.time || ''}
                                        isMyMessage={msg.writer === randonUserId} 
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
                        top: 55px;
                        opacity: 0.3;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
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
    let previousChat: IMessageBody[] | undefined;
    try {
        previousChat = await fetchPreviousChat(id, previousShowCnt, password);
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
            password: password || null
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