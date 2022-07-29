import React, { useRef } from "react";
import { IUserInfo } from "../../pages/user/settings";
import { AnimatePresence, motion } from "framer-motion";
import { modalBgVariant } from "../../utils/utils";

interface IModal {
    alteredUserInfo: IUserInfo
    handleUserSettingsSubmit: (value: IUserInfo, inputPassword: string) => Promise<boolean | undefined>,
    handleUserWithdraw: (inputPassword: string) => Promise<boolean | undefined>,
    setProtocol: (value: number) => void,
    protocol: number,
}

const EXECUTE_ALTER_USER_INFO = 1;

const EXECUTE_WITHDRAW = 2;

function Modal({ handleUserSettingsSubmit, handleUserWithdraw, setProtocol, protocol, alteredUserInfo }: IModal) {
    const modalRef = useRef<HTMLDivElement>(null);
    const stopProppagation = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();
    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === 13) {
            const inputPassword = e.currentTarget.value;
            let response: boolean = false;
            if (protocol === EXECUTE_ALTER_USER_INFO) {
                const result = await handleUserSettingsSubmit(alteredUserInfo, inputPassword);
                if (result !== undefined) response = result;
            } else if (protocol === EXECUTE_WITHDRAW) {
                const result = await handleUserWithdraw(inputPassword);
                if (result !== undefined) response = result;
            }
            if (!response) {
                const targetRef = modalRef.current;
                if (targetRef) {
                    targetRef.classList.add('wrong-pw');
                    setTimeout(() => targetRef.classList.remove('wrong-pw'), 300);
                }
            }
        }
    }
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
                />
            </div>
        </motion.div>
    )
}

export default Modal;