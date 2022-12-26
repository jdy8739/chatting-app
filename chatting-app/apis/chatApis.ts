import axios from "axios";
import { SERVER_STATUS } from "../constants/enums";
import { IChatRoomInfo, IFetchMessagesProps } from "../utils/interfaces";

export const fetchRoomOwnerAndPreviousChat = async ({
  id,
  userNo,
  count,
  password,
  ipAddress,
}: IFetchMessagesProps): Promise<IChatRoomInfo> => {
  let fetchedChatRoomInfo = null;
  try {
    const { data } = await axios.post(`/room/message/${id}?offset=${count}`, {
      password,
      ipAddress,
      userNo,
    });
    fetchedChatRoomInfo = data;
  } catch (e) {
    // show toast;
  }
  return fetchedChatRoomInfo;
};

export const requestMessageDelete = async (id: number, msgNo: number) => {
  let isDeleteSuccessful = false;
  try {
    const { status } = await axios.delete(
      `/room/del_message/${id}?msg_no=${msgNo}`
    );
    if (status === SERVER_STATUS.OK) isDeleteSuccessful = true;
  } catch (e) {
    // show toast;
  }
  return isDeleteSuccessful;
};
