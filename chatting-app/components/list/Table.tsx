import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { SECTION } from "../../constants/enums";
import Room from "./Room";
import Image from "next/image";
import { ITableComponent, ITable } from "../../utils/interfaces";
import { PUBLIC_ICONS_PATH } from "../../constants/icons";

function Table({
  rooms,
  subject,
  isPinned,
  toggleLikeList,
  index,
  subjectList,
}: ITableComponent) {
  /* console.log('table rendered.'); */
  const updateRoomMoved = () => {
    toggleLikeList(
      isPinned ? SECTION.NOT_PINNED : SECTION.PINNED,
      subject,
      subjectList
    );
  };
  return (
    <>
      <Draggable draggableId={subject} key={subject} index={index}>
        {(provided) => (
          <div
            className="table"
            ref={provided.innerRef}
            {...provided.dragHandleProps}
            {...provided.draggableProps}
          >
            <div className="title">
              <h3>{subject}</h3>
              <div className="liked" onClick={updateRoomMoved}>
                {isPinned && (
                  <Image
                    width="32px"
                    height="32px"
                    src={`${PUBLIC_ICONS_PATH.PIN}`}
                    alt="pinned-icon"
                  />
                )}
              </div>
            </div>
            <Droppable droppableId={subject} key={subject} type="active">
              {(provided, snapshot) => (
                <div
                  className={`body 
                  ${snapshot.draggingFromThisWith ? "draggingFromThisWith" : ""}
                  ${snapshot.draggingOverWith ? "isDraggingOver" : ""}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  {...snapshot}
                >
                  {rooms.map((room, index) => (
                    <Room key={room.roomId} room={room} index={index} />
                  ))}
                </div>
              )}
            </Droppable>
          </div>
        )}
      </Draggable>
      <style jsx>{`
        .table {
          background-color: white;
          width: 305px;
          min-height: 400px;
          margin: 12px;
          border-radius: 6px;
          box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
          padding: 6px;
          display: flex;
          flex-direction: column;
        }
        .title {
          color: orange;
          text-align: center;
          position: relative;
        }
        .liked {
          position: absolute;
          top: 3px;
          right: 3px;
          background-color: #ec17b3;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 1s;
        }
        .liked:hover {
          background-color: orange;
        }
        .liked > img {
          position: absolute;
          top: -22px;
        }
        .body {
          flex-grow: 1;
          background-color: #f3f3f3;
          box-shadow: inset 0px 12px 20px -10px rgba(0, 0, 0, 0.2);
        }
        .draggingFromThisWith {
          background-color: #76d7fe;
        }
        .isDraggingOver {
          background-color: #76feba;
        }
      `}</style>
    </>
  );
}

const judgeEqual = (
  { subjectList: proSubjectList, isPinned: proIsPinned }: ITable,
  { subjectList, isPinned }: ITable
) => {
  return proSubjectList !== subjectList && proIsPinned === isPinned;
};

/* 위 함수를 shouldComponentUpdate에 적용시키면 테이블 고정, 고정 해제에는 불필요한 렌더링을 방지할 수
있지만 타 사용자 채팅방 출입의 재렌더링에 대해서는 다른 테이블까지 모든 불필요한 렌더링을 하게되어 뺏음. */

export default React.memo(Table);
