import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { Cookies } from "react-cookie";
import { ICookieOpt, ISignedIn } from "./interfaces";
import { CHATO_TOKEN } from "../constants/etc";
import { SERVER_STATUS } from "./enums";

const cookies = new Cookies();

export const setCookie = (name: string, value: string, options: ICookieOpt) => {
  return cookies.set(name, value, options);
};

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

export const toastConfig = {
  position: toast.POSITION.TOP_CENTER,
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};

axios.defaults.baseURL = `${process.env.NEXT_PUBLIC_API_URL}`;

export const signupAxios = axios.create();

signupAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    handleErrors(error.response.status);
    return Promise.reject(error);
  }
);

const handleErrors = (status: number) => {
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

export const signinAxios = axios.create();

signinAxios.interceptors.response.use(
  (response: { data: Partial<ISignedIn> }) => {
    toast.success("Hello! Welcome To Chato", toastConfig);
    const accessToken = response.data.accessToken;
    const refreshToken = response.data.refreshToken;
    if (accessToken && refreshToken) {
      bakeCookie(accessToken, refreshToken);
      delete response.data.refreshToken;
    } else if (accessToken) {
      const refreshToken = getRefreshTokenInCookies(CHATO_TOKEN);
      if (refreshToken) bakeCookie(accessToken, refreshToken);
    }
    delete response.data.accessToken;
    return response;
  },
  ({ response }: AxiosError) => {
    handleTokenErrors(response?.status);
    return Promise.reject();
  }
);

export const requestWithTokenAxios = axios.create();

requestWithTokenAxios.interceptors.request.use(
  (request) => {
    const accessToken = getAccessTokenInCookies(CHATO_TOKEN);
    if (request.headers && accessToken)
      request.headers["authorization"] = `Bearer ${accessToken}`;
    return request;
  },
  ({ response }: AxiosError) => response
);

requestWithTokenAxios.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data;
    const minimumTokenLenght = 50;
    if (typeof data === "string" && data.length > minimumTokenLenght) {
      const refreshToken = getRefreshTokenInCookies(CHATO_TOKEN);
      if (refreshToken) bakeCookie(data, refreshToken);
    }
    return response;
  },
  async ({ response, config }: AxiosError) => {
    const status = response?.status;
    const refreshToken = getRefreshTokenInCookies(CHATO_TOKEN);
    const prevToken = getAccessTokenInCookies(CHATO_TOKEN);
    if (status === SERVER_STATUS.UNAUTHORIZED && refreshToken && prevToken) {
      const targetUrl = config.url;
      const method = config.method;
      const body = config.data;
      const env = config.env?.FormData;
      const {
        status: accessTokenRequestStatus,
        data: accessToken,
      }: { status: number; data: string } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/reissue_token`,
        {
          headers: {
            refresh_token: `Bearer ${refreshToken}`,
            authorization: `Bearer ${prevToken}`,
          },
        }
      );
      if (accessTokenRequestStatus === SERVER_STATUS.OK && accessToken) {
        const refreshToken = getRefreshTokenInCookies(CHATO_TOKEN);
        if (refreshToken) bakeCookie(accessToken, refreshToken);
        const result = await resendRequest(method, targetUrl, body, env);
        if (result?.status === SERVER_STATUS.OK && "data" in result)
          return {
            status: SERVER_STATUS.OK,
            data: result.data,
          };
        else return { status: result?.status };
      } else if (accessTokenRequestStatus !== SERVER_STATUS.OK) {
        return { status: SERVER_STATUS.UNAUTHORIZED };
      }
    } else handleTokenErrors(response?.status);
    return response;
  }
);

const handleTokenErrors = (status: number | undefined) => {
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
  else toast.error("It cannot be done!", toastConfig);
};

type Tenv = (new (...args: unknown[]) => object) | undefined;

type result = AxiosResponse | AxiosError | undefined;

const resendRequest = (
  method?: string,
  url?: string,
  body?: JSON,
  env?: Tenv
): Promise<result> => {
  return new Promise(async (success, fail) => {
    let result: result = undefined;
    try {
      if (method && url) {
        const contentType = { "Content-Type": "application/json" };
        switch (method) {
          case "get":
            result = await requestWithTokenAxios.get(url, {
              headers: contentType,
            });
            break;
          case "post":
            result = await requestWithTokenAxios.post(
              url,
              env && env?.length > 0 ? env : body,
              { headers: contentType }
            );
            break;
          case "put":
            result = await requestWithTokenAxios.put(
              url,
              env && env?.length > 0 ? env : body,
              { headers: contentType }
            );
            break;
          case "delete":
            result = await requestWithTokenAxios.delete(url, {
              headers: contentType,
            });
            break;
        }
      }
      success(result);
    } catch (e) {
      fail(result);
    }
  });
};

export const getNowTime = (): string => {
  const now = new Date();
  const time = `${now.getHours()}:${now.getMinutes()}`;
  return time;
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

export const scrollViewDown = () => {
  const scrollDown =
    document.body.scrollHeight - document.documentElement.scrollTop < 1000;
  if (scrollDown) window.scrollTo(0, document.body.scrollHeight);
};
