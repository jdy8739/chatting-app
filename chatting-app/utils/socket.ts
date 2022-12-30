import { listSocketStomp } from "../pages/chat/list";
import { chattingSocketStomp } from "../pages/chat/[id]";
import { IMessageBody } from "../types/types";
import { SEND_PROTOCOL } from "./enums";

export const shootChatMessage = (
  target: SEND_PROTOCOL,
  message: IMessageBody
) => {
  if (chattingSocketStomp) {
    chattingSocketStomp.stomp.send(
      `/pub/chat/${target}`,
      JSON.stringify(message),
      {
        sampleHeader: "sampleHeader",
      }
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
