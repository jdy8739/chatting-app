import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import React, { useRef, useState } from "react";

interface IModal {
    roomId: number,
    query: string, 
    hideModal: () => void, 
    pushToChatRoom: (password?: string) => void
}

const modalBgVariant = {
    initial: {
        opacity: 0
    },
    animate: {
        opacity: 1
    },
    exit: {
        opacity: 0
    }
}

function Modal({ roomId, query, hideModal, pushToChatRoom }: IModal) {
    const modalRef = useRef<HTMLDivElement>(null);
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
            else {
                const targetRef = modalRef.current;
                if (targetRef) {
                    targetRef.classList.add('wrong-pw');
                    setTimeout(() => targetRef.classList.remove('wrong-pw'), 300);
                }
            }
        }
    }
    return (
        <>
            <motion.div
                className="modal-bg"
                onClick={hideModal}
                variants={modalBgVariant}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <AnimatePresence>
                    <motion.div
                        className="modal"
                        onClick={stopPropagation}
                        ref={modalRef}
                    >
                        <p>{query}</p>
                        <input 
                            placeholder="Input room password."
                            onKeyUp={submitPassword}
                            ref={inputRef}
                        />
                    </motion.div>
                </AnimatePresence>
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
                    z-index: 99;
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
                .wrong-pw {
                    animation-name: shake;
                    animation-duration: 0.3s;
                }
                @keyframes shake {
                    0% {
                        transform: translateX(0px)
                    }
                    20% {
                        transform: translateX(30px)
                    }
                    40% {
                        transform: translateX(-30px)
                    }
                    60% {
                        transform: translateX(30px)
                    }
                    80% {
                        transform: translateX(-30px)
                    }
                    100% {
                        transform: translateX(0px)
                    }
                }
            `}</style>
        </>
    )
}

export default Modal;