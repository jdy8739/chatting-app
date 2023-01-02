import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { CHATO_TOKEN, toastConfig } from "../constants/etc";
import { SERVER_STATUS } from "./enums";
import { ISignedIn } from "./interfaces";
import {
  bakeCookie,
  getAccessTokenInCookies,
  getRefreshTokenInCookies,
} from "./utils";

axios.defaults.baseURL = `${process.env.NEXT_PUBLIC_API_URL}`;

export const signupAxios = axios.create();

export const signinAxios = axios.create();

export const requestWithTokenAxios = axios.create();

signupAxios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // handleNormalErrors(error.response.status);
    return Promise.reject(error);
  }
);

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
  (error: AxiosError) => {
    // handleAccessTokenErrors(response?.status);
    return Promise.reject(error);
  }
);

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
    }
    // else handleAccessTokenErrors(response?.status);
    return response;
  }
);

type Tenv = (new (...args: unknown[]) => object) | undefined;

type requestAgainResult = AxiosResponse | AxiosError | undefined;

const resendRequest = (
  method?: string,
  url?: string,
  body?: JSON,
  env?: Tenv
): Promise<requestAgainResult> => {
  return new Promise(async (requestAgainSuccess, requestAgainFail) => {
    let result: requestAgainResult = undefined;
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
      requestAgainSuccess(result);
    } catch (e) {
      requestAgainFail(result);
    }
  });
};
