import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { toastConfig } from "../../utils/utils";

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
        if (!checkFormValidation(roomName, password)) return;
        const { status } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/room/create`, {
            roomName: roomName,
            subject: subject,
            limitation: limit,
            isPwRequired: isPwRequired,
            password: isPwRequired ? pwInputRef.current?.value : null,
            owner: null,
        })
        if (status === 200) {
            toast.success('The room has been created!', toastConfig);
            router.push('/chat/list');
        } else toast.error('There might be an error in the server. Please try later. :(', toastConfig);
    }
    const checkFormValidation = (roomName?: string, password?: string) :boolean => {
        if (!roomName) {
            toast.error('We need your new chat room name.', toastConfig);
            return false;
        }
        else if (isPwRequired && !password) {
            toast.error('Password is required. :(', toastConfig);
            return false;
        }
        else return true;
    };
    useEffect(() => {
        setIsRendered(true);
    }, []);
    return (
        <div className="all">
            <form>
                <h4>Make your own chat room :)</h4>
                <input 
                    placeholder="name of chat room."
                    style={{ width: '380px' }}
                    ref={roomNameInputRef}
                />
                <div>
                    <label>
                        <span>Make a custom suject?</span>
                        <input 
                            type="checkbox"
                            onClick={handleChkBoxValue}
                        />
                    </label>
                </div>
                <div className="box">
                    <select 
                        disabled={isSubjectSelectDisabled}
                        ref={subjectSelectRef}
                    >
                        {roomSubjectOptions.map(sbj => 
                            <option key={sbj}>{sbj}</option>)}
                    </select>
                    &emsp;
                    <input
                        placeholder="Other kind of subject?"
                        style={{ width: '240px' }}
                        disabled={isSubjectInputDisabled}
                        ref={subjectInputRef}
                    />
                </div>
                <label>
                    <span>participants limit {limit}</span>
                    <input 
                        type="range"
                        min={2}
                        max={30}
                        onChange={handleLimitOnChange}
                        value={limit}
                    />
                </label>
                <div className="box">
                    <span>password required?</span>
                    <input 
                        type="checkbox"
                        onClick={handlePwRequiredOnChange}
                    />
                    <input
                        placeholder="password"
                        style={{ width: '220px' }}
                        disabled={!isPwRequired}
                        ref={pwInputRef}
                        type="password"
                    />
                </div>
            </form>
            <button 
                className="submit-btn"
                onClick={submitRoomForm}
            >submit</button>
            <style>{`
                form {
                    width: 500px;
                    height: 390px;
                    margin: 100px auto 20px auto;
                    text-align: center;
                    background-color: white;
                    border-radius: 20px;
                    box-shadow: 0px 5px 30px rgba(0, 0, 0, 0.05);
                    padding: 2px;
                }
                input, select {
                    padding: 12px;
                    border: 1px solid orange;
                    border-radius: 20px;
                    margin: 12px; 0;
                }
                input[type=checkbox] {
                    width: 20px;
                    height: 20px;
                }
                span {
                    color: gray;
                    font-size: 13px;
                }
                h4 {
                    color: orange;
                }
                .submit-btn {
                    width: 500px;
                    height: 60px;
                    font-size: 23px;
                    display: block;
                    margin: auto;
                }
                .all {
                    transition: all 1s;
                    opacity: ${ isRendered ? '1' : '0' };
                    transform: translateY(${ isRendered ? '0px' : '100px' });
                }
            `}</style>
        </div>
    )
}

export default CreateChat;