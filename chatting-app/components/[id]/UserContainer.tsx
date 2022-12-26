import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { truncateList } from "../../lib/store/modules/likedSubjectReducer";
import { signOut } from "../../lib/store/modules/signInReducer";
import Image from "next/image";
import {
  MASTER_PROTOCOL,
  RECEIVE_PROTOCOL,
  SEND_PROTOCOL,
} from "../../constants/enums";
import { CHATO_TOKEN, removeCookie } from "../../utils/utils";
import { IBannedUserList, IUserContainer } from "../../utils/interfaces";
import { USER_STYLE } from "../../constants/styles";
import {
  fetchBannedUserList,
  fetchRoomParticipants,
  unlockBannedIpAddress,
} from "../../apis/userApis";

let fetchCount = 0;

function UserContainer({
  roomId,
  participants,
  myId,
  myUserNo,
  roomOwner,
  roomOwnerId,
  setParticipants,
  shootChatMessage,
  numberOfPcps,
}: IUserContainer) {
  /* console.log('user container updated.'); */
  const router = useRouter();
  const dispatch = useDispatch();
  const [isBannedUserShown, setIsBannedUserShown] = useState(false);
  const [bannedUserList, setBannedUserList] = useState<IBannedUserList[]>([]);
  const fetchNowParticipants = async () => {
    if (fetchCount++ === 0) {
      const participants = await fetchRoomParticipants(roomId);
      if (participants) setParticipants(participants);
    }
  };
  const banThisParticipant = (participantId: string) => {
    shootChatMessage(SEND_PROTOCOL.DELETE, {
      msgNo: RECEIVE_PROTOCOL.BAN,
      roomId: String(roomId),
      writer: MASTER_PROTOCOL.MASTER,
      writerNo: null,
      message: participantId,
    });
  };
  const getBannedUserList = async () => {
    const bannedUserList = await fetchBannedUserList(roomId);
    if (bannedUserList) {
      setIsBannedUserShown(true);
      setBannedUserList(bannedUserList);
    } else handleTokenException();
  };
  const unlockThisUser = async (bannedIpNo: number) => {
    const isUnlockSuccessful = await unlockBannedIpAddress(bannedIpNo, roomId);
    if (isUnlockSuccessful) {
      setBannedUserList((bannedUserList) => {
        return [
          ...bannedUserList.filter(
            (bannedUser) => bannedUser.bannedIpNo !== bannedIpNo
          ),
        ];
      });
    } else handleTokenException();
  };
  const handleTokenException = () => {
    removeCookie(CHATO_TOKEN, { path: "/" });
    dispatch(signOut());
    dispatch(truncateList());
    router.push("/user/signin");
  };
  useEffect(() => {
    return () => {
      fetchCount = 0;
    };
  }, []);
  return (
    <>
      <div className="user-container" onMouseEnter={fetchNowParticipants}>
        <h4 className="number-of-users" style={USER_STYLE.NONE}>
          n {fetchCount === 0 ? numberOfPcps : participants.length}
        </h4>
        <h4
          className="user"
          style={!isBannedUserShown ? USER_STYLE.MARK : USER_STYLE.NONE}
          onClick={() => setIsBannedUserShown(false)}
        >
          users
        </h4>
        {myUserNo === roomOwner && (
          <h4
            className="banned"
            style={isBannedUserShown ? USER_STYLE.MARK : USER_STYLE.NONE}
            onClick={getBannedUserList}
          >
            ban
          </h4>
        )}
        <div className="name-box">
          {!isBannedUserShown
            ? participants.map((participant, i) => {
                return (
                  <div key={i} className="profile">
                    <div className="profile-img">
                      <Image
                        width="100%"
                        height="100%"
                        src={`${process.env.NEXT_PUBLIC_API_URL}/user/profile-pic/${participant.id}`}
                        alt="profile"
                      />
                    </div>
                    {participant.nickName
                      ? participant.nickName
                      : participant.id.slice(0, 9)}
                    <span style={USER_STYLE.MARK}>
                      {participant.id === myId ? "(me)" : ""}
                    </span>
                    {participant.id !== myId && myUserNo === roomOwner && (
                      <Image
                        width="20px"
                        height="20px"
                        src="/out.png"
                        className="out-icon"
                        onClick={() => banThisParticipant(participant.id)}
                        alt="ban-icon"
                      />
                    )}
                    &emsp; &emsp;
                    {participant.id === roomOwnerId && (
                      <Image
                        src="/crown.png"
                        width="30px"
                        height="25px"
                        alt="crown-icon"
                      />
                    )}
                  </div>
                );
              })
            : bannedUserList &&
              bannedUserList.map((bannedUser) => {
                return (
                  <div key={bannedUser.bannedIpNo} className="profile">
                    <h4>
                      {bannedUser.userName.length > 15
                        ? bannedUser.userName.slice(0, 9)
                        : bannedUser.userName}
                      &emsp;
                      {bannedUser.ipAddress}
                    </h4>
                    <Image
                      width="20px"
                      height="20px"
                      src="/out.png"
                      className="out-icon"
                      onClick={() => unlockThisUser(bannedUser.bannedIpNo)}
                      alt="out-icon"
                    />
                  </div>
                );
              })}
        </div>
      </div>
    </>
  );
}

export default React.memo(UserContainer);
