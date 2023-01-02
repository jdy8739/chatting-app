import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { LIMIT, MASTER_PROTOCOL, SEND_PROTOCOL } from "../../utils/enums";
import { getNowTime } from "../../utils/utils";
import { IInputInterface } from "../../utils/interfaces";
import SettingsContent from "./SettingsContent";
import { requestRoomDelete } from "../../apis/roomApis";
import { modalBgVariant } from "../../constants/styles";
import { chattingSocketStomp } from "../../pages/chat/[id]";
import { shootChatMessage } from "../../utils/socket";
import { toastConfig } from "../../constants/etc";

let imageFile: ArrayBuffer | null;

const handleReaderOnLoad = (readerEvent: ProgressEvent<FileReader>) => {
  const result = readerEvent.target?.result;
  if (result && typeof result !== "string") {
    imageFile = new Uint8Array(result);
  }
};

function InputInterface({
  roomId,
  isMyRoom,
  userNo,
  currentUserName,
}: IInputInterface) {
  let newMessage: string;
  const [isModalShown, setIsModalShown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) {
      const targetFile = e.currentTarget.files[0];
      const fileReader = new FileReader();
      fileReader.onload = handleReaderOnLoad;
      if (fileReader && targetFile) fileReader.readAsArrayBuffer(targetFile);
    }
  };
  const shootBinaryImageMessage = () => {
    if (!imageFile) {
      toast.error("No picture has been chosen.", toastConfig);
    } else if (imageFile.byteLength > LIMIT.STMOP_MESSAGE_SIZE) {
      toast.error("The picture size exceeds the limit.", toastConfig);
    } else {
      const binaryFileHeaders = {
        "content-type": "application/octet-stream",
        "image-size": imageFile.byteLength,
        "room-id": roomId,
        writer: currentUserName,
        "writer-no": userNo > 0 ? userNo : null,
        time: getNowTime(),
      };
      Object.freeze(binaryFileHeaders);
      if (chattingSocketStomp) {
        chattingSocketStomp.stomp.send(
          `/pub/chat/${SEND_PROTOCOL.BINARY}`,
          imageFile,
          binaryFileHeaders
        );
      }
      imageFile = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendChat();
  };
  const handleTextAreaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.keyCode === 13) sendChat();
  };
  const sendChat = () => {
    if (textAreaRef.current?.value === "") return;
    if (textAreaRef.current) {
      newMessage = textAreaRef.current.value;
      textAreaRef.current.value = "";
    }
    if (chattingSocketStomp) {
      shootChatMessage(SEND_PROTOCOL.MESSEGE, {
        msgNo: 0,
        roomId: String(roomId),
        message: newMessage,
        writer: currentUserName,
        writerNo: userNo > 0 ? userNo : null,
        time: getNowTime(),
      });
      textAreaRef.current?.setSelectionRange(0, 0);
    }
  };
  const handleRoomSettings = () => setIsModalShown(true);
  const terminateChatRoom = async () => {
    const isRoomDeleteSuccessful = await requestRoomDelete(roomId);
    if (isRoomDeleteSuccessful) {
      if (chattingSocketStomp)
        chattingSocketStomp.stomp.send(
          `/pub/chat/${SEND_PROTOCOL.DELETE}`,
          JSON.stringify({
            msgNo: 0,
            roomId: String(roomId),
            message: MASTER_PROTOCOL.DISBANDED,
            writer: MASTER_PROTOCOL.MASTER,
            writerNo: null,
          })
        );
    }
  };
  const stopProppagation = (e: React.MouseEvent<HTMLDivElement>) =>
    e.stopPropagation();
  useEffect(() => {
    return () => {
      imageFile = null;
    };
  }, []);
  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleOnChange} />
      <button className="picture-submit" onClick={shootBinaryImageMessage}>
        send picture
      </button>
      <span className="buttons">
        {isMyRoom && (
          <>
            <button onClick={handleRoomSettings}>settings</button>
            <button onClick={terminateChatRoom}>terminate</button>
          </>
        )}
        <Link href="/chat/list">
          <button>exit</button>
        </Link>
      </span>
      <form onSubmit={handleChatSubmit} className="chat-form">
        <textarea ref={textAreaRef} onKeyDown={handleTextAreaKeyDown} />
        <button className="submit-button">submit</button>
      </form>
      <AnimatePresence>
        {isModalShown && (
          <motion.div
            className="modal-bg"
            variants={modalBgVariant}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => setIsModalShown(false)}
          >
            <div className="modal settings" onClick={stopProppagation}>
              <SettingsContent
                roomId={roomId}
                setIsModalShown={setIsModalShown}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx>{`
        textarea {
          outline: 1px solid rgb(0, 219, 146);
        }
        textarea:focus {
          outline: 1px solid orange;
        }
        .chat-form {
          width: 100%;
          display: flex;
          margin-top: 30px;
        }
        textarea {
          width: 80%;
          min-height: 100px;
          border: none;
          border-radius: 12px;
          padding: 12px;
          resize: vertical;
        }
        button {
          border: 1px solid rgb(0, 219, 146);
          background-color: rgb(0, 219, 146, 0.3);
        }
        .submit-button {
          width: 20%;
          margin: 0;
          font-size: 20px;
          font-weight: bold;
        }
        .buttons {
          float: right;
        }
        .settings {
          height: 265px;
        }
      `}</style>
    </>
  );
}

export default InputInterface;
