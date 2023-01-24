import React from "react";
import { MASTER_PROTOCOL } from "../../utils/enums";
import Image from "next/image";
import { IMessageComponent, IMessageContent } from "../../utils/interfaces";
import { IMAGE_STYLE } from "../../constants/styles";
import { PUBLIC_ICONS_PATH } from "../../constants/icons";

function MessageComponent({
  msg,
  index,
  prevWriter,
  prevTime,
  checkIfIsMyChat,
  deleteChat,
  handleChatDblClick,
  userNo,
  roomOwner,
  roomId,
  isNumberMatches,
}: IMessageComponent) {
  /* console.log('A message component rendered.'); */
  const isMyMessage = msg.writerNo === userNo;
  const isSameTimeMessage = prevTime !== msg.time;
  const checkIsEligibleToDelete = () => {
    return checkIfIsMyChat(msg.writer) || isMyMessage || roomOwner === userNo;
  };
  return (
    <div
      className={`chat-box ${
        checkIfIsMyChat(msg.writer) || isMyMessage
          ? "my-chat-box"
          : "others-chat-box"
      }`}
    >
      {index === 0 ? (
        <ChatInfo writer={msg.writer} />
      ) : (
        prevWriter !== msg.writer && (
          <ChatInfo
            writer={msg.writer}
            isRoomOwner={Boolean(roomOwner) && msg.writerNo === roomOwner}
          />
        )
      )}
      {msg.writer === MASTER_PROTOCOL.MASTER ? (
        <span className="master-chat">{msg.message}</span>
      ) : (
        <>
          {index !== 0 &&
            isSameTimeMessage &&
            ((userNo < 0 && checkIfIsMyChat(msg.writer)) || isMyMessage) && (
              <ChatTime time={msg.time || ""} />
            )}
          <span
            onDoubleClick={() =>
              checkIsEligibleToDelete() &&
              handleChatDblClick(index, isNumberMatches)
            }
            className={`chat 
              ${
                checkIfIsMyChat(msg.writer) || isMyMessage
                  ? "my-chat"
                  : "others-chat"
              }
              ${msg.isDeleted ? "deleted-chat" : ""}
            `}
          >
            {!msg.isDeleted && isNumberMatches && (
              <span
                onClick={() => deleteChat(roomId, msg.msgNo)}
                className="delete-btn"
              >
                <span>x</span>
              </span>
            )}
            <ChatContent
              isDeleted={msg.isDeleted}
              isPicture={msg.isPicture}
              content={msg.message}
              msgNo={msg.msgNo}
              roomId={roomId}
            />
          </span>
          {index !== 0 &&
            isSameTimeMessage &&
            !checkIfIsMyChat(msg.writer) &&
            !isMyMessage && <ChatTime time={msg.time || ""} />}
        </>
      )}
    </div>
  );
}

function ChatInfo({
  writer,
  isRoomOwner,
}: {
  writer: string;
  isRoomOwner?: boolean;
}) {
  return (
    <>
      {writer !== MASTER_PROTOCOL.MASTER && (
        <span>
          {isRoomOwner && (
            <Image
              width="30px"
              height="25px"
              src={`${PUBLIC_ICONS_PATH.CROWN}`}
              alt="crown-icon"
            />
          )}
          <h5>{writer.slice(0, 9)}</h5>
        </span>
      )}
    </>
  );
}

function ChatTime({ time }: { time: string }) {
  return (
    <>
      &emsp;<span className="chat-time">{time}</span>&emsp;
    </>
  );
}

function ChatContent({
  isDeleted,
  isPicture,
  content,
  roomId,
  msgNo,
}: IMessageContent) {
  return (
    <>
      {isPicture && !isDeleted ? (
        <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}/room/content-pic/${roomId}/${msgNo}`}
          style={IMAGE_STYLE}
          width="180px"
          height="180px"
          alt={`room: ${roomId} image-content: ${msgNo}`}
          loading="lazy"
          layout="intrinsic"
          placeholder="empty"
        />
      ) : (
        <span>{isDeleted ? "deleted message" : content}</span>
      )}
    </>
  );
}

/*
true를 반환하는 것으로 React가 갱신 작업을 건너뛰게 만들 수 있다.
기존 class 컴포넌트의 shouldComponentUpdate 함수에서는 false를 반환할 때 re-render 작업을 건너뜀.
memo 함수의 두 번째 인자로 함수를 넣어주면 된다.
vue.js의 watch와 비슷함.
*/

const judgeEqual = (
  { index: prevIndex }: IMessageComponent,
  { index }: IMessageComponent
) => {
  return prevIndex !== index;
};

export default React.memo(MessageComponent);
