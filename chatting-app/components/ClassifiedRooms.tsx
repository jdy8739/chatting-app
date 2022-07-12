import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { IRoom } from "../types/types";
import Room from "./Room";


function ClassifiedRooms({ rooms, subject }: { rooms: IRoom[], subject: string }) {
    return (
        <>
            <div className="table">
                <h3 className="title">
                    {subject}
                    <div className="liked"></div>
                </h3>
                <Droppable droppableId={subject}>
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
            </div>
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
                    top: -13px;
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