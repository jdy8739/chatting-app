
export interface IRoom {
    roomId: number,
    roomName: string,
    limitation: number,
    pwRequired: boolean,
    password?: string,
    owner: string
    subject: string,
    isLiked?: boolean,
}