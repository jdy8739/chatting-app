import axios from "axios";
import { useState } from "react";

interface IUserContainer { 
    roomId: number,
    participants: string[],
    setParticipants: (participants: string[]) => void
}

function UserContainer({ roomId, participants, setParticipants }: IUserContainer) {
    const showNowUsers = async () => {
        if (participants.length === 0) {
            const results: string[] = await (await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/room/participants/${roomId}`)).data;
            setParticipants(results);
        } else return;
    }
    return (
        <>
            <div
                className="user-container"
                onMouseOver={showNowUsers}
            >
                <h4>users</h4>
                <div className="name-box">
                    {participants.map((participant, i) => {
                        return (
                            <div key={i} className="profile">
                                <div className="profile-img"></div>
                                {participant.slice(0, 9)}
                                <img
                                    width="20px"
                                    height="20px"
                                    src='/out.png'
                                    className="out-icon"
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}

export default UserContainer;