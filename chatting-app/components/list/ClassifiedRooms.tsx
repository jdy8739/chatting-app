import React, { Dispatch, SetStateAction } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { IClassifiedRoom } from "../../pages/chat/list";
import { IRoom } from "../../types/types";
import Room from "./Room";

interface IClassifiedRoomsProps { 
    rooms: IRoom[],
    subject: string,
    isPinned: boolean,
    setRoomList: Dispatch<SetStateAction<IClassifiedRoom>>,
    index: number,
}

function ClassifiedRooms({
    rooms,
    subject,
    isPinned,
    setRoomList,
    index }: IClassifiedRoomsProps) {
    const addToLikeList = () => {
        setRoomList(roomList => {
            return {
                ...roomList,
                [subject]: {
                    list: roomList[subject].list,
                    isPinned: !isPinned,
                }
            }
        })
    }
    return (
        <>
            <Draggable
                draggableId={ subject }
                key={ subject }
                index={ index }
            >
                {(provided, snapshot) => 
                <div className="table"
                    ref={provided.innerRef} 
                    { ...provided.dragHandleProps }
                    { ...provided.draggableProps }
                >
                    <div className="title">
                        <h3>{subject + " " + index}</h3>
                        <div
                            className="liked"
                            onClick={addToLikeList}
                        >
                            {isPinned &&
                            <img
                                src="/pinned.png"
                                width="32px"
                                height="32px"
                            />}
                        </div>
                    </div>
                    <Droppable
                        droppableId={subject}
                        key={subject}
                        type="active"
                    >
                        {(provided, snapshot) => (
                            <div
                                className={`body 
                                ${snapshot.draggingFromThisWith ? 'draggingFromThisWith' : ''}
                                ${snapshot.draggingOverWith ? 'isDraggingOver' : ''}`}
                                ref={provided.innerRef} 
                                {...provided.droppableProps}
                                {...snapshot}
                            >
                                {rooms.map((room, index) => <Room key={room.roomId} room={room} index={index} />)}
                            </div>
                        )}
                    </Droppable>
                </div>}
            </Draggable>
            <style>{`
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
    )
}

export default React.memo(ClassifiedRooms);