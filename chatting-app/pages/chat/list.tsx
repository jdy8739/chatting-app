import axios from "axios";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import ClassifiedRooms from "../../components/ClassifiedRooms";
import { IRoom } from "../../types/types";

interface IClassifiedRoom {
    [key: string]: { isPinned?: boolean, list: IRoom[] }
}

function ChattingList() {
    const [roomList, setRoomList] = useState<IClassifiedRoom>({});
    const fetchRoomList = async () => {
        const rooms: IRoom[] = (await axios.get<IRoom[]>(`${process.env.NEXT_PUBLIC_API_URL}/room/list`)).data;
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
    const changeToNewSubject = async (roomId: number, newSubject?: string) => {
        const result = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/room/change_subject`, {
            newSubject: newSubject,
            roomId: String(roomId)
        });
        if (result.status === 200) {
            return true;
        } else return false;
    }
    useEffect(() => {
        fetchRoomList();
    }, [])
    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="container grid-box">
                    {Object.keys(roomList).map((key, i) => 
                    <ClassifiedRooms key={i} rooms={roomList[key].list} subject={key} />)}
                </div>
            </DragDropContext>
            <style>{`
                .grid-box {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, 335px);
                    justify-content: center;
                }
                .flex-box {
                    margin-right: auto;
                }
            `}</style>
        </>
    )
};

export default ChattingList;