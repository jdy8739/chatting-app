import { listSocketStomp } from "../pages/chat/list";
import { chattingSocketStomp } from "../pages/chat/[id]";
import { IMessageBody } from "../types/types";
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

export const startChatting = async (subscribeNewMessage: () => void) => {
  const isChattingStartedSuccessfully = await connectSocketCommunication();
  if (isChattingStartedSuccessfully) subscribeNewMessage();
  return isChattingStartedSuccessfully;
};

export const makeUserName = (userNickName: string) => {
  return userNickName ? userNickName : generateRandonUserId();
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
