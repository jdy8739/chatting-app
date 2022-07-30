import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { clearPreviousRoomId, toastConfig } from "../../utils/utils";

const roomSubjectOptions = [
    'life', 'sports', 'study', 'jobs', 'leisure', 'dish', 'tour', 'economy', 'world', 'art', 'music', 'else'
];

function CreateChat() {
    const router = useRouter();
    const [isRendered, setIsRendered] = useState(false);
    const [isSubjectInputDisabled, setIsSubjectInputDisabled] = useState(true);
    const [isSubjectSelectDisabled, setIsSubjectSelectDisabled] = useState(false);
    const [limit, setLimit] = useState(15);
    const [isPwRequired, setisPwRequired] = useState(false);
    const roomNameInputRef = useRef<HTMLInputElement>(null);
    const subjectInputRef = useRef<HTMLInputElement>(null);
    const subjectSelectRef = useRef<HTMLSelectElement>(null);
    const pwInputRef = useRef<HTMLInputElement>(null);
    const userId = useSelector(({ signInReducer: {id} }: { signInReducer: {id: string} }) => id);
    const handleChkBoxValue = (e: React.MouseEvent<HTMLInputElement>) => {
        const checked = e.currentTarget?.checked;
        if (checked) {
            setIsSubjectSelectDisabled(true);
            setIsSubjectInputDisabled(false);
        } else {
            setIsSubjectSelectDisabled(false);
            setIsSubjectInputDisabled(true);
        }
    }
    const handleLimitOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLimit(+e.currentTarget.value);
    }
    const handlePwRequiredOnChange = (e: React.MouseEvent<HTMLInputElement>) => {
        setisPwRequired(e.currentTarget.checked);
    }
    const submitRoomForm = async () => {
        const roomName = roomNameInputRef.current?.value;
        const subject = isSubjectInputDisabled ? subjectSelectRef.current?.value : subjectInputRef.current?.value;
        const password = pwInputRef.current?.value
        if (!checkFormValidation(roomName, subject, password)) return;
        const { status } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/room/create`, {
            roomName: roomName,
            subject: subject,
            limitation: limit,
            pwRequired: isPwRequired,
            password: isPwRequired ? pwInputRef.current?.value : null,
            owner: userId ? userId : null,
        })
        if (status === 200) {
            toast.success('The room has been created!', toastConfig);
            router.push('/chat/list');
        } else toast.error('There might be an error in the server. Please try later. :(', toastConfig);
    }
    const checkFormValidation = (roomName?: string, subject?: string, password?: string) :boolean => {
        if (!roomName) {
            toast.error('We need your new chat room name.', toastConfig);
            return false;
        } else if (!subject) {
            toast.error('Subject is required. :(', toastConfig);
            return false;
        } else if (isPwRequired && !password) {
            toast.error('Password is required. :(', toastConfig);
            return false;
        }
        else return true;
    };
    useEffect(() => {
        setIsRendered(true);
        clearPreviousRoomId();
    }, []);
    return (
        <div className="all">
            <form className="submit-form">
                <h4 className="title">Make your own chat room :)</h4>
                <div className="form-body">
                    <label>
                        <input
                            className="input-box"
                            placeholder="name of chat room."
                            style={{ width: '100%' }}
                            ref={roomNameInputRef}
                        />
                    </label>
                    <div>
                        <label>
                            <div>
                                <span 
                                    className="item">Make a custom suject?</span>
                                <input
                                    className="input-box"
                                    type="checkbox"
                                    onClick={handleChkBoxValue}
                                />
                            </div>
                        </label>
                    </div>
                    <label>
                        <select
                            className="input-box"
                            disabled={isSubjectSelectDisabled}
                            ref={subjectSelectRef}
                        >
                            {roomSubjectOptions.map(sbj => 
                                <option key={sbj}>{sbj}</option>)}
                        </select>
                        &emsp;
                        <input
                            className="input-box"
                            placeholder="Other kind of subject?"
                            style={{ width: '240px' }}
                            disabled={isSubjectInputDisabled}
                            ref={subjectInputRef}
                        />
                    </label>
                    <label>
                        <span className="item">participants limit {limit}</span>
                        <input
                            className="input-box"
                            type="range"
                            min={2}
                            max={30}
                            onChange={handleLimitOnChange}
                            value={limit}
                        />
                    </label>
                    <label>
                        <span className="item">password required?</span>
                        <input 
                            type="checkbox"
                            onClick={handlePwRequiredOnChange}
                        />
                        <input
                            placeholder="password"
                            className="input-box"
                            style={{ width: '220px' }}
                            disabled={!isPwRequired}
                            ref={pwInputRef}
                            type="password"
                        />
                    </label>
                </div>
            </form>
            <button 
                className="submit-btn"
                onClick={submitRoomForm}
            >submit</button>
            <style>{`
                input[type=range]{
                    -webkit-appearance: none;
                }
                input[type=range]::-webkit-slider-runnable-track {
                    width: 300px;
                    height: 5px;
                    background: #ddd;
                    border: none;
                    border-radius: 3px;
                }
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    border: none;
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    background: goldenrod;
                    margin-top: -5px;
                }
                input[type=range]:focus {
                    outline: none;
                }
                input[type=range]:focus::-webkit-slider-runnable-track {
                    background: #ccc;
                }
                .all {
                    transition: all 1s;
                    opacity: ${ isRendered ? '1' : '0' };
                    transform: translateY(${ isRendered ? '0px' : '80px' });
                }
            `}</style>
        </div>
    )
}

export default CreateChat;