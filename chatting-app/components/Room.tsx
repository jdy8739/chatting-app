import React from "react";
import { IRoom } from "../types/types";

function Room({ room }: { room: IRoom }) {
    return (
        <>
            <div key={room.roomId} className="element">
                { room.roomName.length > 30 ? room.roomName.slice(0, 29) + '...' : room.roomName }
            </div>
            <style>{`
                .element {
                    padding: 12px;
                    background-color: #f6d79f;
                    margin: 5px;
                    color: #2d2d2d;
                }
            `}</style>
        </>
    )
}

export default React.memo(Room);