
export interface IRoom {
    roomId: number,
    roomName: string,
    limitation: number,
    nowParticipants?: number,
    pwRequired: boolean,
    password?: string,
    owner: string
    subject: string,
    isLiked?: boolean,
}

export interface IMessageBody {
    msgNo: number,
    roomId: string,
    message: string,
    writer: string,
    time?: string,
    isDeleted?: boolean,
}