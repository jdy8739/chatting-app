import React, { useRef } from "react";

function ChattingRoom() {
    const formRef = useRef<HTMLInputElement>(null);
    const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(formRef.current)
            formRef.current.value = '';
    };
    return (
        <>
            <form onSubmit={handleChatSubmit}>
                <input ref={formRef} />
                <button>submit</button>
            </form>
        </>
    )
};

export default ChattingRoom;