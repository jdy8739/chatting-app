import axios from "axios";
import { MASTER_PROTOCOL, RECEIVE_PROTOCOL, SEND_PROTOCOL } from "../../pages/chat/[id]";
import { IMessageBody, IParticipants } from "../../types/types";

interface IUserContainer { 
    roomId: number,
    participants: IParticipants[],
    myId: string,
    myUserNo: number,
    roomOwner: number | null,
    roomOwnerId: string,
    setParticipants: (participants: IParticipants[]) => void,
    shootChatMessage: (target: SEND_PROTOCOL, message: IMessageBody) => void,
}

function UserContainer({ 
    roomId,
    participants,
    myId,
    myUserNo,
    roomOwner,
    roomOwnerId,
    setParticipants,
    shootChatMessage }: IUserContainer) {
    const showUserContainerWindow = async () => {
        const results: IParticipants[] = await (await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/room/participants/${roomId}`)).data;
        setParticipants(results);
    }
    const banThisParticipant = (participantId: string) => { 
        shootChatMessage(SEND_PROTOCOL.DELETE, {
            msgNo: RECEIVE_PROTOCOL.BAN,
            roomId: String(roomId),
            writer: MASTER_PROTOCOL.MASTER,
            writerNo: null,
            message: participantId,
        });
    }
    return (
        <>
            <div
                className="user-container"
                onMouseEnter={showUserContainerWindow}
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
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/user/profile-pic/${participant.id}`} 
                                        alt="/"
                                    />
                                </div>
                                {participant.nickName ? participant.nickName : participant.id.slice(0, 9)}
                                <span style={{color: 'red'}}>{(participant.id === myId) ? '(me)' : ''}</span>
                                {(participant.id !== myId) && 
                                (myUserNo === roomOwner) &&
                                <img
                                    width="20px"
                                    height="20px"
                                    src='/out.png'
                                    className="out-icon"
                                    onClick={() => banThisParticipant(participant.id)}
                                />}
                                &emsp;
                                {(participant.id === roomOwnerId) &&
                                <img
                                    src="/crown.png"
                                    width="30px"
                                    height="25px"
                                />}
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}

export default UserContainer;