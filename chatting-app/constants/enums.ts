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
}
