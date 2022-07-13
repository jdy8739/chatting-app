import axios from "axios";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useRef } from "react";

interface IModal {
    roomId: number,
    query: string, 
    hideModal: () => void, 
    pushToChatRoom: (password?: string) => void
}

function Modal({ roomId, query, hideModal, pushToChatRoom }: IModal) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();
    const submitPassword = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            const isPwValid = await (await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/room/enter_password`, {
                roomId: roomId,
                password: inputRef.current?.value
            })).data;
            if (isPwValid)
                pushToChatRoom(inputRef.current?.value);
        }
    }
    return (
        <>
            <motion.div
                className="modal-bg"
                onClick={hideModal}
            >
                <div
                    className="modal"
                    onClick={stopPropagation}
                >
                    <p>{query}</p>
                    <input 
                        placeholder="Input room password."
                        onKeyUp={submitPassword}
                        ref={inputRef}
                    />
                </div>
            </motion.div>
            <style>{`
                .modal-bg {
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(0, 0, 0, 0.25);
                    position: fixed;
                    top: 0;
                    left: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .modal {
                    width: 400px;
                    height: 90px;
                    background-color: #efefef;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 2px 2px 2px gray;
                }
                input {
                    width: 200px;
                }
            `}</style>
        </>
    )
}

export default Modal;