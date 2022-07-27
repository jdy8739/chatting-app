import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Seo from "../../components/commons/Seo";
import { CHATO_USERINFO, clearPreviousRoomId, getCookie, ID_REGEX, PW_REGEX, signupAxios, toastConfig } from "../../utils/utils";

interface ISignUpForm {
	id: string,
    nickName: string,
	password: string,
	passwordCheck: string,
    userProfilePic?: File | null
}

let userProfilePic: File | undefined;

function SingUp() {
    const router = useRouter();
    const [isRendered, setIsRendered] = useState(false);
    const [picBlobString, setPicBlobString] = useState('');
    const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
        setValue,
        getValues
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
            if (userProfilePic && getValues().userProfilePic) {
                formData.append('userProfilePic', userProfilePic);
            }
            await signupAxios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/signup`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
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
        setValue('userProfilePic', null);
        setPicBlobString('');
    }
    useEffect(() => {
        setIsRendered(true);
        clearPreviousRoomId();
        if (getCookie(CHATO_USERINFO)) {
            toast.error('Please sign out ahead of sign up.', toastConfig);
            router.push('/chat/list');
        }
        return () => {
            userProfilePic = undefined;
        }
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
                            {...register('userProfilePic', {
                                onChange: handleFileChange,
                            })}
                        />
                    </label>
                </div>
                {picBlobString && 
                <div className="profile-image-box">
                    <img 
                        className="profile-img"
                        style={{
                            backgroundImage: `url(${picBlobString})`,
                            width: '150px',
                            height: '150px',
                        }} 
                    />
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
                    margin-top: 25px;
                    position: relative;
                }
                input {
                    width: 250px;
                }
                .del-btn {
                    position: absolute;
                    top: 50%;
                    margin: 5px 110px;
                    cursor: pointer;
                    font-size: 12px;
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