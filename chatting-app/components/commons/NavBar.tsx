import axios from "axios";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { replaceList, truncateList } from "../../lib/store/modules/likedSubjectReducer";
import { IUserSignedInInfo, signIn, signOut } from "../../lib/store/modules/signInReducer";
import { IUserInfoSelector } from "../../pages/chat/list";
import { CHATO_TOKEN, getAccessToken, removeCookie, requestWithTokenAxios } from "../../utils/utils";
import SearchModal from "./SearchModal";

interface ILikedSubject {
    likedSubjectNo: number,
    subject: string,
    userNo: number,
}

export interface ISignedIn extends IUserSignedInInfo {
    likedSubjects?: ILikedSubject[],
    accessToken: string,
    refreshToken: string,
}

function NavBar() {
    const router = useRouter();
    const [isSearchModalShown, setIsSearhModalShown] = useState(false);
    const dispatch = useDispatch();
    const userInfo = useSelector(({signInReducer: { userInfo }}: IUserInfoSelector) => userInfo);
    const handleSignIn = (userInfo: IUserSignedInInfo) => dispatch(signIn(userInfo));
    const handleSignOut = () => dispatch(signOut());
    const fetchUserInfo = async () => {
        const token: (string | null) = (getAccessToken(CHATO_TOKEN));
        if (token) {
            requestWithTokenAxios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/get-userInfo`)
            .then(({ status, data }: { status: number, data: ISignedIn }) => {
                if (status === 200) {
                    if (data) {
                        const likedList: Array<string> = [];
                        if (data.likedSubjects)
                            data.likedSubjects.forEach(subject => likedList.push(subject.subject));
                        dispatch(replaceList(likedList));
                        delete data.likedSubjects;
                        handleSignIn(data);
                    }
                }
            })
            .catch(() => handleTokenException());
        }
    }
    const doCommonTasks = () => {
        removeCookie(CHATO_TOKEN, { path: '/' });
        handleSignOut();
        dispatch(truncateList());
    }
    const handleTokenException = () => {
        doCommonTasks();
        router.push('/chat/signin');
    }
    const signOutAndClearUserInfo = async () => {
        const { status } = await requestWithTokenAxios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/signout`);
        if (status === 200) {
            doCommonTasks();
            router.push('/chat/list');
        }
    }
    const hideSearchModal = () => setIsSearhModalShown(false);
    useEffect(() => {
        fetchUserInfo();
    }, []);
    return (
        <>
            <div className="bar-bg">
                <div className="bar-inner bar-left">
                    <h1>ChaTo</h1>
                    &emsp;
                    <Link href="/chat/list">
                        <button className={router.pathname === '/chat/list' ? 'clicked' : ''}>chat</button>
                    </Link>
                    <Link href="/chat/create">
                        <button className={router.pathname === '/chat/create' ? 'clicked' : ''}>make chat</button>
                    </Link>
                    <button
                        disabled={router.pathname === '/chat/[id]'}
                        className={(router.pathname === '/chat/[id]') ? 'disabled' : ''}
                        onClick={() => setIsSearhModalShown(true)}
                    >search chat</button>
                </div>
                <div className="bar-inner bar-right">
                    {(userInfo.userId) ?
                    <>
                        <div className="profile-img">
                            <img
                                width="100%"
                                height="100%"
                                src={`${process.env.NEXT_PUBLIC_API_URL}/user/profile-pic/${userInfo.userId}`}
                            />
                        </div>
                        <div id="user-id" onClick={() => router.push('/user/settings')}>{userInfo.userId}</div>
                        <button onClick={signOutAndClearUserInfo}>sign out</button>
                    </> :
                    <>
                        <Link href="/user/signup">
                            <button className={router.pathname === '/user/signup' ? 'clicked' : ''}>sign up</button>
                        </Link>
                        <Link href="/user/signin">
                            <button className={router.pathname === '/user/signin' ? 'clicked' : ''}>sign in</button>
                        </Link>
                    </>}
                    <Link href="#">
                        <button>portfolio</button>
                    </Link>
                </div>
            </div>
            {isSearchModalShown &&
            <AnimatePresence>
                <SearchModal
                    hideSearchModal={hideSearchModal}
                />
            </AnimatePresence>}
            <style jsx>{`
                .bar-bg {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    max-width: 2000px;
                    min-width: 290px;
                    height: 65px;
                    background-color: white;
                    box-shadow: 0px 5px 30px rgba(0, 0, 0, 0.15);
                    padding: 0px 25px;
                    z-index: 100;
                    display: flex;
                }
                .bar-inner {
                    width: 50%;
                    height: 100%;
                    display: inherit;
                    align-items: center;
                }
                .bar-right {
                    justify-content: right;
                }
                .clicked {
                    color: orange;
                }
                h1 {
                    color: orange;
                    font-weight: bold;
                }
                #user-id {
                    color: orange;
                    font-size: 15px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-right: 15px;
                }
                @media (max-width: 768px) {
                    .bar-bg {
                        height: 130px;
                    }
                    .bar-inner {
                        width: 100%;
                        justify-content: center;
                        position: absolute;
                        height: 50%;
                    }
                    .bar-left {
                        top: 0;
                    }
                    .bar-right {
                        bottom: 0;
                    }
                }
                .disabled {
                    color: gray;
                }
            `}</style>
        </>
    )
}

export default NavBar;