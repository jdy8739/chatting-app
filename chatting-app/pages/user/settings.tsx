import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { signOut } from "../../lib/store/modules/signInReducer";
import { CHATO_USERINFO, clearPreviousRoomId, getCookie, removeCookie, toastConfig } from "../../utils/utils";

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
    const idInputRef = useRef<HTMLInputElement>(null);
    const nickNameInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
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
        if (idInputRef.current) idInputRef.current.value = id;
        if (nickNameInputRef.current) nickNameInputRef.current.value = nickName;
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
        if (imageInputRef.current) imageInputRef.current.value = '';
    }
    const removeProfilePicUrl = () => {
        if (userInfo?.profilePicUrl) setUserInfo(userInfo => {
            if (userInfo) return {...userInfo, profilePicUrl: ''};
        })
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
                className="submit-form"
                style={{ padding: '0.5px 50px' }}
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
                        onChange={handleFileChange}
                        ref={imageInputRef}
                    />
                </div>
                <label className="item">
                    <span>ID</span>
                    <input
                        id="id"
                        className="input-box"
                        required
                        ref={idInputRef}
                    />
                </label>
                <label className="item">
                    <span>NickName</span>
                    <input
                        id="id"
                        className="input-box"
                        required
                        ref={nickNameInputRef}
                    />
                </label>
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
            `}</style>
        </>
    )
}

export default Settings;