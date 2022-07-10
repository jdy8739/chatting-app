
export interface IRoom {
    roomId: number,
    roomName: string,
    limitation: number,
    isPwRequired: boolean,
    password: string,
    owner: string
    subject: string,
    isLiked?: boolean,
}