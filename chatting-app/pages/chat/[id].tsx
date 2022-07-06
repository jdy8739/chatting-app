import React, { useEffect, useRef, useState } from "react";
import webstomp from "webstomp-client";
import Seo from "../../components/Seo";

interface IMessageBody {
    roomId: string,
    message: string,
    writer: string,
}

let socket: WebSocket;
let stomp: any;

function ChattingRoom({ id }: { id: number }) {
    let newMessage: string;
    const [messages, setMessages] = useState<IMessageBody[]>([]);
    const formRef = useRef<HTMLInputElement>(null);
    const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formRef.current) {
            newMessage = formRef.current.value;
            formRef.current.value = '';
        }
        if (socket && stomp) {
            stomp.send('/pub/chat/message', JSON.stringify({
                roomId: id, message: newMessage, writer: 'jdy8739' }));
        }
    };
    const updateMessageList = (newMessageInfo: IMessageBody) => {
        setMessages(messages => {
            const copied = [...messages];
            copied.push(newMessageInfo);
            return copied;
        });
    }
    const subScribeNewMessage = () => {
        stomp.subscribe(`/sub/chat/room/${id}`, ({ body }: { body: string }) => {
            const newMessage: IMessageBody = JSON.parse(body);
            updateMessageList(newMessage);
        })
    };
    useEffect(() => {
        socket = new WebSocket('ws://localhost:5000/stomp/chat');
        stomp = webstomp.over(socket);
        stomp.connect({}, subScribeNewMessage);
    }, [ ]);
    return (
        <>
            <Seo title={`Chato room ${id}`}/>
            {
                messages.map((msg, i) => <p key={i}>{msg.message}</p>)
            }
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