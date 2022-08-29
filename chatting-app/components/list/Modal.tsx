import axios from "axios";
import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { modalBgVariant, toastConfig } from "../../utils/utils";

interface IModal {
    roomId?: number,
    query: string, 
    hideModal: () => void, 
    pushToChatRoom?: (password?: string) => void
    addSubjectTable?: (newTableName: string) => void,
}

let timeOut: NodeJS.Timeout;

function Modal({ roomId, query, hideModal, pushToChatRoom, addSubjectTable }: IModal) {
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();
    const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            if (roomId) submitPassword();
            else makeRoomSubjectTable();
        }
    }
    const submitPassword = async () => {
        const { data } = await axios.post(`/room/enter_password`, {
            roomId: roomId,
            password: inputRef.current?.value,
        });
        if (data && pushToChatRoom) {
            pushToChatRoom(inputRef.current?.value);
            hideModal();
        }
        else {
            const targetRef = modalRef.current;
            if (targetRef) {
                targetRef.classList.add('wrong-pw');
                timeOut = setTimeout(() => targetRef.classList.remove('wrong-pw'), 300);
                toast.error('Password is not correct.', toastConfig);
            }
        }
    }
    const makeRoomSubjectTable = () => {
        const newTableName = inputRef.current?.value;
        if (newTableName && addSubjectTable) addSubjectTable(newTableName);
    }
    useEffect(() => {
        inputRef.current?.focus();
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
                    placeholder={(roomId) ? "Input room password." : "Input new subject name."}
                    onKeyUp={handlePressEnter}
                    ref={inputRef}
                />
            </div>
        </motion.div>
    )
}

export default Modal;