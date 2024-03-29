import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  replaceList,
  truncateList,
} from "../../lib/store/modules/likedSubjectReducer";
import {
  IUserSignedInInfo,
  signIn,
  signOut,
} from "../../lib/store/modules/signInReducer";
import { IUserInfoSelector } from "../../utils/interfaces";
import SearchModal from "./SearchModal";
import { fetchUserInfo, requestSignOut } from "../../apis/userApis";
import { CHATO_TOKEN } from "../../constants/etc";
import {
  getAccessTokenInCookies,
  removeAccessTokenInCookies,
} from "../../utils/utils";

function NavBar() {
  const router = useRouter();
  const [isSearchModalShown, setIsSearhModalShown] = useState(false);
  const dispatch = useDispatch();
  const userInfo = useSelector(
    ({ signInReducer: { userInfo } }: IUserInfoSelector) => userInfo
  );
  const handleSignIn = (userInfo: IUserSignedInInfo) =>
    dispatch(signIn(userInfo));
  const handleSignOut = () => dispatch(signOut());
  const getUserInfo = async () => {
    const userInfo = await fetchUserInfo();
    if (userInfo) {
      const likedList: Array<string> = [];
      if (userInfo.likedSubjects)
        userInfo.likedSubjects.forEach((subject) =>
          likedList.push(subject.subject)
        );
      dispatch(replaceList(likedList));
      delete userInfo.likedSubjects;
      handleSignIn(userInfo);
    } else handleTokenException();
  };
  const initializeUserInfo = () => {
    removeAccessTokenInCookies(CHATO_TOKEN, { path: "/" });
    handleSignOut();
    dispatch(truncateList());
  };
  const handleTokenException = () => {
    initializeUserInfo();
    router.push("/chat/signin");
  };
  const signOutAndClearUserInfo = async () => {
    const isSignOutSuccessful = await requestSignOut();
    if (isSignOutSuccessful) {
      initializeUserInfo();
      router.push("/chat/list");
    }
  };
  const hideSearchModal = () => setIsSearhModalShown(false);
  useEffect(() => {
    const token = getAccessTokenInCookies(CHATO_TOKEN);
    if (token) getUserInfo();
  }, []);
  return (
    <>
      <div className="bar-bg">
        <div className="bar-inner">
          <div className="bar-left">
            <h1>ChaTo</h1>
            &emsp;
            <Link href="/chat/list">
              <button
                className={router.pathname === "/chat/list" ? "clicked" : ""}
              >
                chat
              </button>
            </Link>
            <Link href="/chat/create">
              <button
                className={router.pathname === "/chat/create" ? "clicked" : ""}
              >
                make chat
              </button>
            </Link>
            <button
              disabled={router.pathname === "/chat/[id]"}
              className={router.pathname === "/chat/[id]" ? "disabled" : ""}
              onClick={() => setIsSearhModalShown(true)}
            >
              search chat
            </button>
          </div>
          <div className="bar-right">
            {userInfo.userId ? (
              <>
                <div className="profile-img">
                  <img
                    width="100%"
                    height="100%"
                    src={`${process.env.NEXT_PUBLIC_API_URL}/user/profile-pic/${userInfo.userId}`}
                    alt="profile-icon"
                  />
                </div>
                <button
                  id="user-id"
                  onClick={() => router.push("/user/settings")}
                >
                  {userInfo.userId}
                </button>
                <button onClick={signOutAndClearUserInfo}>sign out</button>
              </>
            ) : (
              <>
                <Link href="/user/signup">
                  <button
                    className={
                      router.pathname === "/user/signup" ? "clicked" : ""
                    }
                  >
                    sign up
                  </button>
                </Link>
                <Link href="/user/signin">
                  <button
                    className={
                      router.pathname === "/user/signin" ? "clicked" : ""
                    }
                  >
                    sign in
                  </button>
                </Link>
              </>
            )}
            <a
              href="https://jdy8739.github.io/profile/"
              target="_blank"
              rel="noreferrer"
            >
              <button>portfolio</button>
            </a>
          </div>
        </div>
      </div>
      {isSearchModalShown && (
        <AnimatePresence>
          <SearchModal hideSearchModal={hideSearchModal} />
        </AnimatePresence>
      )}
      <style jsx>{`
        h1 {
          display: inline;
          vertical-align: middle;
        }
        .bar-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          min-width: 450px;
          height: 65px;
          background-color: white;
          box-shadow: 0px 5px 30px rgba(0, 0, 0, 0.15);
          z-index: 100;
        }
        .bar-inner {
          padding: 0px 75px;
          width: 100%;
          max-width: 2250px;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: auto;
        }
        .bar-left {
          width: 50%;
        }
        .bar-right {
          width: 50%;
          display: flex;
          justify-content: right;
          align-items: center;
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
            position: relative;
          }
          .bar-left {
            width: 100%;
            height: 50%;
            position: absolute;
            top: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .bar-right {
            width: 100%;
            height: 50%;
            position: absolute;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
        .disabled {
          color: gray;
        }
      `}</style>
    </>
  );
}

export default NavBar;
