import axios from "axios";
import { SERVER_STATUS } from "../constants/enums";
import { Iipdata, IParticipants } from "../types/types";
import { IBannedUserList, ISignedIn } from "../utils/interfaces";
import {
  API_KEY_REQUEST_URL,
  requestWithTokenAxios,
  signinAxios,
  signupAxios,
} from "../utils/utils";

export const fetchUserInfo = async () => {
  let userInfo = null;
  try {
    const { data } = await requestWithTokenAxios.get<ISignedIn>(
      `/user/get-userInfo`
    );
    if (data) userInfo = data;
  } catch (e) {
    // show toast;
  }
  return userInfo;
};

export const requestSignOut = async () => {
  let isSignOutSuccessful = false;
  try {
    const { status } = await requestWithTokenAxios.get(`/user/signout`);
    if (status === SERVER_STATUS.OK) isSignOutSuccessful = true;
  } catch (e) {
    // show toast;
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
    // show toast;
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
    // show toast;
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
    // show toast;
  }
  return bannedUserList;
};

export const requestUserExpel = async (
  roomId: number,
  ipAddress: string,
  userName: string
) => {
  let isUserBanSuccessful = false;
  try {
    const { status } = await axios.post(`/user/add_banned`, {
      roomId,
      ipAddress,
      userName,
    });
    if (status === SERVER_STATUS.OK) {
      // show toast; -> "This room is disbanded." or "You are banned!"
      isUserBanSuccessful = true;
    }
  } catch (e) {
    // show toast;
  }
  return isUserBanSuccessful;
};

export const unlockBannedIpAddress = async (
  bannedIpNo: number,
  roomId: number
) => {
  let isUnlockSuccessful = false;
  try {
    const { status } = await requestWithTokenAxios.post(`/room/unlock_ban`, {
      bannedIpNo,
      roomId,
    });
    if (status === SERVER_STATUS.OK) isUnlockSuccessful = true;
  } catch (e) {
    // show toast;
  }
  return isUnlockSuccessful;
};

export const fetchUserSettingsInfo = async () => {
  let userSettingsInfo = null;
  try {
    const { data } = await requestWithTokenAxios.get(`/user/info`);
    userSettingsInfo = data;
  } catch (e) {
    // show toast;
  }
  return userSettingsInfo;
};

export const requestAlterUserSettingsInfo = async (formData: FormData) => {
  let isAlterSuccessful = false;
  try {
    const { status } = await requestWithTokenAxios.put(`/user/alter`, formData);
    if (status === SERVER_STATUS.OK) isAlterSuccessful = true;
  } catch (e) {
    // show toast;
  }
  return isAlterSuccessful;
};

export const requestWithdrawal = async (inputPassword: string) => {
  let isWithdrawalSuccessful = false;
  try {
    const { status } = await requestWithTokenAxios.put(`/user/withdraw`, {
      inputPassword,
    });
    if (status === SERVER_STATUS.OK) isWithdrawalSuccessful = true;
  } catch (e) {
    // show toast;
  }
  return isWithdrawalSuccessful;
};

export const requestSignIn = async (id: string, password: string) => {
  let userInfo = null;
  try {
    const { data } = await signinAxios.post<ISignedIn>(`/user/signin`, {
      id,
      password,
    });
    userInfo = data;
  } catch (e) {
    // show toast;
  }
  return userInfo;
};

export const requestSignUp = async (formData: FormData) => {
  let isSignUpSuccessful = false;
  try {
    const { status } = await signupAxios.post(`/user/signup`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (status === SERVER_STATUS.OK) isSignUpSuccessful = true;
  } catch (e) {
    // show toast;
  }
  return isSignUpSuccessful;
};
