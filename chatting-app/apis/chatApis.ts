import axios, { AxiosError } from "axios";
import { SERVER_STATUS } from "../utils/enums";
import { IChatRoomInfo, IFetchMessagesProps } from "../utils/interfaces";
import { handleNormalErrors } from "../utils/utils";

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
    console.log(e);
    if (!fetchedChatRoomInfo) throw new Error();
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
    const { response } = e as AxiosError;
    const status = response?.status;
    if (status) handleNormalErrors(status);
  }
  return isDeleteSuccessful;
};
