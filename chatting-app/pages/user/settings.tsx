import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Modal from "../../components/settings/Modal";
import { EXECUTE, IUserInfo } from "../../utils/enums";
import { truncateList } from "../../lib/store/modules/likedSubjectReducer";
import {
  IUserSignedInInfo,
  signIn,
  signOut,
} from "../../lib/store/modules/signInReducer";
import { IUserInfoSelector } from "../../utils/interfaces";
import {
  clearPreviousRoomId,
  getAccessTokenInCookies,
  removeAccessTokenInCookies,
  toastConfig,
} from "../../utils/utils";
import Image from "next/image";
import {
  fetchUserSettingsInfo,
  requestAlterUserSettingsInfo,
  requestWithdrawal,
} from "../../apis/userApis";
import { SETTINGS_FORM_STYLE } from "../../constants/styles";
import { CHATO_TOKEN, ID_REGEX } from "../../constants/etc";

let userProfilePic: File | undefined;
let tmpPicUrl = "";

function Settings() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [userInfo, setUserInfo] = useState<IUserInfo>();
  const [picBlobString, setPicBlobString] = useState("");
  const [protocol, setProtocol] = useState(EXECUTE.DEFAULT);
  const { userNo } = useSelector(
    ({ signInReducer: { userInfo } }: IUserInfoSelector) => userInfo
  );
  const handleSignIn = (userInfo: IUserSignedInInfo) =>
    dispatch(signIn(userInfo));
  const handleSignOut = () => dispatch(signOut());
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
    handleSubmit,
  } = useForm<IUserInfo>();
  const fetchUserInfo = async () => {
    const userSettingsInfo = await fetchUserSettingsInfo();
    if (userSettingsInfo) {
      setInputRefValue(userSettingsInfo);
      setUserInfo(userSettingsInfo);
      tmpPicUrl = userSettingsInfo.profilePicUrl || "";
    } else {
      toast.error("This is not an available user info.", toastConfig);
      handleTokenException();
    }
  };
  const setInputRefValue = ({ id, nickName }: IUserInfo) => {
    setValue("id", id);
    setValue("nickName", nickName);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;
    userProfilePic = files[0];
    if (files[0].type.includes("image") === false) {
      toast.error("You need to upload a image file only.", toastConfig);
      return;
    }
    setPicBlobString(URL.createObjectURL(files[0]));
    if (userInfo?.profilePicUrl) {
      setUserInfo((userInfo) => {
        if (userInfo?.id && userInfo.nickName)
          return { ...userInfo, profilePicUrl: "" };
      });
    }
  };
  const toggleProfilePic = () => {
    if (picBlobString) {
      setPicBlobString("");
      setValue("profilePicUrl", "");
      return;
    }
    setUserInfo((userInfo) => {
      if (userInfo)
        return {
          ...userInfo,
          profilePicUrl: userInfo?.profilePicUrl ? "" : tmpPicUrl,
        };
    });
  };
  const handleUserSettingsSubmit = async (
    data: IUserInfo,
    inputPassword: string
  ): Promise<boolean> => {
    return new Promise(async (success, fail) => {
      const updatedUserInfo: { [key: string]: string | Blob | null } = {
        ...data,
        userProfilePic: data.profilePicUrl ? data.profilePicUrl[0] : null,
      };
      delete updatedUserInfo.profilePicUrl;
      const formData = new FormData();
      formData.append("isUseProfilePic", checkIsPicChosen());
      formData.append("inputPassword", inputPassword);
      for (const key in updatedUserInfo) {
        const value = updatedUserInfo[key];
        if (value !== null) formData.append(key, value);
      }
      const [isAlterSuccessful, isInvalidToken] =
        await requestAlterUserSettingsInfo(formData);
      if (isAlterSuccessful) {
        toast.success("Your info has been altered successfully!", toastConfig);
        if (userInfo?.id === data.id) handleSignOut();
        setTimeout(() => {
          handleSignIn({
            userNo: userNo,
            userId: data.id,
            userNickName: data.nickName,
          });
        }, 500);
        success(true);
      } else {
        if (isInvalidToken) handleTokenException();
        else fail(false);
      }
    });
  };
  const checkIsPicChosen = () => {
    let isUserProfilePic: boolean;
    if (picBlobString || userInfo?.profilePicUrl) isUserProfilePic = true;
    else isUserProfilePic = false;
    return String(isUserProfilePic);
  };
  const handleUserWithdraw = (inputPassword: string): Promise<boolean> => {
    return new Promise(async (success, fail) => {
      const [isWithdrawalSuccessful, isInvalidToken] = await requestWithdrawal(
        inputPassword
      );
      if (isWithdrawalSuccessful) {
        toast.success("Your id has been removed.", toastConfig);
        removeAccessTokenInCookies(CHATO_TOKEN, { path: "/" });
        handleSignIn({ userNo: -1, userId: "", userNickName: "" });
        success(true);
      } else {
        if (isInvalidToken) handleTokenException();
        else fail(false);
      }
    });
  };
  const handleTokenException = () => {
    removeAccessTokenInCookies(CHATO_TOKEN, { path: "/" });
    dispatch(signOut());
    dispatch(truncateList());
    router.push("/chat/list");
  };
  useEffect(() => {
    clearPreviousRoomId();
    const token = getAccessTokenInCookies(CHATO_TOKEN);
    if (!token) router.push("/chat/list");
    else fetchUserInfo();
    return () => {
      userProfilePic = undefined;
      tmpPicUrl = "";
    };
  }, []);
  return (
    <>
      <form
        onSubmit={handleSubmit(() => setProtocol(EXECUTE.ALTER_USER_INFO))}
        className="submit-form"
        style={SETTINGS_FORM_STYLE.HEIGHT}
      >
        <h4 className="title">User Information Settings</h4>
        <div className="profile-image-box">
          <label htmlFor="pic" style={SETTINGS_FORM_STYLE.JUSTIFY_CENTER}>
            {picBlobString || userInfo?.profilePicUrl ? (
              <Image
                // className="profile-img big-img"
                src={""}
                style={{
                  backgroundImage: `url(${
                    picBlobString ? picBlobString : userInfo?.profilePicUrl
                  })`,
                }}
                width="100px"
                height="100px"
                alt="profile-image"
              />
            ) : (
              <div className="profile-img big-img"></div>
            )}
            <button
              className="del-btn"
              type="button"
              onClick={toggleProfilePic}
            >{`use ${
              userInfo?.profilePicUrl || picBlobString ? "" : "no"
            } profile pic`}</button>
          </label>
        </div>
        <br></br>
        <div>
          <input
            id="pic"
            type="file"
            style={SETTINGS_FORM_STYLE.PAD_LEFT}
            {...register("profilePicUrl", {
              onChange: handleFileChange,
            })}
          />
        </div>
        <label className="item">
          <span>ID</span>
          <input
            className="input-box"
            placeholder="id"
            {...register("id", {
              required: "ID is essential!",
              pattern: {
                value: ID_REGEX,
                message: "Id must include english and numbers only.",
              },
              minLength: {
                value: 8,
                message: "Id must be longer than 8.",
              },
              maxLength: {
                value: 15,
                message: "Id must be shorter than 15.",
              },
            })}
          />
        </label>
        <div className="error-message">{errors.id?.message}</div>
        <label className="item">
          <span>NickName</span>
          <input
            className="input-box"
            {...register("nickName", {
              required: "NickName is required!",
            })}
          />
        </label>
        <div className="error-message">{errors.nickName?.message}</div>
        <label className="item">
          <div></div>
          <span
            className="withdraw"
            onClick={() => setProtocol(EXECUTE.WITHDRAW)}
          >
            withdrawal
          </span>
        </label>
        <button className="submit-btn" style={SETTINGS_FORM_STYLE.MARGIN}>
          submit
        </button>
      </form>
      <AnimatePresence>
        {protocol > 0 && (
          <Modal
            alteredUserInfo={{
              id: getValues("id"),
              nickName: getValues("nickName"),
              profilePicUrl: getValues("profilePicUrl"),
            }}
            handleUserSettingsSubmit={handleUserSettingsSubmit}
            handleUserWithdraw={handleUserWithdraw}
            setProtocol={setProtocol}
            protocol={protocol}
          />
        )}
      </AnimatePresence>
      <style jsx>{`
        img {
          border-radius: 50%;
        }
        .big-img {
          width: 150px;
          height: 150px;
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
  );
}

export default Settings;
