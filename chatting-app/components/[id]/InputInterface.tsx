import Link from "next/link";
import { useRef } from "react";
import { toast } from "react-toastify";
import { Client } from "webstomp-client";
import { LIMIT, SEND_PROTOCOL } from "../../pages/chat/[id]";
import { IMessageBody } from "../../types/types";
import { getNowTime, toastConfig } from "../../utils/utils";

let imageFile: ArrayBuffer;

interface IInputInterface {
    socket: WebSocket,
    stomp: Client,
    roomId: number,
    isMyRoom: boolean,
    userNo: number,
    currentUserName: string,
    shootChatMessage: (target: SEND_PROTOCOL, message: IMessageBody) => void
}

function InputInterface({ socket, stomp, roomId, isMyRoom, userNo, currentUserName, shootChatMessage }: IInputInterface) {
    let newMessage: string;
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
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
        } else if (imageFile.byteLength > LIMIT.STMOP_MESSAGE_SIZE) {
            toast.error('The picture size exceeds the limit.', toastConfig);
        } else {
            const headers = { 
                'content-type': 'application/octet-stream',
                'image-size': (imageFile.byteLength),
                'room-id': roomId,
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
                roomId: String(roomId),
                message: newMessage,
                writer: currentUserName,
                writerNo: (userNo > 0) ? userNo : null,
                time: getNowTime(),
            });
            textAreaRef.current?.setSelectionRange(0, 0);
        }
    }
    return (
        <>
            <input
                type="file"
                onChange={handleOnChange}
            />
            <button
                className="picture-submit"
                onClick={shootBinaryImageMessage}
            >send picture</button>
            <span className="buttons">
                {isMyRoom &&
                <>
                    <button>settings</button>
                    <button>terminate</button>
                </>}
                <Link href="/chat/list"><button>exit</button></Link>
            </span>
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
            <style jsx>{`
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
                    .picture-submit {
                        border: 1px solid rgb(0, 219, 146);
                    }
                    .submit-button {
                        width: 20%;
                        margin: 0;
                        font-size: 20px;
                        font-weight: bold;
                    }
                    .buttons {
                        float: right;
                        color: orange;
                    }
                `}</style>
        </>
    )
}

export default InputInterface;