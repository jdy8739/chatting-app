import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import ClassifiedRooms from "../../components/list/Table";
import { IMessageBody, IRoom } from "../../types/types";
import webstomp, { Client } from "webstomp-client";
import { CHATO_TOKEN, getAccessToken, getPinnedSubjectStorage, removeCookie, requestWithTokenAxios, setPinnedSubjectStorage } from "../../utils/utils";
import { MASTER_PROTOCOL, SEND_PROTOCOL } from "./[id]";
import BottomIcons from "../../components/list/BottomIcons";
import { useSelector, useDispatch } from "react-redux";
import { IUserSignedInInfo, signOut } from "../../lib/store/modules/signInReducer";
import { addInList, removeInList, truncateList } from "../../lib/store/modules/likedSubjectReducer";
import { useRouter } from "next/router";

export enum SECTION {
    PINNED = "pinned",
    NOT_PINNED = "not_pinned",
    TRASH_CAN = 'trash-can',
}

export interface ISubjectListSelector { 
    likedSubjectReducer: { 
        subjectList: string[],
    } 
};

export interface IUserInfoSelector { 
    signInReducer: { 
        userInfo: IUserSignedInInfo,
    } 
}

export interface ITable {
    [key: string]: { 
        list: IRoom[], isPinned: boolean,
    }
}

interface IRoomMoved {
    sourceId: string,
    destinationId: string, 
    sourceIndex: number, 
    destinationIndex: number,
    targetRoomId?: number,
}

const SHOW = {
    VISIBLE: {},
    INVISIBLE: { display: 'none' },
}

let socket: WebSocket;
let stomp: Client;

let renderingCount = 0;

