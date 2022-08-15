import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { IRoom } from "../../types/types";
import { toastConfig } from "../../utils/utils";
import Modal from "./Modal";

function Room({ room, index }: { room: IRoom, index: number }) {
    const router = useRouter();
    const [isModalShown, setIsModalShown] = useState(false);
    const handleClickChatRoom = () => {
        if (room.nowParticipants === room.limitation) {
            toast.error('The number of participant exceeds limit.', toastConfig)
        } else if (room.pwRequired) setIsModalShown(true);
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
    const correctParticipantsNumber = (numberOfParticipants?: number) => {
        if (!numberOfParticipants) return 0;
        else if (numberOfParticipants < 0) return 0;
        else if (numberOfParticipants > room.limitation) return room.limitation;
        else return numberOfParticipants;
    }
    room.nowParticipants = correctParticipantsNumber(room.nowParticipants);
    return (
        <>
            <Draggable 
                draggableId={room.roomId + ''}
                index={index}
                key={room.roomId}
            >
                {(provided, snapshot) => (
                    <div 
                        className={`element
                            ${snapshot.isDragging ? 'isDragging' : 'isNotDragging'}
                            ${(room.nowParticipants === room.limitation) ? 'isFullRoom' : ''}
                            `}
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
                        <div className="sub-info">
                            <img
                                src="/people_icon.png"
                                width="50px"
                                height="25px"
                            />
                            <p>{`${room.nowParticipants}/${room.limitation}`}</p>
                            <div style={{ flexGrow: '1' }}></div>
                            {room.pwRequired && 
                            <img
                                src="/lock_icon.png"
                                width="25px"
                                height="25px"
                            />}
                        </div>
                    </div>
                )}
            </Draggable>
            <AnimatePresence>
                {isModalShown && 
                <Modal
                    roomId={room.roomId}
                    query={'This room requires the password.'}
                    hideModal={hideModal}
                    pushToChatRoom={pushToChatRoom}
                />}
            </AnimatePresence>
            <style jsx>{`
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
    )
}

export default React.memo(Room);