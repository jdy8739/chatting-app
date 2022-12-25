import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { IRoom } from "../../types/types";
import { IUserInfoSelector } from "../../utils/interfaces";
import { toastConfig } from "../../utils/utils";
import Modal from "./Modal";
import Image from "next/image";

const FlexGrow = { flexGrow: "1" };

function Room({ room, index }: { room: IRoom; index: number }) {
  const router = useRouter();
  const [isModalShown, setIsModalShown] = useState(false);
  const { userNo } = useSelector(
    ({ signInReducer: { userInfo } }: IUserInfoSelector) => userInfo
  );
  const handleClickChatRoom = () => {
    if (room.nowParticipants === room.limitation) {
      toast.error("The number of participant exceeds limit.", toastConfig);
    } else if (room.pwRequired && room.owner !== userNo) setIsModalShown(true);
    else pushToChatRoom();
  };
  const pushToChatRoom = (password?: string) => {
    const roomId = room.roomId;
    router.push(
      {
        pathname: `/chat/${roomId}`,
        query: { roomName: room.roomName, password, userNo },
      },
      `/chat/${roomId}`
    );
  };
  const hideModal = () => {
    setIsModalShown(false);
  };
  const correctParticipantsNumber = (numberOfParticipants?: number) => {
    if (!numberOfParticipants) return 0;
    else if (numberOfParticipants < 0) return 0;
    else if (numberOfParticipants > room.limitation) return room.limitation;
    else return numberOfParticipants;
  };
  room.nowParticipants = correctParticipantsNumber(room.nowParticipants);
  return (
    <>
      <Draggable draggableId={room.roomId + ""} index={index} key={room.roomId}>
        {(provided, snapshot) => (
          <div
            className={`element isNotDragging
            ${room.nowParticipants === room.limitation ? "isFullRoom" : ""}
            ${
              snapshot.isDragging
                ? room.isMyRoom
                  ? "my-room-isDragging"
                  : "isDragging"
                : ""
            }
            ${room.isMyRoom ? "my-room" : ""}
            `}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={handleClickChatRoom}
          >
            {room.roomName.length > 30
              ? room.roomName.slice(0, 29) + "..."
              : room.roomName}
            <div className="sub-info">
              <Image
                width="50px"
                height="25px"
                src="/people_icon.png"
                alt="people"
              />
              <p>{`${room.nowParticipants}/${room.limitation}`}</p>
              <div style={FlexGrow}></div>
              {room.pwRequired && (
                <Image
                  width="25px"
                  height="25px"
                  src="/lock_icon.png"
                  alt="lick-icon"
                />
              )}
            </div>
          </div>
        )}
      </Draggable>
      <AnimatePresence>
        {isModalShown && (
          <Modal
            roomId={room.roomId}
            query={"This room requires the password."}
            hideModal={hideModal}
            pushToChatRoom={pushToChatRoom}
          />
        )}
      </AnimatePresence>
      <style jsx>{`
        .element {
          padding: 12px;
          margin: 5px;
          color: #2d2d2d;
          transition: all 1s;
          position: relative;
        }
        .isNotDragging {
          background-color: #f6d79f;
        }
        .isDragging {
          background-color: rgb(0, 219, 146);
          box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.4);
        }
        .my-room {
          background-color: #ffc1f7;
        }
        .my-room-isDragging {
          background-color: rgb(182, 165, 230);
          box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.4);
        }
        .isFullRoom {
          background-color: #b87676;
        }
        .element:hover {
          background-color: orange;
        }
        .sub-info {
          width: 110px;
          position: absolute;
          top: 9px;
          right: 10px;
          display: flex;
        }
        .sub-info > p {
          margin-top: 6px;
          font-size: 12px;
        }
      `}</style>
    </>
  );
}

export default React.memo(Room);
