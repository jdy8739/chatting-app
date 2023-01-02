import { AnimatePresence } from "framer-motion";
import React, { Dispatch, SetStateAction, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { SECTION } from "../../utils/enums";
import { ITable } from "../../utils/interfaces";
import Modal from "./Modal";
import Image from "next/image";
import { PUBLIC_ICONS_PATH } from "../../constants/icons";

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
      <span className="icon">
        <Image
          width="70px"
          height="70px"
          src={`${PUBLIC_ICONS_PATH.PEN}`}
          onClick={() => setIsModalShown(true)}
          alt="pen-icon"
        />
      </span>
      <Droppable droppableId={`${SECTION.TRASH_CAN}`} type="active">
        {(provided, snapshot) => (
          <span
            ref={provided.innerRef}
            {...provided.droppableProps}
            {...snapshot}
          >
            <span
              className={`icon trash-can ${
                snapshot.isDraggingOver ? "bigger" : ""
              }`}
            >
              <Image
                width="70px"
                height="70px"
                src={`${PUBLIC_ICONS_PATH.TRASH_CAN}`}
                alt="trash-can-icon"
              />
            </span>
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
        .icons > .icon:first-child {
          cursor: pointer;
        }
        .trash-can {
          transition: all 0.5s;
        }
        .bigger {
          // transform: scale(1.2);
          background-color: red;
        }
      `}</style>
    </div>
  );
}

export default React.memo(BottomIcons);
