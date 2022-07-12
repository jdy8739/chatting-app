import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { IRoom } from "../types/types";

function Room({ room, index }: { room: IRoom, index: number }) {
    const router = useRouter();
    const goToChatRoom = () => {
        const roomId = room.roomId;
        router.push({
            pathname: `/chat/${roomId}`,
            query: { roomName: room.roomName },
        }, `/chat/${roomId}`)
    }
    return (
        <>
            <Draggable 
                draggableId={room.roomId + ''}
                index={index}
                key={room.roomId}
            >
                {(provided, snapshot) => (
                    <div 
                        className={`element ${snapshot.isDragging ? 'isDragging' : 'isNotDragging'}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={goToChatRoom}
                    >
                    {
                        room.roomName.length > 30 ?
                        room.roomName.slice(0, 29) + '...' : 
                        room.roomName
                    }
                </div>
                )}
            </Draggable>
            <style>{`
                .element {
                    padding: 12px;
                    margin: 5px;
                    color: #2d2d2d;
                    transition: all 1s;
                }
                .isDragging {
                    background-color: rgb(0, 219, 146);
                    box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.4);
                }
                .isNotDragging {
                    background-color: #f6d79f;
                }
                .element:hover {
                    background-color: orange;
                }
            `}</style>
        </>
    )
}

export default React.memo(Room);