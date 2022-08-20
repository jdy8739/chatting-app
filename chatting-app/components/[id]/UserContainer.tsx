import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { truncateList } from "../../lib/store/modules/likedSubjectReducer";
import { signOut } from "../../lib/store/modules/signInReducer";
import { MASTER_PROTOCOL, RECEIVE_PROTOCOL, SEND_PROTOCOL } from "../../pages/chat/[id]";
import { IMessageBody, IParticipants } from "../../types/types";
import { CHATO_TOKEN, removeCookie, requestWithTokenAxios } from "../../utils/utils";

interface IUserContainer { 
    roomId: number,
    participants: IParticipants[],
    myId: string,
    myUserNo: number,
    roomOwner: number | null,
    roomOwnerId: string,
    setParticipants:  React.Dispatch<React.SetStateAction<IParticipants[]>>,
    shootChatMessage: (target: SEND_PROTOCOL, message: IMessageBody) => void,
}

interface IBannedUserList {
    bannedIpNo: number,
    roomId: number,
    userName: string,
    ipAddress: string,
}

let isContainerClosed = true;

const STYLE = {
    MARK: {color: 'orange'},
    NONE: {}
};

function UserContainer({ 
    roomId,
    participants,
    myId,
    myUserNo,
    roomOwner,
    roomOwnerId,
    setParticipants,
    shootChatMessage }: IUserContainer) {
        // console.log('user container updated.');
    const router = useRouter();
    const dispatch = useDispatch();
    const [isBannedUserShown, setIsBannedUserShown] = useState(false);
    const [bannedUserList, setBannedUserList] = useState<IBannedUserList[]>([]);
    const fetchNowParticipants = async () => {
        const results: IParticipants[] = await (await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/room/participants/${roomId}`)).data;
        // console.log(results);
        isContainerClosed = false;
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
    const fetchBannedUserList = async () => {
        isContainerClosed = false;
        const { status, data: bannedUserList } =
            await requestWithTokenAxios.get(`${process.env.NEXT_PUBLIC_API_URL}/room/banned_users/${roomId}`);
        if (status === 401) handleTokenException();
        setIsBannedUserShown(true);
        setBannedUserList(bannedUserList);
    }
    const unlockThisUser = async (bannedIpNo: number) => {
        isContainerClosed = false;
        const { status } =
            await requestWithTokenAxios.post(`${process.env.NEXT_PUBLIC_API_URL}/room/unlock_ban`, { bannedIpNo, roomId })
        if (status === 200) setBannedUserList(bannedUserList => {
            return [...bannedUserList.filter(bannedUser => bannedUser.bannedIpNo !== bannedIpNo)];
        }) 
        else if (status === 401) handleTokenException();
    }
    const handleTokenException = () => {
        removeCookie(CHATO_TOKEN, { path: '/' });
        dispatch(signOut());
        dispatch(truncateList());
        router.push('/user/signin');
    }
    useEffect(() => {
        return () => { isContainerClosed = true; };
    }, []);
    return (
        <>
            <div
                className="user-container"
                onMouseEnter={fetchNowParticipants}
                onMouseLeave={() => isContainerClosed = true}
            >
                <h4 className="user"
                    style={!isBannedUserShown ? STYLE.MARK : STYLE.NONE}
                    onClick={() => setIsBannedUserShown(false)}
                >users</h4>
                {(myUserNo === roomOwner) &&
                <h4 className="banned"
                    style={isBannedUserShown ? STYLE.MARK : STYLE.NONE}
                    onClick={fetchBannedUserList}
                >ban</h4>}
                <div className="name-box">
                    {!isBannedUserShown ? participants.map((participant, i) => {
                        return (
                            <div key={i} className="profile">
                                <div className="profile-img">
                                    <img
                                        width="100%"
                                        height="100%"
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/user/profile-pic/${participant.id}`} 
                                    />
                                </div>
                                {participant.nickName ? participant.nickName : participant.id.slice(0, 9)}
                                <span style={STYLE.MARK}>{(participant.id === myId) ? '(me)' : ''}</span>
                                {(participant.id !== myId) && 
                                (myUserNo === roomOwner) &&
                                <img
                                    width="20px"
                                    height="20px"
                                    src='/out.png'
                                    className="out-icon"
                                    onClick={() => banThisParticipant(participant.id)}
                                />}
                                &emsp; &emsp;
                                {(participant.id === roomOwnerId) &&
                                <img
                                    src="/crown.png"
                                    width="30px"
                                    height="25px"
                                />}
                            </div>
                        )
                    }) : (bannedUserList) && bannedUserList.map(bannedUser => {
                        return (
                            <div
                                key={bannedUser.bannedIpNo}
                                className="profile"
                            >
                                <h4>
                                    {bannedUser.userName.length > 15 ? 
                                    bannedUser.userName.slice(0, 9) : bannedUser.userName}
                                    &emsp;
                                    {bannedUser.ipAddress}
                                </h4>
                                <img
                                    width="20px"
                                    height="20px"
                                    src='/out.png'
                                    className="out-icon"
                                    onClick={() => unlockThisUser(bannedUser.bannedIpNo)}
                                    alt="popai"
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}

const judgeEqual = () => isContainerClosed;

export default React.memo(UserContainer, judgeEqual);