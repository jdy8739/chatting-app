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
    const onDragEnd = (args: DropResult) => console.log(args.destination);
    useEffect(() => {
        fetchRoomList();
    }, [])
    return (
        <>
            <div className="container grid-box">
                {Object.keys(roomList).map((key, i) => <ClassifiedRooms key={i} rooms={roomList[key].list} />)}
            </div>
            {/* <DragDropContext onDragEnd={onDragEnd}>
                <div>
                    <Droppable droppableId="0" >
                        {(magic) => (
                            <ul ref={magic.innerRef} {...magic.droppableProps}>
                                <Draggable draggableId="first" index={0} key={0}>
                                    {(magic) => (
                                    <li ref={magic.innerRef} {...magic.draggableProps}>
                                        <span {...magic.dragHandleProps}>🔥</span>
                                        One
                                    </li>
                                    )}
                                </Draggable>
                                <Draggable draggableId="second" index={1} key={1}>
                                    {(magic) => (
                                    <li ref={magic.innerRef} {...magic.draggableProps}>
                                        <span {...magic.dragHandleProps}>🔥</span>
                                        two
                                    </li>
                                    )}
                                </Draggable>
                            </ul>
                        )}
                    </Droppable>
                </div>
            </DragDropContext> */}
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