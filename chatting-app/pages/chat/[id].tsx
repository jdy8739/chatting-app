import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Seo from "../../components/commons/Seo";
import InputInterface from "../../components/[id]/InputInterface";
import MessageComponent from "../../components/[id]/MessageComponent";
import UserContainer from "../../components/[id]/UserContainer";
import { IMessageBody, IParticipants } from "../../types/types";
import {
  LIMIT,
  MASTER_PROTOCOL,
  RECEIVE_PROTOCOL,
  SEND_PROTOCOL,
} from "../../utils/enums";
import {
  IChatRoomProps,
  IMessageProps,
  IServerProps,
  IUserInfoSelector,
  SocketStomp,
} from "../../utils/interfaces";
import {
  generateRandonUserId,
  getAccessTokenInCookies,
  scrollViewDown,
} from "../../utils/utils";
import {
  fetchRoomOwnerAndPreviousChat,
  requestMessageDelete,
} from "../../apis/chatApis";
import {
  fetchUserPrivateIpAddress,
  requestUserExpel,
} from "../../apis/userApis";
import { CHATO_TOKEN } from "../../constants/etc";
import { shootChatMessage } from "../../utils/socket";

export let chattingSocketStomp: SocketStomp;
let currentUserName = "";
let previousShowCnt = 0;
let timeOut: NodeJS.Timeout;

