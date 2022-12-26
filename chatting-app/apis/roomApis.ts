import { SERVER_STATUS } from "../constants/enums";
import { IRoomMoved } from "../utils/interfaces";
import { requestWithTokenAxios } from "../utils/utils";

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
