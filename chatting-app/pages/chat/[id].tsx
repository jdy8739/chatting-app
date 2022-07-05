import { useRouter } from "next/router";
import React, { useRef } from "react";
import { io } from "socket.io-client";
import SockJS from "sockjs-client";
import Seo from "../../components/Seo";

function ChattingRoom({ id }: { id: number }) {
    const formRef = useRef<HTMLInputElement>(null);
    const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(formRef.current)
            formRef.current.value = '';
    };
    var sock = new SockJS("http://localhost:5000/ws/chat");
    return (
        <>
            <Seo title={`Chato room ${id}`}/>
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