function ChattingRoom({
  id,
  roomName,
  password,
  previousChat,
  roomOwner,
  numberOfParticipants,
  roomOwnerId,
}: IChatRoomProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<IMessageBody[]>(previousChat);
  const [isAllChatShown, setIsAllChatShown] = useState(
    previousChat.length < LIMIT.CHAT_REMAIN_NUMBER
  );
  const [targetChatNumber, setTargetChatNumber] = useState(-1);
  const [participants, setParticipants] = useState<IParticipants[]>([]);
  const [numberOfPcps, setNumberOfPcps] = useState(numberOfParticipants);
  const { userNo, userId, userNickName } = useSelector(
    ({ signInReducer: { userInfo } }: IUserInfoSelector) => userInfo
  );
  const subscribeNewMessage = () => {
    chattingSocketStomp.stomp.subscribe(
      `/sub/chat/room/${id}`,
      ({ body }: { body: string }) => {
        const newMessage: IMessageBody = JSON.parse(body);
        const isSentFromMaster = newMessage.writer === MASTER_PROTOCOL.MASTER;
        if (
          isSentFromMaster &&
          newMessage.message === MASTER_PROTOCOL.DISBANDED
        ) {
          expelUser();
        } else {
          const msgNo = newMessage.msgNo;
          const isParticipantsListChanged =
            msgNo >= RECEIVE_PROTOCOL.SUBSCRIBE &&
            msgNo <= RECEIVE_PROTOCOL.BAN;
          if (isSentFromMaster && isParticipantsListChanged)
            reflectNewMessageAndUser(newMessage);
          else updateMessageList(newMessage);
        }
      },
      { roomId: String(id), userId: userId || currentUserName }
    );
  };
  const reflectNewMessageAndUser = (newMessage: IMessageBody) => {
    const msgNo = newMessage.msgNo;
    const [targetId, targetNickName] = newMessage.message.split("/");
    if (msgNo === RECEIVE_PROTOCOL.BAN) {
      if (userId ? targetId === userId : targetId === currentUserName)
        expelUser();
      newMessage.message = `${targetId.slice(0, 9)} has been banned.`;
    } else if (msgNo !== null) {
      newMessage.message = `${targetId.slice(0, 9)} has just ${
        msgNo ? "left" : "joined"
      } the room.`;
      updateParticipantsList(
        {
          id: targetId,
          nickName: targetNickName === "null" ? null : targetNickName,
        },
        Boolean(msgNo)
      );
    }
    updateMessageList(newMessage);
  };
  const updateMessageList = (newMessageInfo: IMessageBody) => {
    const message = newMessageInfo.message;
    const target = Number(message);
    const isSentFromMaster = newMessageInfo.writer === MASTER_PROTOCOL.MASTER;
    if (isSentFromMaster && !window.isNaN(target)) {
      setMessages((messages) => {
        const copied = [...messages];
        const targetIndex = copied.findIndex((chat) => chat.msgNo === target);
        copied[targetIndex]["isDeleted"] = true;
        return copied;
      });
      return;
    } else setMessages((messages) => [...messages, newMessageInfo]);
    if (!isSentFromMaster) scrollViewDown();
  };
  const updateParticipantsList = (
    targetUser: IParticipants,
    isUserOut: boolean
  ) => {
    setNumberOfPcps((numberOfPcps) =>
      isUserOut ? numberOfPcps - 1 : numberOfPcps + 1
    );
    setParticipants((participants) => {
      if (isUserOut) {
        const targetIndex = participants.findIndex(
          (participant) => participant.id === targetUser.id
        );
        if (targetIndex === -1) return participants;
        participants.splice(targetIndex, 1);
      } else participants.push(targetUser);
      return [...participants];
    });
  };
  const showPreviousChat = async () => {
    if (!isAllChatShown) {
      const { messageList: newMessages } = await fetchRoomOwnerAndPreviousChat({
        id,
        userNo,
        count: ++previousShowCnt,
        password,
      });
      if (newMessages && newMessages.length > 0) {
        if (newMessages.length < LIMIT.CHAT_REMAIN_NUMBER)
          setIsAllChatShown(true);
        setTargetChatNumber(-1);
        setMessages((messages) => {
          const copied = [...newMessages.reverse(), ...messages];
          return copied;
        });
      }
    }
  };
  const handleChatDblClick = useCallback(
    (index: number, isNumberMatches: boolean) => {
      if (isNumberMatches) setTargetChatNumber(-1);
      else {
        setTargetChatNumber(index);
        timeOut = setTimeout(() => {
          setTargetChatNumber(-1);
        }, 3000);
      }
      clearTimeout(timeOut);
    },
    []
  );
  const deleteChat = useCallback(async (id: number, msgNo: number) => {
    const isDeleteSuccessful = await requestMessageDelete(id, msgNo);
    if (isDeleteSuccessful) {
      shootChatMessage(SEND_PROTOCOL.DELETE, {
        msgNo: 0,
        roomId: String(id),
        message: String(msgNo),
        writer: MASTER_PROTOCOL.MASTER,
        writerNo: userNo > 0 ? userNo : null,
      });
      setTargetChatNumber(-1);
    }
  }, []);
  const expelUser = async () => {
    const userPrivateIpAddress = await fetchUserPrivateIpAddress();
    if (userPrivateIpAddress) {
      const isUserBanSuccessful = await requestUserExpel(
        id,
        userPrivateIpAddress,
        currentUserName
      );
      if (isUserBanSuccessful) router.push("/chat/list");
    }
  };
  const checkIfIsMyChat = useCallback(<T extends number | string>(arg: T) => {
    if (typeof arg === "string") return arg === currentUserName;
    else if (typeof arg === "number") return arg === userNo;
  }, []);
  const startAndSubscribeChatting = () => {
    currentUserName = userNickName ? userNickName : generateRandonUserId();
    chattingSocketStomp.stomp.connect({}, () => {
      subscribeNewMessage();
    });
  };
  useEffect(() => {
    chattingSocketStomp = new SocketStomp();
    if (!getAccessTokenInCookies(CHATO_TOKEN)) startAndSubscribeChatting();
    return () => {
      chattingSocketStomp.stomp.disconnect(() => null, {});
      currentUserName = "";
      previousShowCnt = 0;
      clearTimeout(timeOut);
    };
  }, []);
  useEffect(() => {
    if (userNo !== -1) startAndSubscribeChatting();
  }, [userNo]);

  /* start making props for message-components. */
  const array: IMessageProps[] = [];
  let count = 0;
  for (const message of messages) {
    const prevWriter = messages[count - 1]?.writer;
    const prevTime = messages[count - 1]?.time;
    const isNumberMatches = targetChatNumber === count;
    array.push({
      prevWriter,
      prevTime,
      isNumberMatches,
      index: count++,
      isDeleted: message.isDeleted || false,
    });
  }
  const profileAndRoomInfo = { userNo, roomOwner, roomId: id };
  const comparisonLogicFunctions = {
    checkIfIsMyChat,
    deleteChat,
    handleChatDblClick,
  };
  /* props making end. */
  return (
    <>
      <Seo title={`Chato room ${roomName}`} />
      <UserContainer
        roomId={id}
        participants={participants}
        myId={userId || currentUserName}
        myUserNo={userNo}
        roomOwner={roomOwner}
        roomOwnerId={roomOwnerId}
        setParticipants={setParticipants}
        numberOfPcps={numberOfPcps}
      />
      <div className="container">
        {isAllChatShown || (
          <div className="previous-chat-show" onClick={showPreviousChat}>
            <h4>show previous</h4>
          </div>
        )}
        {messages.map((msg, i) => {
          return (
            <MessageComponent
              key={msg.msgNo}
              msg={msg}
              {...array[i]}
              {...profileAndRoomInfo}
              {...comparisonLogicFunctions}
            />
          );
        })}
        <InputInterface
          roomId={id}
          isMyRoom={roomOwner === userNo}
          userNo={userNo}
          currentUserName={currentUserName}
        />
        <style jsx>{`
          textarea {
            width: 80%;
            min-height: 100px;
            border: none;
            border-radius: 12px;
            padding: 12px;
            resize: vertical;
          }
          .picture-submit {
            border: 1px solid rgb(0, 219, 146);
          }
          input[type="file"]::-webkit-file-upload-button {
            border: 1px solid rgb(0, 219, 146);
            border-radius: 12px;
            padding: 10px;
            background-color: transparent;
          }
          .previous-chat-show {
            width: 100vw;
            height: 100px;
            background-color: gray;
            position: absolute;
            top: 65px;
            right: 0;
            opacity: 0.4;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #c0c0c0;
            z-index: 10;
          }
          @media screen and (max-width: 768px) {
            .previous-chat-show {
              top: 130px;
            }
          }
        `}</style>
      </div>
    </>
  );
}

