import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Seo from "../../components/commons/Seo";
import { FORM_STYLE } from "../../constants/styles";
import { ISignUpForm } from "../../utils/interfaces";
import {
  CHATO_TOKEN,
  getAccessToken,
  ID_REGEX,
  PW_REGEX,
  signupAxios,
  toastConfig,
} from "../../utils/utils";
import Image from "next/image";

let userProfilePic: File | undefined;

function SingUp() {
  const router = useRouter();
  const [isRendered, setIsRendered] = useState(false);
  const [picBlobString, setPicBlobString] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    getValues,
  } = useForm<ISignUpForm>();
  const handleSignUpFormSubmit = async (data: ISignUpForm) => {
    if (data.password !== data.passwordCheck) {
      setError(
        "passwordCheck",
        { message: "password and check are not identical." },
        { shouldFocus: true }
      );
    } else {
      const formData = new FormData();
      const values: { [key: string]: string | Blob | null } = { ...data };
      for (const key in values) {
        const value = values[key];
        if (value !== null) formData.append(key, value);
      }
      if (userProfilePic && getValues().userProfilePic) {
        formData.append("userProfilePic", userProfilePic);
      }
      await signupAxios.post(`/user/signup`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Welcome to Chato! :)", toastConfig);
      router.push("/chat/list");
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;
    userProfilePic = files[0];
    if (files[0].type.includes("image") === false) {
      toast.error("You need to upload a image file only.", toastConfig);
      return;
    }
    setPicBlobString(URL.createObjectURL(files[0]));
  };
  const removeProfilePic = () => {
    setValue("userProfilePic", null);
    setPicBlobString("");
  };
  useEffect(() => {
    setIsRendered(true);
    // clearPreviousRoomId();
    if (getAccessToken(CHATO_TOKEN)) {
      toast.error("Please sign out ahead of sign up.", toastConfig);
      router.push("/chat/list");
    }
    return () => {
      userProfilePic = undefined;
    };
  }, []);
  return (
    <div className="all">
      <Seo title="Chato SignUp"></Seo>
      <form
        className="submit-form"
        style={FORM_STYLE.FORM}
        onSubmit={handleSubmit(handleSignUpFormSubmit)}
      >
        <h4 className="title">Welcome to Chato :)</h4>
        <div className="form-body">
          <label htmlFor="id">
            <span className="item">input your id</span>
            <input
              className="input-box"
              id="id"
              placeholder="id"
              {...register("id", {
                required: "ID is essential!",
                validate: {
                  regex: (value) =>
                    ID_REGEX.test(value)
                      ? true
                      : "Id must include english and numbers only.",
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
          <label htmlFor="nick-name">
            <span className="item">nick-name</span>
            <input
              className="input-box"
              id="nick-name"
              placeholder="user nick-name"
              {...register("nickName", {
                required: "Nick name is essential!",
                minLength: {
                  value: 1,
                  message: "Nick name must be longer than 1.",
                },
                maxLength: {
                  value: 15,
                  message: "Nick name must be shorter than 20.",
                },
              })}
            />
          </label>
          <div className="error-message">{errors.nickName?.message}</div>
          <label htmlFor="password">
            <span className="item">password</span>
            <input
              className="input-box"
              id="password"
              type="password"
              placeholder="password"
              {...register("password", {
                required: "Password is essential!",
                validate: {
                  regex: (value) =>
                    PW_REGEX.test(value)
                      ? true
                      : "Password must include special chars.",
                },
                minLength: {
                  value: 12,
                  message: "Password must be longer than 12.",
                },
                maxLength: {
                  value: 20,
                  message: "Password must be shorter than 20.",
                },
              })}
            />
          </label>
          <div className="error-message">{errors.password?.message}</div>
          <label htmlFor="password-check">
            <span className="item">password check</span>
            <input
              className="input-box"
              id="password-check"
              type="password"
              placeholder="password-check"
              {...register("passwordCheck", {
                required: "password check is essential!",
                minLength: {
                  value: 8,
                  message: "Password check must be longer than 12.",
                },
                maxLength: {
                  value: 15,
                  message: "Password check must be shorter than 20.",
                },
              })}
            />
          </label>
          <div className="error-message">{errors.passwordCheck?.message}</div>
          <label style={FORM_STYLE.ERROR}>
            <span className="item">profile pic</span>
            <input
              type="file"
              style={{ textAlign: "right" }}
              {...register("userProfilePic", {
                onChange: handleFileChange,
              })}
            />
          </label>
        </div>
        {picBlobString && (
          <div className="profile-image-box">
            <Image
              className="profile-img"
              width="150px"
              height="150px"
              src={picBlobString}
              alt="profile-image"
            />
            <span className="del-btn" onClick={removeProfilePic}>
              delete
            </span>
          </div>
        )}
        <button className="submit-btn submit">submit</button>
      </form>
      <style jsx>{`
        .submit {
          position: absolute;
          bottom: -80px;
        }
        .profile-image-box {
          width: 150px;
          height: 150px;
          margin: auto;
          margin-top: 25px;
          position: relative;
        }
        input {
          width: 250px;
        }
        .del-btn {
          position: absolute;
          top: 50%;
          margin: 5px 110px;
          cursor: pointer;
          font-size: 12px;
        }
        .all {
          transition: all 1s;
          opacity: ${isRendered ? "1" : "0"};
          transform: translateY(${isRendered ? "0px" : "80px"});
        }
      `}</style>
    </div>
  );
}

export default SingUp;
