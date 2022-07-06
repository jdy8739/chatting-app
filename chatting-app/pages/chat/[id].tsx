import React, { useEffect, useRef, useState } from "react";
import webstomp from "webstomp-client";
import Seo from "../../components/Seo";

let socket: WebSocket;
let stomp: any;

function ChattingRoom({ id }: { id: number }) {
    let newMessage: string;
    const [messages, setMessages] = useState<string[]>([]);
    const formRef = useRef<HTMLInputElement>(null);
    const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formRef.current) {
            newMessage = formRef.current.value;
            formRef.current.value = '';
        }
        if (socket && stomp) {
            stomp.send('/pub/chat/message', JSON.stringify({
                roomId: '11', message: newMessage, writer: 'jdy8739' }));
        }
    };
    const onMessage = (msgEvent: MessageEvent) => {
        setMessages(messages => {
            const copied = [...messages];
            copied.push(msgEvent.data);
            return copied;
        });
    }
    useEffect(() => {
        socket = new WebSocket('ws://localhost:5000/stomp/chat');
        stomp = webstomp.over(socket);
        stomp.connect({}, () => {
            stomp.subscribe(`/sub/chat/room/11`, (chat: any) => {
                console.log(chat);
            })
        })
    }, [])
    return (
        <>
            <Seo title={`Chato room ${id}`}/>
            {
                messages.map((msg, i) => <p key={i}>{msg}</p>)
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