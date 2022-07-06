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

function ChattingRoom({ id }: { id: number }) {
    let newMessage: string;
    const [messages, setMessages] = useState<IMessageBody[]>([]);
    const formRef = useRef<HTMLInputElement>(null);
    const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formRef.current?.value === '') return;
        if (formRef.current) {
            newMessage = formRef.current.value;
            formRef.current.value = '';
        }
        if (socket && stomp) {
            stomp.send('/pub/chat/message', JSON.stringify({
                roomId: id, message: newMessage, writer: randonUserId }));
        }
    };
    const updateMessageList = (newMessageInfo: IMessageBody) => {
        setMessages(messages => {
            const copied = [...messages];
            copied.push(newMessageInfo);
            return copied;
        });
    };
    const subScribeNewMessage = () => {
        stomp.subscribe(`/sub/chat/room/${id}`, ({ body }: { body: string }) => {
            const newMessage: IMessageBody = JSON.parse(body);
            updateMessageList(newMessage);
            window.scrollTo(0, document.body.scrollHeight);
        })
    };
    useEffect(() => {
        socket = new WebSocket('ws://localhost:5000/stomp/chat');
        stomp = webstomp.over(socket);
        stomp.connect({}, subScribeNewMessage);
        randonUserId = generateRandonUserId();
        return () => {
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
                            <span 
                                className={`chat ${msg.writer === randonUserId ? 'my-chat' : 'others-chat'}`}
                            >
                                {`${msg.writer.slice(0, 9)} ${msg.message}`}
                            </span>
                        </div>
                    )
                }
            </div>
            <form onSubmit={handleChatSubmit}>
                <input ref={formRef} />
                <button>submit</button>
            </form>
        </>
    )
};
export function getServerSideProps({ params: { id }}: { params: { id: number }}) {
    return {
        props: { id }
    };
}

export default ChattingRoom;