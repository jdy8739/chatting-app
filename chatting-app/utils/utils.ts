import { Cookies } from "react-cookie";
import { ICookieOpt } from "./interfaces";
import { CHATO_TOKEN, toastConfig } from "../constants/etc";
import { SERVER_STATUS } from "./enums";
import { toast } from "react-toastify";

/* cookie utils */
const cookies = new Cookies();

export const setCookie = (name: string, value: string, options: ICookieOpt) => {
  return cookies.set(name, value, options);
};

export const bakeCookie = (accessToken: string, refreshToken: string) => {
  const now = new Date();
  setCookie(CHATO_TOKEN, JSON.stringify([accessToken, refreshToken]), {
    path: "/",
    expires: new Date(now.setMinutes(now.getMinutes() + 180)),
    secure: false,
    httpOnly: false,
  });
};

/* token utils */
export const getAccessTokenInCookies = (name: string): string | null => {
  const tokens: string[] = cookies.get(name);
  if (tokens) return tokens[0];
  else return null;
};

export const getRefreshTokenInCookies = (name: string): string | null => {
  const tokens: string[] = cookies.get(name);
  if (tokens) return tokens[1];
  else return null;
};

export const removeAccessTokenInCookies = (
  name: string,
  options: ICookieOpt
) => {
  return cookies.remove(name, options);
};

/* chatting utils */
export const generateRandonUserId = () => {
  const bytes = new Uint32Array(3);
  window.crypto.getRandomValues(bytes);
  return (
    performance.now().toString(36) +
    Array.from(bytes)
      .map((byte) => byte.toString(36))
      .join("")
  ).replace(/\./g, "");
};

export const getPreviousRoomId = (): string | null => {
  const storage = globalThis.sessionStorage;
  const previousRoomId = storage.getItem("previousRoomId");
  storage.clear();
  return previousRoomId;
};

export const setPreviousRoomId = (id: number) => {
  globalThis.sessionStorage.setItem("previousRoomId", id + "");
};

export const clearPreviousRoomId = () => globalThis.sessionStorage.clear();

/* chat room utils */
export const getPinnedSubjectStorage = (): string[] | null => {
  const subjectArray = globalThis.localStorage.getItem("pinned");
  return subjectArray ? JSON.parse(subjectArray) : null;
};

export const setPinnedSubjectStorage = (subject: string) => {
  let subjectArray = getPinnedSubjectStorage();
  if (subjectArray) {
    const filtered = subjectArray.filter((elem) => elem !== subject);
    if (subjectArray.length === filtered.length) {
      if (filtered.length > 7) {
        filtered.shift();
      }
      filtered.push(subject);
    }
    subjectArray = filtered;
  } else subjectArray = [subject];
  globalThis.localStorage.setItem("pinned", JSON.stringify(subjectArray));
};

/* toast utils */
export const handleNormalErrors = (status: number) => {
  if (status === SERVER_STATUS.INTERNET_SERVER_ERROR) {
    toast.error("Please upload your pic in smaller sizes.", toastConfig);
  } else if (status === SERVER_STATUS.BAD_REQUEST) {
    toast.error(
      "There might be some errors on the server. Please try later. :(",
      toastConfig
    );
  } else if (status === SERVER_STATUS.CONFLICT) {
    toast.error("Id is duplicate. Please try another id.", toastConfig);
  } else if (status === SERVER_STATUS.FORBIDDEN) {
    toast.error("You are not authorized!", toastConfig);
  }
};

export const handleAccessTokenErrors = (status: number | undefined) => {
  if (
    status === SERVER_STATUS.FORBIDDEN ||
    status === SERVER_STATUS.BAD_REQUEST
  )
    toast.error(
      "Unauthorized or, the password does not matches!.",
      toastConfig
    );
  else if (status === SERVER_STATUS.CONFLICT)
    toast.error("Id is duplicate. Please try another id.", toastConfig);
  else if (status === SERVER_STATUS.NOT_FOUND)
    toast.error("No such Id in our records.", toastConfig);
  else if (status === SERVER_STATUS.NOT_MODIFIED)
    toast.error("The number of participants exceeds the limit.");
  else if (status === SERVER_STATUS.UNAUTHORIZED) {
    toast.error("Sign in Error! Please Sign in again.", toastConfig);
  } else toast.error("It cannot be done!", toastConfig);
};

/* etc utils */
export const getNowTime = (): string => {
  const now = new Date();
  const time = `${now.getHours()}:${now.getMinutes()}`;
  return time;
};

export const scrollViewDown = () => {
  const scrollDown =
    document.body.scrollHeight - document.documentElement.scrollTop < 1000;
  if (scrollDown) window.scrollTo(0, document.body.scrollHeight);
};
