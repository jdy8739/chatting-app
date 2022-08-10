import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { replaceList, truncateList } from "../../lib/store/modules/likedSubjectReducer";
import { IUserSignedInInfo, signIn, signOut } from "../../lib/store/modules/signInReducer";
import { IUserInfoSelector } from "../../pages/chat/list";
import { CHATO_USERINFO, getCookie, removeCookie } from "../../utils/utils";

interface ILikedSubject {
    likedSubjectNo: number,
    subject: string,
    userNo: number,
}

interface ISignedIn extends IUserSignedInInfo {
    likedSubjects?: ILikedSubject[],
}

function NavBar() {
    const router = useRouter();
    const dispatch = useDispatch();
    const userInfo = useSelector(({signInReducer: { userInfo }}: IUserInfoSelector) => userInfo);
    const handleSignIn = (userInfo: IUserSignedInInfo) => dispatch(signIn(userInfo));
    const handleSignOut = () => dispatch(signOut());
    const fetchUserInfo = async () => {
        const token: string = (getCookie(CHATO_USERINFO));
        if (token) {
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/get-userInfo`, {
                headers: { 'authorization': `Bearer ${token}` }
            })
            .then(({ data }: { data: ISignedIn }) => {
                const likedList: Array<string> = [];
                if (data.likedSubjects)
                    data.likedSubjects.forEach(subject => likedList.push(subject.subject));
                dispatch(replaceList(likedList));
                delete data.likedSubjects;
                handleSignIn(data);
            })
            .catch(() => removeCookie(CHATO_USERINFO, {path: '/'}));
        }
    }
    const removeSignedInUserInfo = () => {
        removeCookie(CHATO_USERINFO, { path: '/' });
        handleSignOut();
        dispatch(truncateList());
        router.push('/chat/list');
    }
    useEffect(() => {
        fetchUserInfo();
    }, []);
    return (
        <>
            <div className="bar-bg">
                <div className="bar-inner">
                    <h1>ChaTo</h1>
                    &emsp;
                    <Link href="/chat/list">
                        <button className={router.pathname === '/chat/list' ? 'clicked' : ''}>chat</button>
                    </Link>
                    <Link href="/chat/create">
                        <button className={router.pathname === '/chat/create' ? 'clicked' : ''}>make chat</button>
                    </Link>
                    <button>search chat</button>
                    <div style={{ flexGrow: '1' }}></div>
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
                        <button onClick={removeSignedInUserInfo}>sign out</button>
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
            <style>{`
                .bar-bg {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 65px;
                    background-color: white;
                    box-shadow: 0px 5px 30px rgba(0, 0, 0, 0.15);
                    padding: 0px 25px;
                    z-index: 100;
                }
                .bar-inner {
                    width: 100%;
                    max-width: 2000px;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: auto;
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
            `}</style>
        </>
    )
}

export default NavBar;