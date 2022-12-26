import axios, { AxiosError } from "axios";
import { SERVER_STATUS } from "../constants/enums";
import { IRoom } from "../types/types";
import { IRoomMoved } from "../utils/interfaces";
import { requestWithTokenAxios } from "../utils/utils";

export const fetchAllRoomsList = async () => {
  let rooms = null;
  try {
    const { data } = await axios.get<IRoom[]>(`/room/list`);
    rooms = data;
  } catch (e) {
    const { response } = e as AxiosError;
    console.log(`Error. Server status: ${response?.status}.`);
  }
  return rooms;
};

export const requestRoomDelete = async (targetRoomId: number) => {
  let isRoomDeleteSuccessful = false;
  try {
    const { status } = await requestWithTokenAxios.delete(
      `/room/delete/${targetRoomId}`
    );
    if (status === SERVER_STATUS.OK) isRoomDeleteSuccessful = true;
  } catch (e) {
    // show toast;
  }
  return isRoomDeleteSuccessful;
};

export const requestToggleSubjectLike = async (
  subject: string,
  isAddLike: boolean
) => {
  let isToggleSubjectLikeSuccessful = false;
  try {
    const { status } = await requestWithTokenAxios.post(
      `/user/manage_subject_like`,
      { subject, isAddLike }
    );
    if (status === SERVER_STATUS.OK) isToggleSubjectLikeSuccessful = true;
  } catch (e) {
    // show toast;
  }
  return isToggleSubjectLikeSuccessful;
};

export const requestChangeToNewSubject = async (roomMovedInfo: IRoomMoved) => {
  let isChangeSuccessful = false;
  try {
    const { status } = await requestWithTokenAxios.put(
      `/room/change_subject`,
      roomMovedInfo
    );
    if (status === SERVER_STATUS.OK) isChangeSuccessful = true;
  } catch (e) {
    // show toast;
  }
  return isChangeSuccessful;
};

export const fetchRoomsByKeyword = async (keyword: string) => {
  let searchedRooms = null;
  try {
    const { data } = await axios.get<Array<IRoom>>(
      `/room/search?keyword=${keyword}`
    );
    searchedRooms = data;
  } catch (e) {
    // show toast;
  }
  return searchedRooms;
};

export const checkIfIsPasswordCorrect = async (
  roomId: number,
  password: string
) => {
  let isPasswordCorrect = false;
  try {
    const { data } = await axios.post(`/room/enter_password`, {
      roomId,
      password,
    });
    isPasswordCorrect = data;
  } catch (e) {
    // show toast;
  }
  return isPasswordCorrect;
};
