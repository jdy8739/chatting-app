import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { IMessageBody } from "../../types/types";
import { LIMIT, MASTER_PROTOCOL, SEND_PROTOCOL } from "../../utils/enums";
import { getNowTime, modalBgVariant, requestWithTokenAxios, SocketStomp, toastConfig } from "../../utils/utils";

let imageFile: ArrayBuffer | null;

interface IInputInterface {
    socketStomp: SocketStomp,
    roomId: number,
    isMyRoom: boolean,
    userNo: number,
    currentUserName: string,
    shootChatMessage: (target: SEND_PROTOCOL, message: IMessageBody) => void
}

const handleReaderOnLoad = (readerEvent: ProgressEvent<FileReader>) => {
    const result = readerEvent.target?.result;
    if (result && typeof result !== 'string') {
        imageFile = new Uint8Array(result);
    }
}

function InputInterface({ 
    socketStomp,
    roomId,
    isMyRoom,
    userNo,
    currentUserName,
    shootChatMessage }: IInputInterface) {
    let newMessage: string;
    const [isModalShown, setIsModalShown] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files) {
            const targetFile = e.currentTarget.files[0];
            const fileReader = new FileReader();
            fileReader.onload = handleReaderOnLoad;
            if (fileReader && targetFile) fileReader.readAsArrayBuffer(targetFile);
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
            if (socketStomp) {
                socketStomp.stomp.send(`/pub/chat/${SEND_PROTOCOL.BINARY}`,
                imageFile,
                headers)
            }
            imageFile = null;
            if (fileInputRef.current) fileInputRef.current.value = '';
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
        if (socketStomp) {
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
    const handleRoomSettings = () => setIsModalShown(true);
    const terminateChatRoom = () => {
        requestWithTokenAxios.delete(`/room/delete/${roomId}`)
        .then(() => {
            if (socketStomp)
                socketStomp.stomp.send(`/pub/chat/${SEND_PROTOCOL.DELETE}`,
                JSON.stringify({
                    msgNo: 0,
                    roomId: String(roomId),
                    message: MASTER_PROTOCOL.DISBANDED,
                    writer: MASTER_PROTOCOL.MASTER,
                    writerNo: null,
                }));
        })
    }
    const stopProppagation = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();
    useEffect(() => {
        return () => { imageFile = null; };
    }, [])
    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleOnChange}
            />
            <button
                className="picture-submit"
                onClick={shootBinaryImageMessage}
            >send picture</button>
            <span className="buttons">
                {isMyRoom &&
                <>
                    <button onClick={handleRoomSettings}>settings</button>
                    <button onClick={terminateChatRoom}>terminate</button>
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
            <AnimatePresence>
                {isModalShown &&
                <motion.div
                    className="modal-bg"
                    variants={modalBgVariant}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    onClick={() => setIsModalShown(false)}
                >
                    <div
                        className="modal settings"
                        onClick={stopProppagation}
                    >
                        <SettingsContent
                            roomId={roomId}
                            setIsModalShown={setIsModalShown}
                        />
                    </div>
                </motion.div>}
            </AnimatePresence>
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
                    .settings {
                        height: 265px;
                    }
                `}</style>
        </>
    )
}

export default InputInterface;

interface IRoomSettings { 
    password: string, 
    pwRequired: boolean, 
    limitation: number
};

function SettingsContent({
    roomId,
    setIsModalShown }: { 
        roomId: number,
        setIsModalShown: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [settingOption, setSettingOption] = useState(true);
    const [usePassword, setUsePassword] = useState(false);
    const { 
        getValues, 
        setValue,
        register,
        formState: { errors },
        handleSubmit } = useForm<IRoomSettings>({
        defaultValues: { password: '', pwRequired: false, limitation: 15 }
    });
    const [isRendered, setIsReRendered] = useState(false);
    const showNowLimitValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue('limitation', +e.currentTarget.value);
        setIsReRendered(!isRendered);
    }
    const submitSettingsChange = async ({ password, pwRequired, limitation }: IRoomSettings) => {
        const { status } = await requestWithTokenAxios.put(`/room/settings`, {
            settingOption, 
            pwRequired, 
            value: settingOption ? password : limitation,
            roomId,
        })
        if (status === 200) setIsModalShown(false);
    }
    return (
        <>
            <br></br>
            <div>
                <button
                    onClick={() => setSettingOption(true)}
                    style={{ color: settingOption ? 'orange' : 'rgb(0, 219, 146)' }}
                >password</button>
                &emsp;
                <button
                    onClick={() => setSettingOption(false)}
                    style={{ color: !settingOption ? 'orange' : 'rgb(0, 219, 146)' }}
                >capacity</button>
            </div>
            <form onSubmit={handleSubmit(submitSettingsChange)}>
                {settingOption ?
                <div>
                    <p>Set the room password.</p>
                    <span className="small">use password</span>
                    <input
                        type="checkbox"
                        {...register('pwRequired', {
                            onChange: () => setUsePassword(!usePassword),
                        })}
                    />
                    <input
                        className="input-box"
                        type="password"
                        maxLength={15}
                        {...register('password', {
                            maxLength: {
                                value: 15,
                                message: 'Password length cannot exceeds 15.',
                            }
                        })}
                        placeholder="Input new password."
                        disabled={!usePassword}
                    />
                    <div className="error-message">{errors.password?.message}</div>
                </div> :
                <div>
                    <p>Rearrange the room capacity.</p>
                    <input
                        className="input-box"
                        type="range"
                        min={2}
                        max={30}
                        {...register('limitation', {
                            min: {
                                value: 2,
                                message: 'The room capacity is 2 at least.'
                            },
                            max: {
                                value: 30,
                                message: 'The room capacity cannot exceeds 30.'
                            },
                            onChange: showNowLimitValue,
                        })}
                    />
                    &emsp;
                    <div className="error-message">{errors.limitation?.message}</div>
                    <span className="small">capacity {getValues('limitation')}</span>
                </div>}
                <button type="submit">apply</button>
            </form>
            <style jsx>{`
                .small {
                    font-size: 12px;
                }
            `}</style>
        </>
    )
}

