import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { requestSignIn } from "../../apis/userApis";
import { CHATO_TOKEN } from "../../constants/etc";
import { SIGN_IN_FORM_STYLE } from "../../constants/styles";
import { replaceList } from "../../lib/store/modules/likedSubjectReducer";
import {
  IUserSignedInInfo,
  signIn,
} from "../../lib/store/modules/signInReducer";
import {
  clearPreviousRoomId,
  getAccessTokenInCookies,
  toastConfig,
} from "../../utils/utils";

function Signin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const idInputRef = useRef<HTMLInputElement>(null);
  const pwInputRef = useRef<HTMLInputElement>(null);
  const handleSignIn = (userInfo: IUserSignedInInfo) =>
    dispatch(signIn(userInfo));
  const handleSigninSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = idInputRef.current?.value;
    const password = pwInputRef.current?.value;
    if (id && password) {
      const userInfo = await requestSignIn(id, password);
      if (userInfo) {
        const likedList: Array<string> = [];
        if (userInfo.likedSubjects)
          userInfo.likedSubjects.forEach((subject) =>
            likedList.push(subject.subject)
          );
        dispatch(replaceList(likedList));
        delete userInfo.likedSubjects;
        handleSignIn(userInfo);
        router.push("/chat/list");
      }
    }
  };
  useEffect(() => {
    clearPreviousRoomId();
    if (getAccessTokenInCookies(CHATO_TOKEN)) {
      toast.error("You are already singed in.", toastConfig);
      router.push("/chat/list");
    }
  }, []);
  return (
    <>
      <form
        onSubmit={handleSigninSubmit}
        className="submit-form"
        style={SIGN_IN_FORM_STYLE.FORM}
      >
        <h4 className="title">Nice to meet U Again! :)</h4>
        <div style={SIGN_IN_FORM_STYLE.TITLE}>
          <label htmlFor="id">
            <span className="item">ID</span>
            <input id="id" className="input-box" ref={idInputRef} required />
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
        <button className="submit-btn" style={SIGN_IN_FORM_STYLE.SUBMIT}>
          submit
        </button>
      </form>
      <style jsx>{`
        input {
          width: 230px;
        }
        .item:nth-child(3) {
          text-align: right;
          margin: 15px 30px 0 0;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}

export default Signin;
