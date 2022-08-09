import { AnimatePresence } from "framer-motion";
import React, { Dispatch, SetStateAction, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { IClassifiedRoom, SECTION } from "../../pages/chat/list";
import Modal from "./Modal";

function BottomIcons({ setRoomList }: { setRoomList: Dispatch<SetStateAction<IClassifiedRoom>> }) {
    const [isModalShown, setIsModalShown] = useState(false);
    const addSubjectTable = (newTableName: string) => {
        setIsModalShown(false);
        setRoomList(roomList => {
            return {
                ...roomList,
                [newTableName]: { list: [], isPinned: false },
            }
        });
    }
    return (
        <div className="icons">
            <img
                className="icon"
                width="70px"
                height="70px"
                src={'/pen.png'}
                onClick={() => setIsModalShown(true)}
            />
            <Droppable
                droppableId={`${SECTION.TRASH_CAN}`}
                type="active"
            >
                {(provided, snapshot) => (
                    <img
                        width="70px"
                        height="70px"
                        src={'/trash_can.png'}
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                        {...snapshot}
                        className={`icon ${snapshot.isDraggingOver ? 'bigger' : ''}`}
                    />
                )}
            </Droppable>
            <AnimatePresence>
                {isModalShown && 
                <Modal
                    query={'Make a room subject you want.'}
                    hideModal={() => setIsModalShown(false)}
                    addSubjectTable={addSubjectTable}
                />}
            </AnimatePresence>
            <style>{`
                .icons {
                    transition: all 0.5s;
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
                .bigger {
                    transform: scale(1.2);
                }
            `}</style>
        </div>
    )
}

export default React.memo(BottomIcons);