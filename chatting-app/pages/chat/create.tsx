import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { clearPreviousRoomId, toastConfig } from "../../utils/utils";

const roomSubjectOptions = [
    'life', 'sports', 'study', 'jobs', 'leisure', 'dish', 'tour', 'economy', 'world', 'art', 'music', 'else'
];

interface ICreateChat {
    roomName: string,
    subject: string,
    subjectOption: string,
    limitation: number,
    password: string | null,
    useCustomSubject: boolean,
    usePassword: boolean,
}

function CreateChat() {
    const router = useRouter();
    const [isRendered, setIsRendered] = useState(false);
    const [useCustomSubject, setUseCustomSubject] = useState(false);
    const [usePassword, setUsePassword] = useState(false);
    const [isReRendered, setIsReRendered] = useState(false);
    const { register, getValues, formState: { errors }, setValue, handleSubmit, setError } = useForm<ICreateChat>({
        defaultValues: { limitation: 15 },
    });
    const userId = useSelector(({ signInReducer: {id} }: { signInReducer: {id: string} }) => id);
    const submitRoomForm = async (data: ICreateChat) => {
        console.log(data);
        if (data.useCustomSubject && !data.subject) {
            setError('subject', {
                message: 'A Subject is required. :(',
            });
        } else if (data.usePassword && !data.password) {
            setError('password', {
                message: 'A Password is required. :('
            })
        } else if (Object.keys(errors).length === 0) {
            const { status } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/room/create`, {
                roomName: data.roomName,
                subject: data.useCustomSubject ? data.subject : data.subjectOption,
                limitation: data.limitation,
                pwRequired: data.usePassword,
                password: data.usePassword ? data.password : null,
                owner: userId ? userId : null,
            })
            if (status === 200) {
                toast.success('The room has been created!', toastConfig);
                router.push('/chat/list');
            } else toast.error('There might be an error in the server. Please try later. :(', toastConfig);
        }
    }
    const showNowLimitValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue('limitation', +e.currentTarget.value);
        setIsReRendered(isReRendered => !isReRendered);
    }
    useEffect(() => {
        setIsRendered(true);
        // clearPreviousRoomId();
    }, []);
    return (
        <div className="all">
            <form
                className="submit-form"
                style={{ height: '450px' }}
                onSubmit={handleSubmit(submitRoomForm)}
            >
                <h4 className="title">Make your own chat room :)</h4>
                <div className="form-body">
                    <label>
                        <input
                            className="input-box"
                            placeholder="name of chat room."
                            style={{ width: '100%' }}
                            {...register('roomName', {
                                required: 'We need your new chat room name.',
                                min: {
                                    value: 1,
                                    message: 'The room name must longer than at least one.'
                                },
                                max: {
                                    value: 25,
                                    message: 'The room name must shorter than 25.'
                                }
                            })}
                        />
                    </label>
                    <div className="error-message">{errors.roomName?.message}</div>
                    <div>
                        <label>
                            <div>
                                <span className="item">Make a custom suject?</span>
                                <input
                                    className="input-box"
                                    type="checkbox"
                                    {...register('useCustomSubject', {
                                        onChange: () => setUseCustomSubject(value => !value),
                                    })}
                                />
                            </div>
                        </label>
                    </div>
                    <label>
                        <select
                            className="input-box"
                            {...register('subjectOption', {
                                disabled: useCustomSubject
                            })}
                        >
                            {roomSubjectOptions.map(sbj => 
                                <option key={sbj}>{sbj}</option>)}
                        </select>
                        &emsp;
                        <input
                            className="input-box"
                            placeholder="Other kind of subject?"
                            style={{ width: '240px' }}
                            {...register('subject', {
                                disabled: !useCustomSubject
                            })}
                        />
                    </label>
                    <div className="error-message">{errors.subject?.message}</div>
                    <label>
                        <span className="item">participants limit {getValues('limitation')}</span>
                        <input
                            className="input-box"
                            type="range"
                            min={2}
                            max={30}
                            {...register('limitation', {
                                min: 2,
                                max: 30,
                                onChange: showNowLimitValue,
                            })}
                        />
                    </label>
                    <label>
                        <span className="item">password required?</span>
                        <input 
                            type="checkbox"
                            {...register('usePassword', {
                                onChange: () => setUsePassword(value => !value),
                            })}
                        />
                        <input
                            placeholder="password"
                            className="input-box"
                            style={{ width: '220px' }}
                            type="password"
                            {...register('password', {
                                disabled: !usePassword,
                            })}
                        />
                    </label>
                    <div className="error-message">{errors.password?.message}</div>
                </div>
                <button 
                    className="submit-btn"
                    style={{ marginTop: '45px' }}
                >submit</button>
            </form>
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