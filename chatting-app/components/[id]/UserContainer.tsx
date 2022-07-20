import axios from "axios";
import { useState } from "react";

interface IUserContainer { 
    roomId: number,
    participants: string[],
    setParticipants: (participants: string[]) => void,
    myId: string,
    isMyOwnRoom: boolean,
}

function UserContainer({ roomId, participants, setParticipants, myId, isMyOwnRoom }: IUserContainer) {
    const showNowUsers = async () => {
        if (participants.length === 0) {
            const results: string[] = await (await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/room/participants/${roomId}`)).data;
            setParticipants(results);
        } else return;
    }
    const banThisParticipant = (participantId: string) => {
        axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/room/ban/${roomId}?id=${participantId}`);
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
                                <span style={{color: 'red'}}>{(participant === myId) ? '(me)' : ''}</span>
                                {
                                    // (participant !== myId) && isMyOwnRoom &&
                                    true &&
                                    <img
                                        width="20px"
                                        height="20px"
                                        src='/out.png'
                                        className="out-icon"
                                        onClick={() => banThisParticipant(participant)}
                                    />
                                }
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}

export default UserContainer;