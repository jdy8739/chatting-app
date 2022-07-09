import axios from "axios";
import { useEffect, useState } from "react";

interface IRoom {
    roomId: number,
    roomName: string,
    limitation: number,
    isPwRequired: boolean,
    password: string,
    owner: string
}

function ChattingList() {
    const [roomList, setRoomList] = useState<IRoom[]>();
    const fetchRoomList = async () => {
        const rooms = (await axios.get<IRoom[]>(`${process.env.NEXT_PUBLIC_API_URL}/room/list`)).data;
        setRoomList(rooms);
    }
    useEffect(() => {
        fetchRoomList();
    }, [])
    return (
        <>
            <div>
                {
                    roomList?.map(room => {
                        return (
                            <div key={room.roomId}>
                                { room.roomName }
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
};

export default ChattingList;