function ChattingList({ rooms }: { rooms: IRoom[] }) {
    let pinnedTableLength: number = 0;
    let notPinnedTableLength: number = 0;
    let isTableShown: boolean;
    const router = useRouter();
    const dispatch = useDispatch();
    const [roomList, setRoomList] = useState<ITable>({});
    const { userNo, userId } = useSelector(({ signInReducer: {userInfo} }: IUserInfoSelector) => userInfo);
    const subjectList = useSelector(({ likedSubjectReducer: { subjectList }}: ISubjectListSelector) => subjectList);
    const arrangeRoomList = (pinnedSubjects: (string[] | null)) => {
        const defaultRoomListObject: ITable = {};
        rooms.forEach(room => arrangeEachRoom(room, defaultRoomListObject));
        if (pinnedSubjects) {
            Object.keys(defaultRoomListObject).forEach(subject => {
                checkIfSubjectPinned(subject, defaultRoomListObject, pinnedSubjects);
            });
            makeVacantTableIfPinned(defaultRoomListObject, pinnedSubjects);
        }
        setRoomList({...defaultRoomListObject});
    }
    const arrangeEachRoom = (room: IRoom, roomList: ITable) => {
        const subject = room.subject;
        if (!Object.hasOwn(roomList, subject))
            roomList[subject] = { 
                list: [room],
                isPinned: false,
            };
        else roomList[subject]['list'].push(room);
    }
    const checkIfSubjectPinned = (targetSubject: string, roomList: ITable, pinnedSubjects: string[]) => {
        if (pinnedSubjects.some(subject => (subject === targetSubject))) {
            roomList[targetSubject].isPinned = true;
        } else roomList[targetSubject].isPinned = false;
    }
    const makeVacantTableIfPinned = (defaultRoomListObject: ITable, pinnedSubjects: string[]) => {
        pinnedSubjects.forEach(subject => {
            if (!Object.hasOwn(defaultRoomListObject, subject)) {
                defaultRoomListObject[subject] = {list: [], isPinned: true};
            }
        })
    }
    const onDragEnd = ({ destination, source, draggableId }: DropResult) => {
        const destinationId = destination?.droppableId;
        const sourceId = source.droppableId;
        const isDestinationAboutPin = (destinationId === SECTION.PINNED || destinationId === SECTION.NOT_PINNED);
        const isSourceAboutPin = (sourceId === SECTION.PINNED || sourceId === SECTION.NOT_PINNED);
        if (isSourceAboutPin) {
            if (sourceId === destinationId) return;
            else if (isDestinationAboutPin) toggleLikeList(destinationId, draggableId, subjectList);
            else if (destinationId === SECTION.TRASH_CAN) return;
            return;
        } else if (destination) {
            if (destinationId === SECTION.TRASH_CAN) {
                deleteRoom(source.droppableId, source.index);
                return;
            }
            const isSameSubjectMove = (sourceId === destinationId);
            const roomMovedInfo: IRoomMoved = {
                sourceId: sourceId,
                destinationId: (destinationId || ''),
                sourceIndex: source.index, 
                destinationIndex: destination.index,
                targetRoomId: isSameSubjectMove ? undefined : roomList[sourceId].list[source.index].roomId,
            }
            if (!isSameSubjectMove) changeToNewSubject(roomMovedInfo);
            else updateRoomMoved(roomMovedInfo);
        }
    }
    const updateTableMoved = (destination: SECTION, draggableId: string) => {
        setRoomList(roomList => {
            return {
                ...roomList,
                [draggableId]: {
                    list: roomList[draggableId].list,
                    isPinned: (destination === SECTION.PINNED),
                }
            }
        })
    }
    const updateRoomMoved = ({ sourceId, sourceIndex, destinationId, destinationIndex, targetRoomId }: IRoomMoved) => {
        setRoomList(roomList => {
            const targetRoomIndex = targetRoomId ? roomList[sourceId].list.findIndex(room => {
                return room.roomId === Number(targetRoomId);
            }) : sourceIndex;
            const targetRoom = roomList[sourceId].list[targetRoomIndex];
            targetRoom.subject = destinationId;
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
                        isPinned: false,
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
        requestWithTokenAxios.delete(`${process.env.NEXT_PUBLIC_API_URL}/room/delete/${targetRoomId}`)
        .then(({ status }) => {
            if (status === 200) {
                sendRoomDeleteMessage({
                    msgNo: 0,
                    roomId: String(targetRoomId),
                    message: MASTER_PROTOCOL.DISBANDED,
                    writer: MASTER_PROTOCOL.MASTER,
                    writerNo: null,
                })
            } else if (status === 401) handleTokenException();
        })
    }
    const sendRoomDeleteMessage = (message: IMessageBody) => {
        if (socket && stomp) stomp.send(`/pub/chat/${SEND_PROTOCOL.DELETE}`, JSON.stringify(message));
    }
    const changeToNewSubject = (roomMovedInfo: IRoomMoved) => {
        requestWithTokenAxios.put(`${process.env.NEXT_PUBLIC_API_URL}/room/change_subject`, roomMovedInfo)
        .then(({ status }) => {
            if (status === 401) handleTokenException();
        })
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
    const findSubjectAndRoomIndexByRoomId = (roomId: number, roomList: ITable) => {
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
    const toggleLikeList = useCallback((destination: SECTION, subject: string, subjectList: string[]) => {
        if (!getAccessToken(CHATO_TOKEN)) {
            setPinnedSubjectStorage(subject);
        } else toggleSubjectToServer(subject, subjectList);
        updateTableMoved(destination, subject);
    }, [])
    const toggleSubjectToServer = async (subject: string, subjectList: string[]) => {
        const checkIfExists = (subjectElem: string) => (subjectElem === subject);
        const isAddLike = subjectList.some(checkIfExists);
        const { status } = await requestWithTokenAxios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/manage_subject_like`, 
        { subject, isAddLike });
        if (status === 200) {
            if (isAddLike) dispatch(removeInList(subject));
            else dispatch(addInList(subject));
        } else if (status === 401) handleTokenException();
    }
    const handleTokenException = () => {
        removeCookie(CHATO_TOKEN, { path: '/' });
        dispatch(signOut());
        dispatch(truncateList());
        router.push('/user/signin');
    }
    useEffect(() => {
        socket = new WebSocket(`${process.env.NEXT_PUBLIC_SOCKET_URL}/stomp/chat`);
        stomp = webstomp.over(socket);
        stomp.connect({}, () => {
            subscribeRoomParticipants();
        });
        stomp.debug = () => null;
        if (!getAccessToken(CHATO_TOKEN))
            arrangeRoomList(getPinnedSubjectStorage());        
        return () => {
            stomp.disconnect(() => null, {});
            renderingCount = 0;
        }
    }, []);
    useEffect(() => {
        if (userId && ((renderingCount++ === 0) || (subjectList.length === 8)))
            arrangeRoomList(subjectList);
    }, [subjectList]);
    useEffect(() => {
        if (userNo === -1)
            arrangeRoomList(getPinnedSubjectStorage());
    }, [userNo]);
    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                {[true, false].map(value => {
                    return (
                        <Droppable
                            key={String(value)}
                            droppableId={`${value ? SECTION.PINNED : SECTION.NOT_PINNED}`}
                            direction='horizontal'
                        >
                            {(provided, snapshot) => 
                            <div
                                ref={provided.innerRef} 
                                {...provided.droppableProps}
                                className={`container grid-box ${value ? SECTION.PINNED : SECTION.NOT_PINNED}
                                ${snapshot.draggingFromThisWith ? 'draggingFromThisWith-pin' : ''} 
                                ${snapshot.draggingOverWith ? 'isDraggingOver-pin' : ''}
                                `}
                            >
                                {Object.keys(roomList).map((subject, index) => {
                                    isTableShown = (value ? (roomList[subject].isPinned) : (!roomList[subject].isPinned));
                                    if (value && (roomList[subject].isPinned)) pinnedTableLength ++;
                                    else if (!value && (!roomList[subject].isPinned)) notPinnedTableLength ++;
                                    return (
                                        <div
                                            key={subject}
                                            style={isTableShown ? SHOW.VISIBLE : SHOW.INVISIBLE}
                                        >
                                            {isTableShown && 
                                            <ClassifiedRooms
                                                rooms={roomList[subject].list}
                                                subject={subject}
                                                isPinned={(roomList[subject].isPinned)}
                                                toggleLikeList={toggleLikeList}
                                                index={index}
                                                subjectList={subjectList}
                                            />}
                                        </div>
                                    )
                                })}
                                {value && (pinnedTableLength === 0) && 
                                <div className="bg-box">
                                    <div className="bg-box-title">PINNED</div>
                                    <div>Put the table you want to pin</div>
                                </div>}
                                {!value && (notPinnedTableLength === 0) &&
                                <div className="bg-box">
                                    <div className="bg-box-title">UNPINNED</div>
                                </div>}
                            </div>}
                        </Droppable>
                    )
                })}
                <BottomIcons
                    setRoomList={setRoomList}
                />
            </DragDropContext>
            <style jsx>{`
                .grid-box {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, 335px);
                    justify-content: center;
                }
                .pinned {
                    width: 100vw;
                    min-height: 400px;
                    background-color: #ffd17c;
                    transition: all 1s;
                    position: relative;
                }
                .not_pinned {
                    width: 100vw;
                    min-height: 400px;
                    margin-top: 0;
                    position: relative;
                    margin-bottom: 100px;
                }
                .draggingFromThisWith-pin {
                    background-color: violet;
                }
                .isDraggingOver-pin {
                    background-color: #37ffde;
                }
                .bg-box {
                    position: absolute;
                    top: 80px;
                    width: 100%;
                    text-align: center;
                    opacity: 0.8;
                    color: white;
                }
                .bg-box-title {
                    font-size: 150px;
                    text-shadow: 1px 1px 2px gray;
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