import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { IRoom } from "../types/types";
import Modal from "./Modal";

function Room({ room, index }: { room: IRoom, index: number }) {
    const router = useRouter();
    const [isModalShown, setIsModalShown] = useState(false);
    const handleClickChatRoom = () => {
        if (room.pwRequired) setIsModalShown(true);
        else pushToChatRoom();
    }
    const pushToChatRoom = (password?: string) => {
        const roomId = room.roomId;
        router.push({
            pathname: `/chat/${roomId}`,
            query: { roomName: room.roomName, password: password },
        }, `/chat/${roomId}`)
    }
    const hideModal = () => { setIsModalShown(false) };
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
                        onClick={handleClickChatRoom}
                    >
                        {
                            room.roomName.length > 30 ?
                            room.roomName.slice(0, 29) + '...' : 
                            room.roomName
                        }
                        {room.pwRequired && 
                        <img
                            src="/lock_icon.png"
                            width="25px"
                            height="25px"
                            className="lock"
                        />}
                    </div>
                )}
            </Draggable>
            <AnimatePresence>
                {isModalShown && 
                <Modal
                    roomId={room.roomId}
                    query={'This room requires a password.'}
                    hideModal={hideModal}
                    pushToChatRoom={pushToChatRoom}
                />}
            </AnimatePresence>
            <style>{`
                .element {
                    padding: 12px;
                    margin: 5px;
                    color: #2d2d2d;
                    transition: all 1s;
                    position: relative;
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
                .lock {
                    position: absolute;
                    top: 9px;
                    right: 10px;
                }
            `}</style>
        </>
    )
}

export default React.memo(Room);