import { IRoom } from "../types/types";
import { ITable } from "./interfaces";

export const arrangeEachRoom = (
  chatRoom: IRoom,
  roomList: ITable,
  userNo: number
) => {
  const subject = chatRoom.subject;
  if (!Object.hasOwn(roomList, subject))
    roomList[subject] = {
      list: [chatRoom],
      isPinned: false,
    };
  else roomList[subject]["list"].push(chatRoom);
  if (userNo === -1) chatRoom.isMyRoom = false;
  else if (chatRoom.owner === userNo) chatRoom.isMyRoom = true;
};

export const checkIfSubjectPinned = (
  targetSubject: string,
  roomList: ITable,
  pinnedSubjects: Array<string>
) => {
  if (pinnedSubjects.some((subject) => subject === targetSubject)) {
    roomList[targetSubject].isPinned = true;
  } else roomList[targetSubject].isPinned = false;
};

export const makeVacantTableIfPinned = (
  defaultRoomListObject: ITable,
  pinnedSubjects: Array<string>
) => {
  pinnedSubjects.forEach((subject) => {
    if (!Object.hasOwn(defaultRoomListObject, subject)) {
      defaultRoomListObject[subject] = { list: [], isPinned: true };
    }
  });
};

export const getArrangedRoomList = (
  pinnedSubjects: Array<string> | null,
  chatRooms: Array<IRoom>,
  userNo: number
) => {
  const defaultRoomListObject: ITable = {};
  chatRooms.forEach((chatRoom) =>
    arrangeEachRoom(chatRoom, defaultRoomListObject, userNo)
  );
  if (pinnedSubjects) {
    Object.keys(defaultRoomListObject).forEach((subject) => {
      checkIfSubjectPinned(subject, defaultRoomListObject, pinnedSubjects);
    });
    makeVacantTableIfPinned(defaultRoomListObject, pinnedSubjects);
  }
  return defaultRoomListObject;
};

export const findSubjectAndRoomIndexByRoomId = (
  roomId: number,
  roomList: ITable
) => {
  let targetKey = "";
  let targetIndex = -1;
  Object.keys(roomList).some((key) => {
    targetIndex = roomList[key].list.findIndex(
      (room) => room.roomId === roomId
    );
    if (targetIndex !== -1) {
      targetKey = key;
      return true;
    }
  });
  return [targetKey, targetIndex];
};
