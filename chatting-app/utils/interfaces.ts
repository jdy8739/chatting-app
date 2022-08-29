import { IUserSignedInInfo } from "../lib/store/modules/signInReducer"
import { IRoom } from "../types/types"

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