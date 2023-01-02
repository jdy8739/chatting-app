import axios, { AxiosError } from "axios";
import { SERVER_STATUS } from "../utils/enums";
import { IRoom } from "../types/types";
import { IRoomMoved } from "../utils/interfaces";
import { requestWithTokenAxios } from "../utils/axios";
import { handleAccessTokenErrors } from "../utils/utils";
import { toast } from "react-toastify";
import { toastConfig } from "../constants/etc";

export const fetchAllRoomsList = async () => {
  let rooms = null;
  try {
    const { data } = await axios.get<IRoom[]>("/room/list");
    rooms = data;
  } catch (e) {
    const { response } = e as AxiosError;
    console.log(
      `Failed to fetch room list. Server status: ${response?.status}.`
    );
  }
  return rooms;
};

export const requestChangeToNewSubject = async (roomMovedInfo: IRoomMoved) => {
  let isInValidToken = false;
  try {
    const { status } = await requestWithTokenAxios.put(
      "/room/change_subject",
      roomMovedInfo
    );
    if (status !== SERVER_STATUS.OK) throw new AxiosError(String(status));
  } catch (e) {
    const { response, message } = e as AxiosError;
    const status = response?.status || +message;
    if (status === SERVER_STATUS.UNAUTHORIZED) isInValidToken = true;
    handleAccessTokenErrors(status);
  }
  return isInValidToken;
};

export const requestRoomDelete = async (targetRoomId: number) => {
  let isRoomDeleteSuccessful = false;
  let isInValidToken = false;
  try {
    const { status } = await requestWithTokenAxios.delete(
      `/room/delete/${targetRoomId}`
    );
    if (status === SERVER_STATUS.OK) isRoomDeleteSuccessful = true;
    else throw new AxiosError(String(status));
  } catch (e) {
    const { response, message } = e as AxiosError;
    const status = response?.status || +message;
    if (status === SERVER_STATUS.UNAUTHORIZED) isInValidToken = true;
    handleAccessTokenErrors(status);
  }
  return [isRoomDeleteSuccessful, isInValidToken];
};

export const requestToggleSubjectLike = async (
  subject: string,
  isAddLike: boolean
) => {
  let isToggleSubjectLikeSuccessful = false;
  try {
    const { status } = await requestWithTokenAxios.post(
      "/user/manage_subject_like",
      { subject, isAddLike }
    );
    if (status === SERVER_STATUS.OK) isToggleSubjectLikeSuccessful = true;
  } catch (e) {
    const { response } = e as AxiosError;
    const status = response?.status;
    if (status) handleAccessTokenErrors(status);
  }
  return isToggleSubjectLikeSuccessful;
};

export const fetchRoomsByKeyword = async (keyword: string) => {
  let searchedRooms = null;
  try {
    const { data } = await axios.get<Array<IRoom>>(
      `/room/search?keyword=${keyword}`
    );
    if (!data || data.length === 0) throw new Error();
    searchedRooms = data;
  } catch (e) {
    toast.error("No rooms have been found. :(", toastConfig);
  }
  return searchedRooms;
};

export const checkIfIsPasswordCorrect = async (
  roomId: number,
  password: string
) => {
  let isPasswordCorrect = false;
  try {
    const { data } = await axios.post<boolean>("/room/enter_password", {
      roomId,
      password,
    });
    if (!data) throw new Error();
    isPasswordCorrect = data;
  } catch (e) {
    toast.error("Password is not correct.", toastConfig);
  }
  return isPasswordCorrect;
};
