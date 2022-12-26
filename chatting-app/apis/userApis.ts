import axios from "axios";
import { SERVER_STATUS } from "../constants/enums";
import { Iipdata } from "../types/types";
import { API_KEY_REQUEST_URL } from "../utils/utils";

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
