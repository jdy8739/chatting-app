import React, { useEffect, useRef } from "react";
import { IUserInfo } from "../../pages/user/settings";
import { AnimatePresence, motion } from "framer-motion";
import { modalBgVariant, toastConfig } from "../../utils/utils";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

enum EXECUTE {
    ALTER_USER_INFO = 1,
    WITHDRAW = 2,
}

interface IModal {
    alteredUserInfo: IUserInfo
    handleUserSettingsSubmit: (value: IUserInfo, inputPassword: string) => Promise<boolean>,
    handleUserWithdraw: (inputPassword: string) => Promise<boolean>,
    setProtocol: (value: number) => void,
    protocol: number,
}

let timeOut: NodeJS.Timeout;

function Modal({ handleUserSettingsSubmit, handleUserWithdraw, setProtocol, protocol, alteredUserInfo }: IModal) {
    const router = useRouter();
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const stopProppagation = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();
    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        try {
            if (e.keyCode === 13) {
                const inputPassword = e.currentTarget.value;
                if (protocol === EXECUTE.ALTER_USER_INFO)
                    await handleUserSettingsSubmit(alteredUserInfo, inputPassword);
                else if (protocol === EXECUTE.WITHDRAW)
                    await handleUserWithdraw(inputPassword);
                router.push('/chat/list');
            }
        } catch (e) {
            const targetRef = modalRef.current;
            if (targetRef) {
                targetRef.classList.add('wrong-pw');
                timeOut = setTimeout(() => targetRef.classList.remove('wrong-pw'), 300);
            }
        }
    }
    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
        return () => { clearTimeout(timeOut); };
    }, []);
    return (
        <motion.div
            className="modal-bg"
            onClick={() => setProtocol(0)}
            variants={modalBgVariant}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div
                className="modal"
                onClick={stopProppagation}
                ref={modalRef}
            >
                <p>Enter your password to proceed.</p>
                <input
                    type="password"
                    className="modal-input"
                    onKeyDown={handleKeyDown}
                    ref={inputRef}
                />
            </div>
        </motion.div>
    )
}

export default Modal;