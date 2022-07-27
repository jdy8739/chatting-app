import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { signIn, signOut } from "../../lib/store/modules/signInReducer";
import { CHATO_USERINFO, clearPreviousRoomId, getCookie, ID_REGEX, removeCookie, setCookie, signupAxios, toastConfig } from "../../utils/utils";

interface IUserInfo {
    id: string,
    nickName: string,
    profilePicUrl: string,
}

let userProfilePic: File | undefined;

function Settings() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [userInfo, setUserInfo] = useState<IUserInfo>();
    const [picBlobString, setPicBlobString] = useState('');
    const handleSignIn = (id: string) => dispatch(signIn(id));
    const { 
        register, 
        formState: { errors }, 
        setValue, 
        handleSubmit } = useForm<IUserInfo>();
    const fetchUserInfo = async (token: string) => {
        try {
            const { data: userInfo }: { data: IUserInfo } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/info`, {} , {
                headers: { 'authorization': `Bearer ${token}` }
            });
            setInputRefValue(userInfo);
            setUserInfo(userInfo);
        } catch (e) {
            toast.error('This is not an available user info.', toastConfig);
            removeCookie(CHATO_USERINFO, {path: '/'});
            dispatch(signOut());
            router.push('/chat/list');
        }
    }
    const setInputRefValue = ({ id, nickName }: IUserInfo) => {
        setValue('id', id);
        setValue('nickName', nickName);
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        removeProfilePicUrl();
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
        removeProfilePicUrl();
        setPicBlobString('');
        setValue('profilePicUrl', '');
    }
    const removeProfilePicUrl = () => {
        if (userInfo?.profilePicUrl) setUserInfo(userInfo => {
            if (userInfo) return {...userInfo, profilePicUrl: ''};
        })
    }
    const handleUserSettingsSubmit = async (data: IUserInfo) => {
        const updatedUserIndo = {...data, userProfilePic: data.profilePicUrl[0]};
        const formData = new FormData();
        for (let key in updatedUserIndo) formData.append(key, updatedUserIndo[key]);
        try {
            const { status, data: token } = await signupAxios.put(`${process.env.NEXT_PUBLIC_API_URL}/user/alter`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'authorization': `Bearer ${getCookie(CHATO_USERINFO)}`,
                }
            });
            if (status === 200) {
                toast.success('Your info has altered successfully!', toastConfig);
                const now = new Date();
                setCookie(
                    CHATO_USERINFO,
                    JSON.stringify(token),
                    {
                        path: '/',
                        expires: new Date(now.setMinutes(now.getMinutes() + 180)),
                        secure: false,
                        httpOnly: false,
                    },
                );
                handleSignIn(data.id);
                router.push('/chat/list');
            }
        } catch (e) {}
    }
    useEffect(() => {
        clearPreviousRoomId();
        const token = getCookie(CHATO_USERINFO);
        if (!token) router.push('/chat/list');
        else fetchUserInfo(token);
        return () => {
            userProfilePic = undefined;
        }
    }, [])
    return (
        <>
            <form
                onSubmit={handleSubmit(handleUserSettingsSubmit)}
                className="submit-form"
                style={{ height: '440px' }}
            >
                <h4 className="title">User Information Settings</h4>
                <div className="profile-image-box">
                    <label
                        htmlFor="pic"
                        style={{ justifyContent: 'center' }}>
                        <img
                            className="profile-img"
                            style={{ 
                                backgroundImage: `url(${userInfo?.profilePicUrl ? userInfo?.profilePicUrl : picBlobString})`,
                                width: '150px',
                                height: '150px',
                            }}
                        />
                        <button
                            className="del-btn"
                            type="button"
                            onClick={removeProfilePic}
                        >delete</button>
                    </label>
                </div>
                <br></br>
                <div>
                    <input
                        id="pic"
                        type="file"
                        style={{ paddingLeft: '60px' }}
                        {...register('profilePicUrl', {
                            onChange: handleFileChange
                        })}
                    />
                </div>
                <label className="item">
                    <span>ID</span>
                    <input
                        className="input-box"
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
                            },
                        })}
                    />
                </label>
                <div className="error-message">{errors.id?.message}</div>
                <label className="item">
                    <span>NickName</span>
                    <input
                        className="input-box"
                        {...register('nickName', {
                            required: 'NickName is required!',
                        })}
                    />
                </label>
                <div className="error-message">{errors.nickName?.message}</div>
                <button
                    className="submit-btn"
                    style={{ margin: '40px 0' }}
                >submit</button>
            </form>
            <style>{`
                img {
                    border-radius: 50%;
                }
                span {
                    cursor: pointer;
                    margin: 12px;
                }
                .del-btn {
                    color: gray;
                    position: absolute;
                    margin-right: -220px;
                    margin-top: 10px;
                }
                label {
                    padding: 0 25px;
                }
            `}</style>
        </>
    )
}

export default Settings;