import { useCallback, useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import ClassifiedRooms from "../../components/list/Table";
import { IRoom } from "../../types/types";
import {
  getAccessTokenInCookies,
  getPinnedSubjectStorage,
  removeAccessTokenInCookies,
  setPinnedSubjectStorage,
} from "../../utils/utils";
import BottomIcons from "../../components/list/BottomIcons";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "../../lib/store/modules/signInReducer";
import {
  addInList,
  removeInList,
  truncateList,
} from "../../lib/store/modules/likedSubjectReducer";
import { useRouter } from "next/router";
import { MASTER_PROTOCOL, MSG_TYPE, SECTION } from "../../utils/enums";
import {
  IRoomMoved,
  ISubjectListSelector,
  ITable,
  IUserInfoSelector,
  SocketStomp,
} from "../../utils/interfaces";
import { TABLE_SHOW } from "../../constants/styles";
import {
  fetchAllRoomsList,
  requestChangeToNewSubject,
  requestRoomDelete,
  requestToggleSubjectLike,
} from "../../apis/roomApis";
import { CHATO_TOKEN } from "../../constants/etc";
import {
  disconnectSocketRoomsChange,
  sendRoomDeleteMessage,
  startRoomsSubscribing,
} from "../../utils/socket";
import {
  arrangeEachRoom,
  findSubjectAndRoomIndexByRoomId,
  getArrangedRoomList,
} from "../../utils/roomList";

export let listSocketStomp: SocketStomp;
let renderingCount = 0;

function ChattingList({ rooms }: { rooms: IRoom[] }) {
  let pinnedTableLength = 0;
  let notPinnedTableLength = 0;
  let isTableShown: boolean;
  const router = useRouter();
  const dispatch = useDispatch();
  const [chatRooms, setChatRooms] = useState(rooms);
  const [roomList, setRoomList] = useState<ITable>({});
  const { userNo, userId } = useSelector(
    ({ signInReducer: { userInfo } }: IUserInfoSelector) => userInfo
  );
  const subjectList = useSelector(
    ({ likedSubjectReducer: { subjectList } }: ISubjectListSelector) =>
      subjectList
  );
  const onRoomDragEnd = ({ destination, source, draggableId }: DropResult) => {
    const destinationId = destination?.droppableId;
    const sourceId = source.droppableId;
    const isDestinationAboutPin =
      destinationId === SECTION.PINNED || destinationId === SECTION.NOT_PINNED;
    const isSourceAboutPin =
      sourceId === SECTION.PINNED || sourceId === SECTION.NOT_PINNED;
    if (isSourceAboutPin) {
      if (sourceId === destinationId) return;
      else if (isDestinationAboutPin)
        toggleLikeList(destinationId, draggableId, subjectList);
      else if (destinationId === SECTION.TRASH_CAN) return;
      return;
    } else if (destination) {
      if (destinationId === SECTION.TRASH_CAN) {
        deleteRoom(source.droppableId, source.index);
        return;
      }
      const isSameSubjectMove = sourceId === destinationId;
      const roomMovedInfo: IRoomMoved = {
        sourceId: sourceId,
        destinationId: destinationId || "",
        sourceIndex: source.index,
        destinationIndex: destination.index,
        targetRoomId: isSameSubjectMove
          ? undefined
          : roomList[sourceId].list[source.index].roomId,
      };
      if (!isSameSubjectMove) changeToNewSubject(roomMovedInfo);
      else updateRoomMoved(roomMovedInfo);
    }
  };
  const updateTableMoved = (destination: SECTION, draggableId: string) => {
    setRoomList((roomList) => {
      return {
        ...roomList,
        [draggableId]: {
          list: roomList[draggableId].list,
          isPinned: destination === SECTION.PINNED,
        },
      };
    });
  };
  const updateRoomMoved = ({
    sourceId,
    sourceIndex,
    destinationId,
    destinationIndex,
    targetRoomId,
  }: IRoomMoved) => {
    setRoomList((roomList) => {
      const targetRoomIndex = targetRoomId
        ? roomList[sourceId].list.findIndex((room) => {
            return room.roomId === Number(targetRoomId);
          })
        : sourceIndex;
      const targetRoom = roomList[sourceId].list[targetRoomIndex];
      targetRoom.subject = destinationId;
      roomList[sourceId].list.splice(targetRoomIndex, 1);
      if (!Object.hasOwn(roomList, destinationId)) {
        return {
          ...roomList,
          [sourceId]: {
            list: [...roomList[sourceId].list],
            isPinned: roomList[sourceId].isPinned,
          },
          [destinationId]: {
            list: [targetRoom],
            isPinned: false,
          },
        };
      } else {
        if (targetRoom)
          roomList[destinationId].list.splice(destinationIndex, 0, targetRoom);
        return {
          ...roomList,
          [sourceId]: {
            list: [...roomList[sourceId].list],
            isPinned: roomList[sourceId].isPinned,
          },
          [destinationId]: {
            list: [...roomList[destinationId].list],
            isPinned: roomList[destinationId].isPinned,
          },
        };
      }
    });
  };
  const deleteRoom = async (sourceId: string, index: number) => {
    const targetRoomId = roomList[sourceId].list[index].roomId;
    const [isRoomDeleteSuccessful, isInValidToken] = await requestRoomDelete(
      targetRoomId
    );
    if (isRoomDeleteSuccessful) {
      sendRoomDeleteMessage({
        msgNo: 0,
        roomId: String(targetRoomId),
        message: MASTER_PROTOCOL.DISBANDED,
        writer: MASTER_PROTOCOL.MASTER,
        writerNo: null,
      });
    } else if (isInValidToken) handleTokenException();
  };
  const changeToNewSubject = async (roomMovedInfo: IRoomMoved) => {
    const isInValidToken = await requestChangeToNewSubject(roomMovedInfo);
    if (isInValidToken) handleTokenException();
  };
  const handleAllRoomsStatusChange = ({ body }: { body: string }) => {
    const messageObj = JSON.parse(body);
    if (Object.hasOwn(messageObj, MSG_TYPE.ENTER))
      updateRoomParticipants(messageObj);
    else if (Object.hasOwn(messageObj, MSG_TYPE.DELETE))
      updateRoomDeleted(messageObj);
    else if (Object.hasOwn(messageObj, MSG_TYPE.MOVE))
      updateRoomMoved(messageObj);
    else if (Object.hasOwn(messageObj, MSG_TYPE.CHANGE))
      updateRoomInfoChange(messageObj);
    else updateRoomCreated(messageObj);
  };
  const updateRoomParticipants = (info: {
    roomId: number;
    isEnter: boolean;
  }) => {
    setRoomList((roomList) => {
      const [targetKey, targetIndex] = findSubjectAndRoomIndexByRoomId(
        info.roomId,
        roomList
      );
      if (targetIndex === -1) return roomList;
      if (targetKey) {
        const target = { ...roomList[targetKey].list[+targetIndex] };
        const nowParticipants = target.nowParticipants;
        if (nowParticipants !== undefined) {
          target.nowParticipants = info.isEnter
            ? nowParticipants + 1
            : nowParticipants - 1;
        }
        roomList[targetKey].list.splice(+targetIndex, 1, target);
      }
      return {
        ...roomList,
        [targetKey]: {
          list: [...roomList[targetKey].list],
          isPinned: roomList[targetKey].isPinned,
        },
      };
    });
  };
  const updateRoomCreated = (chatRoom: IRoom) => {
    setRoomList((roomList) => {
      arrangeEachRoom(chatRoom, roomList, userNo);
      const targetRoomList = roomList[chatRoom.subject].list;
      return {
        ...roomList,
        [chatRoom.subject]: {
          list: [...targetRoomList],
          isPinned: Object.hasOwn(roomList, chatRoom.subject)
            ? roomList[chatRoom.subject].isPinned
            : false,
        },
      };
    });
  };
  const updateRoomDeleted = (info: { roomId: number; isDeleted: number }) => {
    setRoomList((roomList) => {
      const [targetKey, targetIndex] = findSubjectAndRoomIndexByRoomId(
        info.roomId,
        roomList
      );
      if (targetIndex === -1) return roomList;
      const targetRoomList = roomList[targetKey].list;
      targetRoomList.splice(+targetIndex, 1);
      setChatRooms((chatRooms) => {
        return chatRooms.filter((chatRoom) => chatRoom.roomId !== info.roomId);
      });
      return {
        ...roomList,
        [targetKey]: {
          list: [...targetRoomList],
          isPinned: roomList[targetKey].isPinned,
        },
      };
    });
  };
  const updateRoomInfoChange = ({
    settingOption,
    pwRequired,
    roomId,
    value,
  }: {
    [key: string]: string;
  }) => {
    setRoomList((roomList) => {
      let targetSubject = undefined;
      let targetIndex = 0;
      Object.keys(roomList).some((subject) => {
        const targetRoom = roomList[subject].list.find((room, index) => {
          if (room.roomId === +roomId) {
            targetIndex = index;
            return true;
          }
        });
        if (targetRoom) {
          targetSubject = subject;
          const option: boolean = JSON.parse(settingOption);
          if (option) targetRoom.pwRequired = JSON.parse(pwRequired);
          else targetRoom.limitation = +value;
          roomList[targetSubject].list[targetIndex] = { ...targetRoom };
          return true;
        }
      });
      if (!targetSubject || targetIndex === -1) return roomList;
      else
        return {
          ...roomList,
          [targetSubject]: {
            list: [...roomList[targetSubject].list],
            isPinned: roomList[targetSubject].isPinned,
          },
        };
    });
  };
  const toggleLikeList = useCallback(
    (destination: SECTION, subject: string, subjectList: string[]) => {
      if (!getAccessTokenInCookies(CHATO_TOKEN))
        setPinnedSubjectStorage(subject);
      else toggleSubjectToServer(subject, subjectList);
      updateTableMoved(destination, subject);
    },
    []
  );
  const toggleSubjectToServer = async (
    subject: string,
    subjectList: string[]
  ) => {
    const checkIfExists = (subjectElem: string) => subjectElem === subject;
    const isAddLike = subjectList.some(checkIfExists);
    const isToggleSubjectLikeSuccessful = await requestToggleSubjectLike(
      subject,
      isAddLike
    );
    if (isToggleSubjectLikeSuccessful) {
      if (isAddLike) dispatch(removeInList(subject));
      else dispatch(addInList(subject));
    } else handleTokenException();
  };
  const handleTokenException = () => {
    removeAccessTokenInCookies(CHATO_TOKEN, { path: "/" });
    dispatch(signOut());
    dispatch(truncateList());
    router.push("/user/signin");
  };
  useEffect(() => {
    (async () => {
      listSocketStomp = new SocketStomp();
      const isRoomsSubscribingStartedSuccessfully = await startRoomsSubscribing(
        handleAllRoomsStatusChange
      );
      if (!isRoomsSubscribingStartedSuccessfully) router.push("/");
      if (!getAccessTokenInCookies(CHATO_TOKEN)) {
        setRoomList(
          getArrangedRoomList(getPinnedSubjectStorage(), chatRooms, userNo)
        );
      }
    })();
    return () => {
      disconnectSocketRoomsChange();
      renderingCount = 0;
    };
  }, []);
  useEffect(() => {
    if (userId && (renderingCount++ === 0 || subjectList.length === 8)) {
      setRoomList(getArrangedRoomList(subjectList, chatRooms, userNo));
    }
  }, [subjectList]);
  useEffect(() => {
    if (userNo === -1) {
      setRoomList(
        getArrangedRoomList(getPinnedSubjectStorage(), chatRooms, userNo)
      );
    }
  }, [userNo]);
  return (
    <>
      <DragDropContext onDragEnd={onRoomDragEnd}>
        {[true, false].map((value) => {
          return (
            <Droppable
              key={String(value)}
              droppableId={`${value ? SECTION.PINNED : SECTION.NOT_PINNED}`}
              direction="horizontal"
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`container grid-box ${
                    value ? SECTION.PINNED : SECTION.NOT_PINNED
                  }
                  ${
                    snapshot.draggingFromThisWith
                      ? "draggingFromThisWith-pin"
                      : ""
                  } 
                ${snapshot.draggingOverWith ? "isDraggingOver-pin" : ""}
                `}
                >
                  {Object.keys(roomList).map((subject, index) => {
                    isTableShown = value
                      ? roomList[subject].isPinned
                      : !roomList[subject].isPinned;
                    if (value && roomList[subject].isPinned)
                      pinnedTableLength++;
                    else if (!value && !roomList[subject].isPinned)
                      notPinnedTableLength++;
                    return (
                      <div
                        key={subject}
                        style={
                          isTableShown
                            ? TABLE_SHOW.VISIBLE
                            : TABLE_SHOW.INVISIBLE
                        }
                      >
                        {isTableShown && (
                          <ClassifiedRooms
                            rooms={roomList[subject].list}
                            subject={subject}
                            isPinned={roomList[subject].isPinned}
                            toggleLikeList={toggleLikeList}
                            index={index}
                            subjectList={subjectList}
                          />
                        )}
                      </div>
                    );
                  })}
                  {value && pinnedTableLength === 0 && (
                    <div className="bg-box">
                      <div className="bg-box-title">PINNED</div>
                      <div>Put the table you want to pin</div>
                    </div>
                  )}
                  {!value && notPinnedTableLength === 0 && (
                    <div className="bg-box">
                      <div className="bg-box-title">UNPINNED</div>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          );
        })}
        <BottomIcons setRoomList={setRoomList} />
      </DragDropContext>
      <style jsx>{`
        .grid-box {
          display: grid;
          grid-template-columns: repeat(auto-fill, 335px);
          justify-content: center;
        }
        .pinned {
          width: 100vw;
          min-height: 400px;
          background-color: #ffd17c;
          transition: all 1s;
          position: relative;
          background-image: linear-gradient(to top, #dadada, transparent),
            url("/pin-board.png");
          background-size: cover;
          background-position: center center;
        }
        .not_pinned {
          width: 100vw;
          min-height: 400px;
          margin-top: 0;
          position: relative;
          background-image: linear-gradient(to top, transparent, #dadada),
            url("/unpinned.png");
          background-size: cover;
          background-position: center center;
        }
        .draggingFromThisWith-pin {
          background-color: violet;
        }
        .isDraggingOver-pin {
          background-color: #37ffde;
        }
        .bg-box {
          position: absolute;
          top: 80px;
          width: 100%;
          text-align: center;
          opacity: 0.8;
          color: white;
        }
        .bg-box-title {
          font-size: 150px;
          text-shadow: 1px 1px 2px gray;
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  const rooms = await fetchAllRoomsList();
  if (rooms) {
    rooms.forEach((room) => {
      if (room.password) delete room.password;
    });
    return {
      props: { rooms },
    };
  } else {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: {},
    };
  }
}

export default ChattingList;
