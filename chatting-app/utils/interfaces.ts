import webstomp, { Client } from "webstomp-client";
import { IUserSignedInInfo } from "../lib/store/modules/signInReducer";
import { IMessageBody, IParticipants, IRoom } from "../types/types";
import { SECTION, SEND_PROTOCOL } from "./enums";

export interface ISubjectListSelector {
  likedSubjectReducer: {
    subjectList: string[];
  };
}

export interface IUserInfoSelector {
  signInReducer: {
    userInfo: IUserSignedInInfo;
  };
}

export interface ITable {
  [key: string]: {
    list: IRoom[];
    isPinned: boolean;
  };
}

export interface IModal {
  roomId?: number;
  query: string;
  hideModal: () => void;
  pushToChatRoom?: (password?: string) => void;
  addSubjectTable?: (newTableName: string) => void;
}

export interface ILikedSubject {
  likedSubjectNo: number;
  subject: string;
  userNo: number;
}

export interface ISignedIn extends IUserSignedInInfo {
  likedSubjects?: ILikedSubject[];
  accessToken: string;
  refreshToken: string;
}

export interface ISignUpForm {
  id: string;
  nickName: string;
  password: string;
  passwordCheck: string;
  userProfilePic?: File | null;
}

export interface IRoomMoved {
  sourceId: string;
  destinationId: string;
  sourceIndex: number;
  destinationIndex: number;
  targetRoomId?: number;
}

export interface IMessageProps {
  prevWriter: string;
  prevTime?: string;
  isNumberMatches: boolean;
  index: number;
  isDeleted: boolean;
}

export interface IServerProps {
  params: { id: number };
  query: { roomName?: string; password?: string; userNo: number | null };
}

/*** These are for User page [id] ***/

export interface IChatRoomProps {
  id: number;
  roomName: string;
  previousChat: IMessageBody[];
  password?: string;
  roomOwner: number | null;
  roomOwnerId: string;
  numberOfParticipants: number;
}

export interface IChatRoomInfo {
  owner: number | null;
  ownerId: string;
  messageList?: IMessageBody[] | undefined;
  numberOfParticipants: number;
}

export interface IFetchMessagesProps {
  id: number;
  userNo: number | null;
  count: number;
  password?: string;
  ipAddress?: string;
}

export interface ICookieOpt {
  path: string;
  expires?: Date;
  secure?: boolean;
  httpOnly?: boolean;
}

export class SocketStomp {
  socket: WebSocket;
  stomp: Client;
  constructor() {
    this.socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_SOCKET_URL}/stomp/chat`
    );
    this.stomp = webstomp.over(this.socket);
    this.stomp.debug = () => null;
  }
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

/*** These are for User Table Component ***/

export interface ITableComponent {
  rooms: IRoom[];
  subject: string;
  isPinned: boolean;
  toggleLikeList: (
    destination: SECTION,
    subject: string,
    subejctList: string[]
  ) => void;
  index: number;
  subjectList: string[];
}

/*** These are for User Message Component ***/

export interface IMessageComponent {
  msg: IMessageBody;
  index: number;
  prevWriter: string;
  prevTime?: string;
  checkIfIsMyChat: <T extends number | string>(arg: T) => boolean | undefined;
  deleteChat: (id: number, msgNo: number) => Promise<void>;
  handleChatDblClick: (index: number, isNumberMatches: boolean) => void;
  userNo: number;
  roomOwner: number | null;
  roomId: number;
  isNumberMatches: boolean;
  isDeleted: boolean;
}

/*** These are for User InputInterface Component ***/

export interface IMessageContent {
  content: string;
  roomId: number;
  msgNo: number;
  isDeleted?: boolean;
  isPicture?: boolean;
}

export interface IInputInterface {
  socketStomp: SocketStomp;
  roomId: number;
  isMyRoom: boolean;
  userNo: number;
  currentUserName: string;
  shootChatMessage: (target: SEND_PROTOCOL, message: IMessageBody) => void;
}

export interface IRoomSettings {
  password: string;
  pwRequired: boolean;
  limitation: number;
}
