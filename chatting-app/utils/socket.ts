import { listSocketStomp } from "../pages/chat/list";
import { chattingSocketStomp } from "../pages/chat/[id]";
import { IMessageBody, SocketCallback } from "../types/types";
import { SEND_PROTOCOL } from "./enums";
import { generateRandonUserId } from "./utils";

export const shootChatMessage = (
  target: SEND_PROTOCOL,
  message: IMessageBody
) => {
  if (chattingSocketStomp) {
    chattingSocketStomp.stomp.send(
      `/pub/chat/${target}`,
      JSON.stringify(message),
      {}
    );
  }
};

export const sendRoomDeleteMessage = (message: IMessageBody) => {
  if (listSocketStomp)
    listSocketStomp.stomp.send(
      `/pub/chat/${SEND_PROTOCOL.DELETE}`,
      JSON.stringify(message)
    );
};

export const startChatting = async (
  id: number,
  userId: string,
  handleSubscribedChatMessages: SocketCallback
) => {
  const isChattingStartedSuccessfully = await connectSocketCommunication();
  if (isChattingStartedSuccessfully)
    subscribeChatMessage(id, userId, handleSubscribedChatMessages);
  return isChattingStartedSuccessfully;
};

export const makeUserName = (userNickName: string) => {
  return userNickName ? userNickName : generateRandonUserId();
};

export const subscribeChatMessage = (
  id: number,
  userId: string,
  handleSubscribedChatMessages: SocketCallback
) => {
  chattingSocketStomp.stomp.subscribe(
    `/sub/chat/room/${id}`,
    handleSubscribedChatMessages,
    { roomId: String(id), userId: userId }
  );
};

const connectSocketCommunication = () => {
  return new Promise((connectSuccess, connectFail) => {
    chattingSocketStomp.stomp.connect(
      {},
      () => {
        connectSuccess(true);
      },
      () => {
        connectFail(false);
      }
    );
  });
};

export const connectSocketRoomsChange = (
  handleAllRoomsStatusChange: SocketCallback
) => {
  listSocketStomp.stomp.connect({}, () => {
    subscribeAllRoomsChange(handleAllRoomsStatusChange);
  });
};

export const subscribeAllRoomsChange = (
  handleAllRoomsStatusChange: SocketCallback
) => {
  listSocketStomp.stomp.subscribe(
    "/sub/chat/room/list",
    handleAllRoomsStatusChange
  );
};

export const disconnectSocketCommunication = () => {
  chattingSocketStomp.stomp.disconnect(() => null, {});
};

export const disconnectSocketRoomsChange = () => {
  listSocketStomp.stomp.disconnect(() => null, {});
};
