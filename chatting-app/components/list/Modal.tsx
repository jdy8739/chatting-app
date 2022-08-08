import axios from "axios";
import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { modalBgVariant, toastConfig } from "../../utils/utils";

interface IModal {
    roomId: number,
    query: string, 
    hideModal: () => void, 
    pushToChatRoom: (password?: string) => void
}

let timeOut: NodeJS.Timeout;

function Modal({ roomId, query, hideModal, pushToChatRoom }: IModal) {
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();
    const submitPassword = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/room/enter_password`, {
                roomId: roomId,
                password: inputRef.current?.value
            });
            if (data) pushToChatRoom(inputRef.current?.value);
            else {
                const targetRef = modalRef.current;
                if (targetRef) {
                    targetRef.classList.add('wrong-pw');
                    timeOut = setTimeout(() => targetRef.classList.remove('wrong-pw'), 300);
                    toast.error('Password is not correct, or the number of participant exceeds limit.', toastConfig);
                }
            }
        }
    }
    useEffect(() => {
        return () => { clearTimeout(timeOut); };
    }, [])
    return (
        <motion.div
            className="modal-bg"
            onClick={hideModal}
            variants={modalBgVariant}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div
                className="modal"
                onClick={stopPropagation}
                ref={modalRef}
            >
                <p>{query}</p>
                <input
                    className="modal-input"
                    placeholder="Input room password."
                    onKeyUp={submitPassword}
                    ref={inputRef}
                />
            </div>
        </motion.div>
    )
}

export default Modal;