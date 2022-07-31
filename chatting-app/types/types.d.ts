import 'react-toastify';

declare module 'react-toastify' {
    export interface ToastOptions {
        position: toast.POSITION,
        autoClose: number,
        hideProgressBar: boolean,
        closeOnClick: boolean,
        pauseOnHover: boolean,
        draggable: boolean,
        progress: boolean,
        theme: string,
    }
}

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

export interface IParticipants {
    id: string,
    nickName: string,
}