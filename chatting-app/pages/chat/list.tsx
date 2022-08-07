import axios from "axios";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import ClassifiedRooms from "../../components/[id]/ClassifiedRooms";
import { IMessageBody, IRoom } from "../../types/types";
import webstomp from "webstomp-client";
import { CHATO_USERINFO, DISBANDED, getCookie, MASTER, toastConfig } from "../../utils/utils";
import { toast } from "react-toastify";
import { SEND_PROTOCOL } from "./[id]";

interface ITest {
    test: string[]
}

interface IClassifiedRoom {
    [key: string]: { list: IRoom[], isPinned?: boolean }
}

interface IRoomMoved {
    sourceId: string,
    destinationId: string, 
    sourceIndex: number, 
    destinationIndex: number,
    targetRoomId?: number,
}

let socket: WebSocket;
let stomp: any;

function ChattingList({ rooms }: { rooms: IRoom[] }) {
    const [roomList, setRoomList] = useState<IClassifiedRoom>({});
    const arrangeRoomList = (pinnedSubjects: string[]) => {
        const defaultRoomListObject: IClassifiedRoom = {};
        rooms.forEach(room => arrangeEachRoom(room, defaultRoomListObject));
        Object.keys(defaultRoomListObject).forEach(subject => {
            checkIfSubjectPinned(subject, defaultRoomListObject, pinnedSubjects);
        });
        setRoomList(defaultRoomListObject);
    }
    const arrangeEachRoom = (room: IRoom, roomList: IClassifiedRoom) => {
        const subject = room.subject;
        if (!Object.hasOwn(roomList, subject)) roomList[subject] = { list: [room] };
        else roomList[subject]['list'].push(room);
    }
    const checkIfSubjectPinned = (targetSubject: string, roomList: IClassifiedRoom, pinnedSubjects: string[]) => {
        if (pinnedSubjects.some(subject => (subject === targetSubject)))
            roomList[targetSubject].isPinned = true;
        else roomList[targetSubject].isPinned = false;
    }
    const onDragEnd = ({ destination, source }: DropResult) => {
        if (destination) {
            if (destination.droppableId === 'trash-can') {
                deleteRoom(source.droppableId, source.index);
                return;
            }
            const isSameSubjectMove = (source.droppableId === destination.droppableId);
            const roomMovedInfo: IRoomMoved = {
                sourceId: source.droppableId,
                destinationId: destination.droppableId,
                sourceIndex: source.index, 
                destinationIndex: destination.index,
                targetRoomId: isSameSubjectMove ? undefined : roomList[source.droppableId].list[source.index].roomId,
            }
            if (!isSameSubjectMove) changeToNewSubject(roomMovedInfo);
            else updateRoomMoved(roomMovedInfo);
        }
    }
    const updateRoomMoved = ({ sourceId, sourceIndex, destinationId, destinationIndex, targetRoomId }: IRoomMoved) => {
        setRoomList(roomList => {
            const targetRoomIndex = targetRoomId ? roomList[sourceId].list.findIndex(room => {
                return room.roomId === Number(targetRoomId);
            }) : sourceIndex;
            const targetRoom = roomList[sourceId].list[targetRoomIndex];
            roomList[sourceId].list.splice(targetRoomIndex, 1);
            if (!Object.hasOwn(roomList, destinationId)) {
                return {
                    ...roomList,
                    [sourceId]: { 
                        list: [...roomList[sourceId].list],
                        isPinned: roomList[sourceId].isPinned,
                    },
                    [destinationId]: {
                        list: [targetRoom],
                        isPinned: roomList[destinationId].isPinned,
                    }
                };
            } else {
                if (targetRoom) 
                    roomList[destinationId].list.splice(destinationIndex, 0, targetRoom);
                return { 
                    ...roomList,
                    [sourceId]: {
                        list: [...roomList[sourceId].list],
                        isPinned: roomList[sourceId].isPinned,
                    },
                    [destinationId]: {
                        list: [...roomList[destinationId].list],
                        isPinned: roomList[destinationId].isPinned,
                    }
                };
            }
        })
    }
    const deleteRoom = (sourceId: string, index: number) => {
        const targetRoomId = roomList[sourceId].list[index].roomId;
        axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/room/delete/${targetRoomId}`, {
            headers: { 'authorization': `Bearer ${getCookie(CHATO_USERINFO)}` }
        })
        .then(() => {
            sendRoomDeleteMessage({
                msgNo: 0,
                roomId: String(targetRoomId),
                message: DISBANDED,
                writer: MASTER,
                writerNo: null,
            })
        })
        .catch(() => toast.error('You are not authorized!', toastConfig));
    }
    const sendRoomDeleteMessage = (message: IMessageBody) => {
        if (socket && stomp) stomp.send(`/pub/chat/${SEND_PROTOCOL.DELETE}`, JSON.stringify(message));
    }
    const changeToNewSubject = (roomMovedInfo: IRoomMoved) => {
        axios.put(`${process.env.NEXT_PUBLIC_API_URL}/room/change_subject`, roomMovedInfo, {
            headers: { 'authorization': `Bearer ${getCookie(CHATO_USERINFO)}` }
        }).catch(() => toast.error('You are not authorized!', toastConfig));
    }
    const subscribeRoomParticipants = () => {
        stomp.subscribe('/sub/chat/room/list', ({ body }: { body: string }) => {
            const messageObj = JSON.parse(body);
            if (Object.hasOwn(messageObj, 'isEnter'))
                updateRoomParticipants(messageObj);
            else if (Object.hasOwn(messageObj, 'isDeleted'))
                updateRoomDeleted(messageObj);
            else if (Object.hasOwn(messageObj, 'destinationId'))
                updateRoomMoved(messageObj);
            else updateRoomCreated(messageObj);
        });
    };
    const updateRoomParticipants = (info: { roomId: number, isEnter: boolean }) => {
        setRoomList(roomList => {
            const [targetKey, targetIndex] = findSubjectAndRoomIndexByRoomId(info.roomId, roomList);
            if (targetIndex === -1) return roomList;
            if (targetKey) {
                const target = {...roomList[targetKey].list[+targetIndex]};
                const nowParticipants = target.nowParticipants;
                if (nowParticipants !== undefined) {
                    target.nowParticipants = info.isEnter ? nowParticipants + 1 : nowParticipants - 1;
                }
                roomList[targetKey].list.splice(+targetIndex, 1, target);
            }
            return {
                ...roomList,
                [targetKey]: {
                    list: [...roomList[targetKey].list],
                    isPinned: roomList[targetKey].isPinned,
                }
            };
        })
    }
    const updateRoomCreated = (room: IRoom) => {
        setRoomList(roomList => {
            arrangeEachRoom(room, roomList);
            const targetRoomList = roomList[room.subject].list;
            return { 
                ...roomList,
                [room.subject]: {
                    list: [...targetRoomList],
                    isPinned: Object.hasOwn(roomList, room.subject) ? roomList[room.subject].isPinned : false,
                }
            };
        })
    }
    const updateRoomDeleted = (info: { roomId: number, isDeleted: number }) => {
        setRoomList(roomList => {
            const [targetKey, targetIndex] = findSubjectAndRoomIndexByRoomId(info.roomId, roomList);
            if (targetIndex === -1) return roomList;
            const targetRoomList = roomList[targetKey].list;
            targetRoomList.splice(+targetIndex, 1);
            return { 
                ...roomList,
                [targetKey]: {
                    list: [...targetRoomList],
                    isPinned: roomList[targetKey].isPinned,
                }
            };
        })
    }
    const findSubjectAndRoomIndexByRoomId = (roomId: number, roomList: IClassifiedRoom) => {
        let targetKey = '';
        let targetIndex = -1;
        Object.keys(roomList).some(key => {
            targetIndex = roomList[key].list.findIndex(room => room.roomId === roomId);
            if (targetIndex !== -1) {
                targetKey = key;
                return true;
            }
        })
        return [targetKey, targetIndex];
    }
    useEffect(() => {
        axios.get('/test.json').then(({data: {test}}: {data: ITest}) => arrangeRoomList(test));
        socket = new WebSocket(`ws://localhost:5000/stomp/chat`);
        stomp = webstomp.over(socket);
        stomp.connect({}, () => {
            subscribeRoomParticipants();
        });
        stomp.debug = () => null;
        /* const previousRoomId = getPreviousRoomId();
        if (previousRoomId) {
            console.log(previousRoomId);
            updateRoomParticipants({ roomId: +previousRoomId, isEnter: false });
        } */
        return () => {
            stomp.disconnect(() => null, {});
        }
    }, [])
    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="container grid-box pinned">
                    {Object.keys(roomList).map((key, i) => {
                        return (
                            <div key={i}>
                                {(roomList[key].isPinned) && 
                                <ClassifiedRooms
                                    rooms={roomList[key].list}
                                    subject={key} 
                                />}
                            </div>
                        )
                    })}
                </div>
                <div className="container grid-box">
                    {Object.keys(roomList).map((key, i) => {
                        return (
                            <div key={i}>
                                {(!roomList[key].isPinned) && 
                                <ClassifiedRooms
                                    rooms={roomList[key].list}
                                    subject={key} 
                                />}
                            </div>
                        )
                    })}
                </div>
                <Droppable droppableId="trash-can">
                    {(provided, snapshot) => (
                        <img
                            width={'75px'}
                            height={'75px'}
                            src={'/trash_can.jpg.png'}
                            ref={provided.innerRef} 
                            {...provided.droppableProps}
                            {...snapshot}
                            className={`trash-can ${snapshot.isDraggingOver ? 'bigger' : ''}`}
                        />
                    )}
                </Droppable>
            </DragDropContext>
            <style>{`
                .grid-box {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, 335px);
                    justify-content: center;
                }
                .trash-can {
                    transition: all 0.5s;
                    position: absolute;
                    right: 30px;
                    bottom: 30px;
                }
                .bigger {
                    transform: scale(1.2);
                }
                .pinned {
                    background-color: #ffd17c;
                    width: vw100;
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