export async function getServerSideProps({
  params: { id },
  query: { roomName, password, userNo },
}: IServerProps) {
  let owner: number | null = null;
  let ownerId = "";
  let previousChat: IMessageBody[] | undefined;
  let numberOfParticipants;
  try {
    if (!userNo) userNo = null;
    const userPrivateIpAddress = await fetchUserPrivateIpAddress();
    if (userPrivateIpAddress) {
      const chatRoomInfo = await fetchRoomOwnerAndPreviousChat({
        id,
        userNo,
        count: previousShowCnt,
        password,
        ipAddress: userPrivateIpAddress,
      });
      owner = chatRoomInfo.owner;
      ownerId = chatRoomInfo.ownerId;
      numberOfParticipants = chatRoomInfo.numberOfParticipants;
      previousChat = chatRoomInfo.messageList?.reverse();
      previousChat?.forEach((chat) => {
        if (chat.isDeleted) chat.message = "";
      });
    }
  } catch (e) {
    console.log(`Failed to enter the chat room id ${id}.`);
    return {
      redirect: {
        permanent: false,
        destination: "/room_exception",
      },
      props: {},
    };
  }
  return {
    props: {
      id,
      roomName: roomName || "",
      previousChat: previousChat ? previousChat : [],
      password: password || null,
      roomOwner: owner || "",
      roomOwnerId: ownerId,
      numberOfParticipants,
    },
  };
}

export default ChattingRoom;
