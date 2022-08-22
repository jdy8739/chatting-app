import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { ISignedIn } from "../../components/commons/NavBar";
import { replaceList } from "../../lib/store/modules/likedSubjectReducer";
import { IUserSignedInInfo, signIn } from "../../lib/store/modules/signInReducer";
import { CHATO_TOKEN, clearPreviousRoomId, getAccessToken, signinAxios, toastConfig } from "../../utils/utils";

const STYLE = {
    FORM: { width: '400px', height: '250px' },
    TITLE: { width: '80%', margin: 'auto' },
    SUBMIT: { width: '100%', marginTop: '45px' },
}

function Signin() {
    const router = useRouter();
    const dispatch = useDispatch();
    const idInputRef = useRef<HTMLInputElement>(null);
    const pwInputRef = useRef<HTMLInputElement>(null);
    const handleSignIn = (userInfo: IUserSignedInInfo) => dispatch(signIn(userInfo));
    const handleSigninSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const id = idInputRef.current?.value;
        const password = pwInputRef.current?.value;
        if (id && password) {
            try {
                const { status, data: userData }: { status: number, data: ISignedIn } = await signinAxios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/signin`, {id, password});
                if (status === 200) {
                    const likedList: Array<string> = [];
                    if (userData.likedSubjects)
                    userData.likedSubjects.forEach(subject => likedList.push(subject.subject));
                    dispatch(replaceList(likedList));
                    delete userData.likedSubjects;
                    handleSignIn(userData);
                    router.push('/chat/list');
                }
            } catch (e) {};
        }
    }
    useEffect(() => {
        clearPreviousRoomId();
        if (getAccessToken(CHATO_TOKEN)) {
            toast.error('You are already singed in.', toastConfig);
            router.push('/chat/list');
        }
    }, [])
    return (
        <>
            <form
                onSubmit={handleSigninSubmit}
                className="submit-form"
                style={STYLE.FORM}
            >
                <h4 className="title">Nice to meet U Again! :)</h4>
                <div
                    style={STYLE.TITLE}
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
                    style={STYLE.SUBMIT}
                >submit</button>
            </form>
            <style jsx>{`
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