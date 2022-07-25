import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Seo from "../../components/commons/Seo";
import { clearPreviousRoomId, ID_REGEX, PW_REGEX, signupAxios, toastConfig } from "../../utils/utils";

interface ISignUpForm {
	id: string,
    nickName: string,
	password: string,
	passwordCheck: string,
}

let userProfilePic: File | undefined;

function SingUp() {
    const router = useRouter();
    const [isRendered, setIsRendered] = useState(false);
    const [picBlobString, setPicBlobString] = useState('');
    const imageInputRef = useRef<HTMLInputElement>(null);
    const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<ISignUpForm>();
    const handleSignUpFormSubmit = async (data: ISignUpForm) => {
        if (data.password !== data.passwordCheck) {
			setError(
                'passwordCheck',
				{ message: 'password and check are not identical.' },
				{ shouldFocus: true },
			);
        } else {
            const formData = new FormData();
            for (let key in data) formData.append(key, data[key]);
            if (userProfilePic && imageInputRef.current?.value) {
                formData.append('userProfilePic', userProfilePic);
            }
            await signupAxios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/signup`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
            toast.success('Welcome to Chato! :)', toastConfig);
            router.push('/chat/list');
        }
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (!files) return;
        userProfilePic = files[0];
        if (files[0].type.includes('image') === false) {
            toast.error('You need to upload a image file only.', toastConfig);
            return;
        }
        setPicBlobString(URL.createObjectURL(files[0]));
    }
    const removeProfilePic = () => {
        if (imageInputRef.current) imageInputRef.current.value = '';
        setPicBlobString('');
    }
    useEffect(() => {
        setIsRendered(true);
        clearPreviousRoomId();
        userProfilePic = undefined;
    }, [])
    return (
        <div className="all">
            <Seo title="Chato SignUp"></Seo>
            <form
                className="submit-form"
                style={{ 
                    height: '652px',
                    marginBottom: '150px'
                }}
                onSubmit={handleSubmit(handleSignUpFormSubmit)}
            >
                <h4 className="title">Welcome to Chato :)</h4>
                <div className="form-body">
                    <label htmlFor="id">
                        <span className="item">input your id</span>
                        <input
                            className="input-box"
                            id="id"
                            placeholder="id"
                            {...register('id', {
                                required: 'ID is essential!',
                                pattern: {
                                    value: ID_REGEX,
                                    message: 'Id must include english and numbers only.'
                                },
                                minLength: {
                                    value: 8,
                                    message: 'Id must be longer than 8.',
                                },
                                maxLength: {
                                    value: 15,
                                    message: 'Id must be shorter than 15.',
                                }
                            })}
                        />
                    </label>
                    <div className="error-message">{errors.id?.message}</div>
                    <label htmlFor="nick-name">
                        <span className="item">nick-name</span>
                        <input
                            className="input-box"
                            id="nick-name"
                            placeholder="user nick-name"
                            {...register('nickName', {
                                required: 'Nick name is essential!',
                                minLength: {
                                    value: 1,
                                    message: 'Nick name must be longer than 1.',
                                },
                                maxLength: {
                                    value: 15,
                                    message: 'Nick name must be shorter than 20.',
                                }
                            })}
                        />
                    </label>
                    <div className="error-message">{errors.nickName?.message}</div>
                    <label htmlFor="password">
                        <span className="item">password</span>
                        <input
                            className="input-box"
                            id="password"
                            type="password"
                            placeholder="password"
                            {...register('password', {
                                required: 'Password is essential!',
                                validate: {
                                    regex: value => 
                                    PW_REGEX.test(value) ? true : 'Password must include special chars.',
                                },
                                minLength: {
                                    value: 12,
                                    message: 'Password must be longer than 12.',
                                },
                                maxLength: {
                                    value: 20,
                                    message: 'Password must be shorter than 20.',
                                }
                            })}
                        />
                    </label>
                    <div className="error-message">{errors.password?.message}</div>
                    <label htmlFor="password-check">
                        <span className="item">password check</span>
                        <input
                            className="input-box"
                            id="password-check"
                            type="password"
                            placeholder="password-check"
                            {...register('passwordCheck', {
                                required: 'password check is essential!',
                                minLength: {
                                    value: 8,
                                    message: 'Password check must be longer than 12.',
                                },
                                maxLength: {
                                    value: 15,
                                    message: 'Password check must be shorter than 20.',
                                }
                            })}
                        />
                    </label>
                    <div className="error-message">{errors.passwordCheck?.message}</div>
                    <label style={{ marginTop: '22px' }}>
                        <span className="item">profile pic</span>
                        <input
                            type="file"
                            style={{ textAlign: 'right' }}
                            onChange={handleFileChange}
                            ref={imageInputRef}
                        />
                    </label>
                </div>
                {picBlobString && 
                <div className="profile-image-box">
                    <img style={{backgroundImage: `url(${picBlobString})`}} />
                    <span
                        className="del-btn"
                        onClick={removeProfilePic}
                    >delete</span>
                </div>}
                <button 
                    className="submit-btn submit"
                >submit</button>
            </form>
            <style>{`
                .submit {
                    position: absolute;
                    bottom: -80px;
                }
                .profile-image-box {
                    width: 150px;
                    height: 150px;
                    margin: auto;
                    margin-top: 35px;
                    position: relative;
                }
                img {
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center center;
                    border-radius: 50%;
                    border: 1px solid orange;
                }
                .del-btn {
                    position: absolute;
                    top: 40%;
                    margin: 5px 20px;
                    cursor: pointer;
                    font-size: 12px;
                }
                input {
                    width: 250px;
                }
                input[type=file] {
                    font-size: 10px;
                    text-align: right;
                }
                .error-message {
                    height: 18px;
                    color: orange;
                    font-size: 13px;
                }
                .all {
                    transition: all 1s;
                    opacity: ${ isRendered ? '1' : '0' };
                    transform: translateY(${ isRendered ? '0px' : '80px' });
                }
            `}</style>
        </div>
    );
}

export default SingUp;