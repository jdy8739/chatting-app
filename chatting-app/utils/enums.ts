export enum SEND_PROTOCOL {
  MESSEGE = "message",
  DELETE = "delete",
  BINARY = "binary",
}

export enum RECEIVE_PROTOCOL {
  SUBSCRIBE = 0,
  BAN = 2,
  CHANGE = 3,
}

export enum MASTER_PROTOCOL {
  MASTER = "MASTER",
  DISBANDED = "disbanded",
}

export enum LIMIT {
  CHAT_REMAIN_NUMBER = 10,
  STMOP_MESSAGE_SIZE = 500000,
}

export enum SECTION {
  PINNED = "pinned",
  NOT_PINNED = "not_pinned",
  TRASH_CAN = "trash-can",
}

export enum SERVER_STATUS {
  OK = 200,
  NOT_MODIFIED = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNET_SERVER_ERROR = 500,
}

export enum MSG_TYPE {
  ENTER = "isEnter",
  DELETE = "isDeleted",
  MOVE = "destinationId",
  CHANGE = "isChanged",
}

export interface IUserInfo {
  id: string;
  nickName: string;
  profilePicUrl?: string;
}

export enum EXECUTE {
  DEFAULT = 0,
  ALTER_USER_INFO = 1,
  WITHDRAW = 2,
}
