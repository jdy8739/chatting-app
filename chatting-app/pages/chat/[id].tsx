import React, { useEffect, useRef, useState } from "react";
import webstomp from "webstomp-client";
import Seo from "../../components/Seo";
import { generateRandonUserId } from "../../utils/utils";

interface IMessageBody {
    roomId: string,
    message: string,
    writer: string,
}

let socket: WebSocket;
let stomp: any;
let randonUserId: string = '';

const MASTER = 'MASTER';

function ChattingRoom({ id }: { id: number }) {
    let newMessage: string;
    const [messages, setMessages] = useState<IMessageBody[]>([]);
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
            stomp.send('/pub/chat/message', JSON.stringify({
                roomId: id, message: newMessage, writer: randonUserId }));
                textAreaRef.current?.setSelectionRange(0, 0);
        }
    }
    const sendMasterMessage = (isUserEntered: boolean) => {
        const masterMsg = isUserEntered ? 'joind' : 'left'
        if (socket && stomp) {
            stomp.send('/pub/chat/message', JSON.stringify({
                roomId: id, message: `${randonUserId.slice(0, 9)} has just ${masterMsg} the room.` , writer: MASTER }));
        }
    }
    const subScribeNewMessage = () => {
        stomp.subscribe(`/sub/chat/room/${id}`, ({ body }: { body: string }) => {
            const newMessage: IMessageBody = JSON.parse(body);
            updateMessageList(newMessage);
            window.scrollTo(0, document.body.scrollHeight);
        })
    };
    const updateMessageList = (newMessageInfo: IMessageBody) => {
        setMessages(messages => {
            const copied = [...messages];
            copied.push(newMessageInfo);
            return copied;
        });
    };
    useEffect(() => {
        socket = new WebSocket('ws://localhost:5000/stomp/chat');
        stomp = webstomp.over(socket);
        stomp.connect({}, () => {
            subScribeNewMessage();
            sendMasterMessage(true);
        });
        stomp.debug = () => null;
        randonUserId = generateRandonUserId();
        return () => {
            sendMasterMessage(false)
            randonUserId = '';
        }
    }, []);
    return (
        <>
            <Seo title={`Chato room ${id}`}/>
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
                                msg.writer == MASTER ?
                                <span className="master-chat">{msg.message}</span> :
                                <span 
                                    className={`chat ${msg.writer === randonUserId ? 'my-chat' : 'others-chat'}`}
                                >
                                    {msg.message}
                                </span>
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
                `}</style>
            </div>
        </>
    )
};
export function getServerSideProps({ params: { id }}: { params: { id: number }}) {
    return {
        props: { id }
    };
}

function NameOfTheChatUser({ msg }: { msg: IMessageBody }) {
    return msg.writer !== MASTER ? <h5>{msg.writer.slice(0, 9)}</h5> : null;
}

export default ChattingRoom;