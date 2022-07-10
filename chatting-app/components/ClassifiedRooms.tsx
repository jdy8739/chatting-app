import React from "react";
import { IRoom } from "../types/types";
import Room from "./Room";


function ClassifiedRooms({ rooms }: { rooms: IRoom[] }) {
    return (
        <>
            <div className="table">
                <h3 className="title">{rooms[0].subject}</h3>
                <div className="body">
                    {rooms.map(room => <Room key={room.roomId} room={room} />)}
                </div>
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
                }
                .body {
                    flex-grow: 1;
                    background-color: #f3f3f3;
                    box-shadow: inset 0px 12px 20px -10px rgba(0, 0, 0, 0.2);
                }
            `}</style>
        </>
    )
}

export default React.memo(ClassifiedRooms);