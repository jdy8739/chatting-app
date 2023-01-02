import axios, { AxiosError } from "axios";
import { SERVER_STATUS } from "../utils/enums";
import { Iipdata, IParticipants } from "../types/types";
import { IBannedUserList, ISignedIn } from "../utils/interfaces";
import {
  requestWithTokenAxios,
  signinAxios,
  signupAxios,
} from "../utils/axios";
import { API_KEY_REQUEST_URL } from "../constants/routes";
import { handleAccessTokenErrors, handleNormalErrors } from "../utils/utils";
import { toastConfig } from "../constants/etc";
import { toast } from "react-toastify";

export const fetchUserInfo = async () => {
  let userInfo = null;
  try {
    const { data } = await requestWithTokenAxios.get<ISignedIn>(
      "/user/get-userInfo"
    );
    if (data) userInfo = data;
  } catch (e) {
    const { response } = e as AxiosError;
    const status = response?.status;
    if (status) handleAccessTokenErrors(status);
  }
  return userInfo;
};

export const requestSignOut = async () => {
  let isSignOutSuccessful = false;
  try {
    const { status } = await requestWithTokenAxios.get("/user/signout");
    if (status === SERVER_STATUS.OK) isSignOutSuccessful = true;
  } catch (e) {
    const { response } = e as AxiosError;
    const status = response?.status;
    if (status) handleAccessTokenErrors(status);
  }
  return isSignOutSuccessful;
};

export const fetchUserPrivateIpAddress = async () => {
  let userPrivateIpAddress = null;
  try {
    const {
      data: { ip },
    }: { data: Iipdata } = await axios.get(
      `${API_KEY_REQUEST_URL}${process.env.NEXT_PUBLIC_IPDATA_API_KEY}`
    );
    userPrivateIpAddress = ip;
  } catch (e) {
    console.log(e);
    if (!userPrivateIpAddress) throw new Error();
  }
  return userPrivateIpAddress;
};

export const fetchRoomParticipants = async (roomId: number) => {
  let participants = null;
  try {
    const { data } = await axios.get<Array<IParticipants>>(
      `/room/participants/${roomId}`
    );
    participants = data;
  } catch (e) {
    const { response } = e as AxiosError;
    const status = response?.status;
    if (status) handleNormalErrors(status);
  }
  return participants;
};

export const fetchBannedUserList = async (roomId: number) => {
  let bannedUserList = null;
  try {
    const { data } = await requestWithTokenAxios.get<Array<IBannedUserList>>(
      `/room/banned_users/${roomId}`
    );
    bannedUserList = data;
  } catch (e) {
    const { response } = e as AxiosError;
    const status = response?.status;
    if (status) handleAccessTokenErrors(status);
  }
  return bannedUserList;
};

export const requestUserExpel = async (
  roomId: number,
  ipAddress: string,
  userName: string,
  isBanUser: boolean
) => {
  let isUserBanSuccessful = false;
  try {
    const { status } = await axios.post("/user/add_banned", {
      roomId,
      ipAddress,
      userName,
    });
    if (status === SERVER_STATUS.OK) {
      const banMessage = isBanUser
        ? "You are banned!"
        : "This room is disbanded.";
      toast.error(banMessage, toastConfig);
      isUserBanSuccessful = true;
    }
  } catch (e) {
    const { response } = e as AxiosError;
    const status = response?.status;
    if (status) handleNormalErrors(status);
  }
  return isUserBanSuccessful;
};

export const unlockBannedIpAddress = async (
  bannedIpNo: number,
  roomId: number
) => {
  let isUnlockSuccessful = false;
  try {
    const { status } = await requestWithTokenAxios.post("/room/unlock_ban", {
      bannedIpNo,
      roomId,
    });
    if (status === SERVER_STATUS.OK) isUnlockSuccessful = true;
  } catch (e) {
    const { response } = e as AxiosError;
    const status = response?.status;
    if (status) handleAccessTokenErrors(status);
  }
  return isUnlockSuccessful;
};

export const fetchUserSettingsInfo = async () => {
  let userSettingsInfo = null;
  try {
    const { data } = await requestWithTokenAxios.get(`/user/info`);
    userSettingsInfo = data;
  } catch (e) {
    const { response } = e as AxiosError;
    const status = response?.status;
    if (status) handleAccessTokenErrors(status);
  }
  return userSettingsInfo;
};

export const requestAlterUserSettingsInfo = async (formData: FormData) => {
  let isAlterSuccessful = false;
  let isInvalidToken = false;
  try {
    const { status } = await requestWithTokenAxios.put("/user/alter", formData);
    if (status === SERVER_STATUS.OK) isAlterSuccessful = true;
  } catch (e) {
    isInvalidToken = true;
    const { response } = e as AxiosError;
    const status = response?.status;
    if (status) handleAccessTokenErrors(status);
  }
  return [isAlterSuccessful, isInvalidToken];
};

export const requestWithdrawal = async (inputPassword: string) => {
  let isWithdrawalSuccessful = false;
  let isInvalidToken = false;
  try {
    const { status } = await requestWithTokenAxios.put("/user/withdraw", {
      inputPassword,
    });
    if (status === SERVER_STATUS.OK) isWithdrawalSuccessful = true;
  } catch (e) {
    isInvalidToken = true;
    const { response } = e as AxiosError;
    const status = response?.status;
    if (status) handleAccessTokenErrors(status);
  }
  return [isWithdrawalSuccessful, isInvalidToken];
};

export const requestSignIn = async (id: string, password: string) => {
  let userInfo = null;
  try {
    const { data } = await signinAxios.post<ISignedIn>("/user/signin", {
      id,
      password,
    });
    userInfo = data;
  } catch (e) {
    const { response } = e as AxiosError;
    const status = response?.status;
    if (status) handleAccessTokenErrors(status);
  }
  return userInfo;
};

export const requestSignUp = async (formData: FormData) => {
  let isSignUpSuccessful = false;
  try {
    const { status } = await signupAxios.post("/user/signup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (status === SERVER_STATUS.OK) isSignUpSuccessful = true;
  } catch (e) {
    const { response } = e as AxiosError;
    const status = response?.status;
    if (status) handleNormalErrors(status);
  }
  return isSignUpSuccessful;
};
