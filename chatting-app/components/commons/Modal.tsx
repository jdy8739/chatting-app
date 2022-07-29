import axios from "axios";
import React, { useRef } from "react";
import { toast } from "react-toastify";
import { IUserInfo } from "../../pages/user/settings";
import { toastConfig } from "../../utils/utils";

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
            try {
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
            } catch (e) {
                toast.error('Please check your sign in status.', toastConfig);
            };
        }
    }
    return (
        <div
            className="modal-bg"
            onClick={() => setProtocol(0)}
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
        </div>
    )
}

export default Modal;