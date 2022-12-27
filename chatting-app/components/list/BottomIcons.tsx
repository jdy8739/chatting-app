import { AnimatePresence } from "framer-motion";
import React, { Dispatch, SetStateAction, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { SECTION } from "../../utils/enums";
import { ITable } from "../../utils/interfaces";
import Modal from "./Modal";
import Image from "next/image";

function BottomIcons({
  setRoomList,
}: {
  setRoomList: Dispatch<SetStateAction<ITable>>;
}) {
  const [isModalShown, setIsModalShown] = useState(false);
  const addSubjectTable = (newTableName: string) => {
    setIsModalShown(false);
    setRoomList((roomList) => {
      if (
        Object.keys(roomList).some((tableName) => {
          if (tableName === newTableName) return true;
        })
      )
        return roomList;
      else
        return {
          ...roomList,
          [newTableName]: { list: [], isPinned: false },
        };
    });
  };
  return (
    <div className="icons">
      <Image
        className="icon"
        width="70px"
        height="70px"
        src={"/pen.png"}
        onClick={() => setIsModalShown(true)}
        alt="pen-icon"
      />
      <Droppable droppableId={`${SECTION.TRASH_CAN}`} type="active">
        {(provided, snapshot) => (
          <span
            ref={provided.innerRef}
            {...provided.droppableProps}
            {...snapshot}
          >
            <Image
              width="70px"
              height="70px"
              src={"/trash_can.png"}
              className={`icon trash-can ${
                snapshot.isDraggingOver ? "bigger" : ""
              }`}
              alt="trash-can-icon"
            />
          </span>
        )}
      </Droppable>
      <AnimatePresence>
        {isModalShown && (
          <Modal
            query={"Make a room subject you want."}
            hideModal={() => setIsModalShown(false)}
            addSubjectTable={addSubjectTable}
          />
        )}
      </AnimatePresence>
      <style jsx>{`
        .icons {
          position: fixed;
          right: 30px;
          bottom: 30px;
        }
        .icon {
          margin: 8px;
        }
        .icon:first-child {
          cursor: pointer;
        }
        .trash-can {
          transition: all 0.5s;
        }
        .bigger {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}

export default React.memo(BottomIcons);
