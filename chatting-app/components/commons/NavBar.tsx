import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { signIn, signOut } from "../../lib/store/modules/signInReducer";
import { CHATO_USERINFO, getCookie, removeCookie } from "../../utils/utils";

function NavBar() {
    const router = useRouter();
    const dispatch = useDispatch();
    const userId = useSelector(({ signInReducer: {id} }: { signInReducer: {id: string} }) => id);
    const handleSignIn = (id: string) => dispatch(signIn(id));
    const handleSignOut = () => dispatch(signOut());
    const setUserId = async () => {
        const token: string = (getCookie(CHATO_USERINFO));
        if (token) {
            axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/get-userId`, {}, { 
                headers: { 'authorization': `Bearer ${token}` }
            }).then(({ data }) => handleSignIn(data));
        }
    }
    const removeUserId = () => {
        removeCookie(CHATO_USERINFO, { path: '/' });
        handleSignOut();
        router.push('/chat/list');
    }
    useEffect(() => {
        setUserId();
    }, [])
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
                    {userId ?
                    <>  
                        <div className="profile-img">
                            <img
                                width="100%"
                                height="100%"
                                src={`${process.env.NEXT_PUBLIC_API_URL}/user/profile-pic/${userId}`}
                            />
                        </div>
                        <div id="user-id" onClick={() => router.push('/user/settings')}>{userId}</div>
                        <button onClick={removeUserId}>sign out</button>
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