import axios from "axios";
import { IMessageBody } from "../../types/types";
import { BAN_PROTOCOL_NUMBER, MASTER } from "../../utils/utils";

interface IUserContainer { 
    roomId: number,
    participants: string[],
    myId: string,
    isMyOwnRoom: boolean,
    roomOwner: string | null,
    setParticipants: (participants: string[]) => void,
    shootChatMessage: (target: string, message: IMessageBody) => void,
}

function UserContainer({ roomId, participants, myId, isMyOwnRoom, roomOwner, setParticipants, shootChatMessage }: IUserContainer) {
    const showNowUsers = async () => {
        if (participants.length === 1) {
            const results: string[] = await (await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/room/participants/${roomId}`)).data;
            setParticipants(results);
        } else return;
    }
    const banThisParticipant = (participantId: string) => {
        shootChatMessage('delete', {
            msgNo: BAN_PROTOCOL_NUMBER,
            roomId: String(roomId),
            writer: MASTER,
            message: participantId,
        });
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
                                <div className="profile-img">
                                    <img
                                        width="100%"
                                        height="100%"
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/user/profile-pic/${participant}`} 
                                        alt="/"
                                    />
                                </div>
                                {participant.slice(0, 9)}
                                <span style={{color: 'red'}}>{(participant === myId) ? '(me)' : ''}</span>
                                {
                                    (participant !== myId) && isMyOwnRoom &&
                                    <img
                                        width="20px"
                                        height="20px"
                                        src='/out.png'
                                        className="out-icon"
                                        onClick={() => banThisParticipant(participant)}
                                    />
                                }
                                &emsp;
                                {
                                    (participant === roomOwner) &&
                                    <img
                                        src="/crown.png"
                                        width="30px"
                                        height="25px"
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