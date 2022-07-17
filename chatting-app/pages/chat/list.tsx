import axios from "axios";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import ClassifiedRooms from "../../components/ClassifiedRooms";
import { IMessageBody, IRoom } from "../../types/types";
import webstomp from "webstomp-client";
import { DISBANDED, MASTER } from "../../utils/utils";

interface IClassifiedRoom {
    [key: string]: { isPinned?: boolean, list: IRoom[] }
}

let socket: WebSocket;
let stomp: any;

function ChattingList({ rooms }: { rooms: IRoom[] }) {
    const [roomList, setRoomList] = useState<IClassifiedRoom>({});
    const arrangeRoomList = async () => {
        const defaultRoomListObject: IClassifiedRoom = {};
        rooms.forEach(room => {
            const subject = room.subject;
            if (!Object.hasOwn(defaultRoomListObject, subject)) {
                defaultRoomListObject[subject] = { list: [room] };
            } else {
                defaultRoomListObject[subject]['list'].push(room);
            }
        })
        setRoomList(defaultRoomListObject);
    }
    const onDragEnd = ({ destination, source }: DropResult) => {
        if (destination) {
            if (destination.droppableId === 'trash-can') {
                deleteRoom(source.droppableId, source.index);
                return;
            }
            const target = roomList[source.droppableId].list[source.index];
            let isChangeAvail = false;
            if (source.droppableId !== destination.droppableId) {
                if (!changeToNewSubject(target.roomId, destination.droppableId)) return;
                isChangeAvail = true;
            } else isChangeAvail = true;
            if (isChangeAvail) {
                setRoomList(roomList => {
                    const copied = {...roomList};
                    copied[source.droppableId].list.splice(source.index, 1);
                    copied[destination.droppableId].list.splice(destination.index, 0, target);
                    return copied;
                })
            }
        }
    }
    const deleteRoom = (sourceId: string, index: number) => {
        const targetRoomId = roomList[sourceId].list[index].roomId;
        axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/room/delete/${targetRoomId}`)
            .then(() => sendRoomDeleteMessage({
                msgNo: 0,
                roomId: String(targetRoomId),
                message: DISBANDED,
                writer: MASTER,
            }));
        setRoomList(roomList => {
            const copied = {...roomList};
            copied[sourceId].list.splice(index, 1);
            return copied;
        })
    }
    const sendRoomDeleteMessage = (message: IMessageBody) => {
        if (socket && stomp) {
            stomp.send('/pub/chat/delete', JSON.stringify(message));
        }
    }
    const changeToNewSubject = async (roomId: number, newSubject?: string) => {
        const result = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/room/change_subject`, {
            newSubject: newSubject,
            roomId: String(roomId)
        });
        if (result.status === 200) {
            return true;
        } else return false;
    }
    const subscribeRoomParticipants = () => {
        stomp.subscribe('/sub/chat/room/list', ({ body }: { body: string }) => {
            alert(body);
            // const newMessage: IMessageBody = JSON.parse(body);
            // updateRoomParticipants(newMessage);
        })
    };
    const updateRoomParticipants = (message: IMessageBody) => {
        // logic ~
    }
    useEffect(() => {
        arrangeRoomList();
        socket = new WebSocket('ws://localhost:5000/stomp/chat');
        stomp = webstomp.over(socket);
        stomp.connect({}, () => {
            subscribeRoomParticipants();
        });
        stomp.debug = () => null;
    }, [])
    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="container grid-box">
                    {Object.keys(roomList).map((key, i) => 
                    <ClassifiedRooms key={i} rooms={roomList[key].list} subject={key} />)}
                </div>
                <Droppable droppableId="trash-can">
                    {(provided, snapshot) => (
                        <div className="footer">
                        <img
                            width={'75px'}
                            height={'75px'}
                            src={'/trash_can.jpg.png'}
                            ref={provided.innerRef} 
                            {...provided.droppableProps}
                            {...snapshot}
                        />
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            <style>{`
                .grid-box {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, 335px);
                    justify-content: center;
                }
            `}</style>
        </>
    )
};

export async function getServerSideProps() {
    const rooms: IRoom[] = (await axios.get<IRoom[]>(`${process.env.NEXT_PUBLIC_API_URL}/room/list`)).data;
    rooms.forEach(room => {if (room.password) delete room.password });
    return {
        props: { rooms }
    }
}

export default ChattingList;