import { IUserSignedInInfo } from "../lib/store/modules/signInReducer"
import { IMessageBody, IParticipants, IRoom } from "../types/types"
import { SEND_PROTOCOL } from "../constants/enums"

export interface ISubjectListSelector { 
    likedSubjectReducer: { 
        subjectList: string[],
    } 
}

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

export interface ILikedSubject {
    likedSubjectNo: number,
    subject: string,
    userNo: number,
}

export interface ISignedIn extends IUserSignedInInfo {
    likedSubjects?: ILikedSubject[],
    accessToken: string,
    refreshToken: string,
}

export interface IRoomMoved {
    sourceId: string,
    destinationId: string, 
    sourceIndex: number, 
    destinationIndex: number,
    targetRoomId?: number,
}

/*** These are for User page [id] ***/

export interface IChatRoomProps {
    id: number,
    roomName: string,
    previousChat: IMessageBody[],
    password?: string,
    roomOwner: number | null,
    roomOwnerId: string,
    numberOfParticipants: number,
}

export interface IChatRoomInfo {
    owner: number | null, 
    ownerId: string,
    messageList?: IMessageBody[] | undefined,
    numberOfParticipants: number,
}

export interface IFetchMessagesProps {
    id: number, 
    userNo: number | null, 
    count: number, 
    password?: string, 
    ipAddress?: string,
}

/*** These are for User Container Component ***/

export interface IUserContainer {
    roomId: number;
    participants: IParticipants[];
    myId: string;
    myUserNo: number;
    roomOwner: number | null;
    roomOwnerId: string;
    setParticipants: React.Dispatch<React.SetStateAction<IParticipants[]>>;
    shootChatMessage: (target: SEND_PROTOCOL, message: IMessageBody) => void;
    numberOfPcps: number;
}

export interface IBannedUserList {
    bannedIpNo: number;
    roomId: number;
    userName: string;
    ipAddress: string;
}
