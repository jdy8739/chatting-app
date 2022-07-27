import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { signIn } from "../../lib/store/modules/signInReducer";
import { CHATO_USERINFO, clearPreviousRoomId, getCookie, setCookie, signinAxios, toastConfig } from "../../utils/utils";

function Signin() {
    const router = useRouter();
    const dispatch = useDispatch();
    const idInputRef = useRef<HTMLInputElement>(null);
    const pwInputRef = useRef<HTMLInputElement>(null);
    const changeUserId = (id: string) => dispatch(signIn(id));
    const handleSigninSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const userId = idInputRef.current?.value;
        const id = userId;
        const password = pwInputRef.current?.value;
        if (id && password) {
            try {
                const { status, data: token } = await signinAxios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/signin`, {id, password});
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
                changeUserId(userId);
                if (status === 200) router.push('/chat/list');
            } catch (e) {}
        }
    }
    useEffect(() => {
        clearPreviousRoomId();
        if (getCookie(CHATO_USERINFO)) {
            toast.error('You are already singed in.', toastConfig);
            router.push('/chat/list');
        }
    }, [])
    return (
        <>
            <form
                onSubmit={handleSigninSubmit}
                className="submit-form"
                style={{ width: '400px', height: '250px' }}
            >
                <h4 className="title">Nice to meet U Again! :)</h4>
                <div
                    style={{ width: '80%', margin: 'auto' }}
                >
                    <label htmlFor="id">
                        <span className="item">ID</span>
                        <input
                            id="id"
                            className="input-box"
                            ref={idInputRef}
                            required
                        />
                    </label>
                    <label htmlFor="password">
                        <span className="item">password</span>
                        <input
                            id="password"
                            className="input-box"
                            ref={pwInputRef}
                            type="password"
                            required
                        />
                    </label>
                </div>
                <Link href="/chat/list">
                    <div className="item">chat without signin?</div>
                </Link>
                <button 
                    className="submit-btn"
                    style={{ width: '100%', marginTop: '45px' }}
                >submit</button>
            </form>
            <style>{`
                input {
                    width: 230px;
                }
                .item:nth-child(3) {
                    text-align: right;
                    margin: 15px 30px 0 0;
                    cursor: pointer;
                
            `}</style>
        </>
    )
}

export default Signin;