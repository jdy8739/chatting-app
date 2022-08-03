import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Modal from "../../components/commons/Modal";
import { signIn, signOut } from "../../lib/store/modules/signInReducer";
import { CHATO_USERINFO, clearPreviousRoomId, getCookie, ID_REGEX, removeCookie, setCookie, signupAxios, toastConfig } from "../../utils/utils";

export interface IUserInfo {
    id: string,
    nickName: string,
    profilePicUrl?: string,
}

let userProfilePic: File | undefined;

let tmpPicUrl = '';

function Settings() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [userInfo, setUserInfo] = useState<IUserInfo>();
    const [picBlobString, setPicBlobString] = useState('');
    const [protocol, setProtocol] = useState(0);
    const handleSignIn = (id: string) => dispatch(signIn(id));
    const { 
        register, 
        formState: { errors }, 
        setValue, 
        getValues,
        handleSubmit } = useForm<IUserInfo>();
    const fetchUserInfo = async (token: string) => {
        try {
            const { data: userInfo }: { data: IUserInfo } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/info`, {} , {
                headers: { 'authorization': `Bearer ${token}` }
            });
            setInputRefValue(userInfo);
            setUserInfo(userInfo);
            tmpPicUrl = userInfo.profilePicUrl || '';
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
        const files = e.currentTarget.files;
        if (!files) return;
        userProfilePic = files[0];
        if (files[0].type.includes('image') === false) {
            toast.error('You need to upload a image file only.', toastConfig);
            return;
        }
        setPicBlobString(URL.createObjectURL(files[0]));
        if (userInfo?.profilePicUrl) {
            setUserInfo(userInfo => {
                if (userInfo?.id && userInfo.nickName) return {...userInfo, profilePicUrl: ''};
            });
        }
    }
    const toggleProfilePic = () => {
        if (picBlobString) {
            setPicBlobString('');
            setValue('profilePicUrl', '');
            return;
        }
        setUserInfo(userInfo => {
            if (userInfo) return {...userInfo, profilePicUrl: (userInfo?.profilePicUrl) ? '' : tmpPicUrl};
        })
    }
    const handleUserSettingsSubmit = async (data: IUserInfo, inputPassword: string) => {
        return new Promise(async (success, fail) => {
            const updatedUserIndo = {...data, userProfilePic: data.profilePicUrl ? data.profilePicUrl[0] : null};
            delete updatedUserIndo.profilePicUrl;
            const formData = new FormData();
            formData.append('isUseProfilePic', checkIsPicChosen());
            formData.append('inputPassword', inputPassword);
            for (let key in updatedUserIndo) formData.append(key, updatedUserIndo[key]);
            try {
                const { status, data: token } = await signupAxios.put(`${process.env.NEXT_PUBLIC_API_URL}/user/alter`, formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        'authorization': `Bearer ${getCookie(CHATO_USERINFO)}`,
                    }
                });
                if (status === 200) {
                    toast.success('Your info has been altered successfully!', toastConfig);
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
                    success(true);
                }
            } catch (e) { fail(false); };
        })
    }
    const checkIsPicChosen = () => {
        let isUserProfilePic: boolean;
        if (picBlobString || userInfo?.profilePicUrl) isUserProfilePic = true;
        else isUserProfilePic = false;
        return String(isUserProfilePic);
    }
    const handleUserWithdraw = (inputPassword: string) => {
        return new Promise(async (success, fail) => {
            try {
                const { status } = await signupAxios.put(`${process.env.NEXT_PUBLIC_API_URL}/user/withdraw`, { inputPassword }, { headers: {
                    'authorization': `Bearer ${getCookie(CHATO_USERINFO)}`,
                }});
                if (status === 200) {
                    toast.success('Your id has been removed.', toastConfig);
                    removeCookie(CHATO_USERINFO, {path: '/'});
                    handleSignIn('');
                    success(true);
                }
            } catch (e) { fail(false); };
        })
    }
    useEffect(() => {
        clearPreviousRoomId();
        const token = getCookie(CHATO_USERINFO);
        if (!token) router.push('/chat/list');
        else fetchUserInfo(token);
        return () => {
            userProfilePic = undefined;
            tmpPicUrl = '';
        }
    }, [])
    return (
        <>
            <form
                onSubmit={handleSubmit(() => setProtocol(1))}
                className="submit-form"
                style={{ height: '480px' }}
            >
                <h4 className="title">User Information Settings</h4>
                <div className="profile-image-box">
                    <label
                        htmlFor="pic"
                        style={{ justifyContent: 'center' }}>
                        <img
                            className="profile-img"
                            style={{ 
                                backgroundImage: `url(${picBlobString ? picBlobString : userInfo?.profilePicUrl})`,
                                width: '150px',
                                height: '150px',
                            }}
                        />
                        <button
                            className="del-btn"
                            type="button"
                            onClick={toggleProfilePic}
                        >{`use ${(userInfo?.profilePicUrl || picBlobString) ? '' : 'no'} profile pic`}</button>
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
                <label className="item">
                    <div></div>
                    <span
                        className="withdraw"
                        onClick={() => setProtocol(2)}
                    >withdrawal</span>
                </label>
                <button
                    className="submit-btn"
                    style={{ margin: '40px 0' }}
                >submit</button>
            </form>
            <AnimatePresence>
                {protocol > 0 && 
                <Modal
                    alteredUserInfo={{ 
                        id: getValues('id'), 
                        nickName: getValues('nickName'), 
                        profilePicUrl: getValues('profilePicUrl') 
                    }}
                    handleUserSettingsSubmit={handleUserSettingsSubmit}
                    handleUserWithdraw={handleUserWithdraw}
                    setProtocol={setProtocol}
                    protocol={protocol}
                />}
            </AnimatePresence>
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
                    margin-right: -280px;
                    margin-top: 10px;
                }
                label {
                    padding: 0 25px;
                }
                .withdraw {
                    color: orange;
                    transition: all 1s;
                }
                .withdraw:hover {
                    color: red;
                }
            `}</style>
        </>
    )
}

export default Settings;