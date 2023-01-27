import "react-toastify";
import "webstomp-client";

declare module "react" {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

declare module "react-toastify" {
  export interface ToastOptions {
    position: toast.POSITION;
    autoClose: number;
    hideProgressBar: boolean;
    closeOnClick: boolean;
    pauseOnHover: boolean;
    draggable: boolean;
    progress: boolean;
    theme: string;
  }
}

export type TBinaryFileHeader = { [key: string]: string | number | null };

declare module "webstomp-client" {
  export interface Client {
    send(
      destination: string,
      body?: string | ArrayBuffer,
      headers?: TBinaryFileHeader
    ): void;
  }
}

export interface IRoom {
  roomId: number;
  roomName: string;
  limitation: number;
  nowParticipants?: number;
  pwRequired: boolean;
  password?: string;
  owner: number | null;
  subject: string;
  isMyRoom?: boolean;
}

export interface IMessageBody {
  msgNo: number;
  roomId: string;
  message: string;
  writer: string;
  writerNo: number | null;
  time?: string;
  isDeleted?: boolean;
  isPicture?: boolean;
}

export interface IParticipants {
  id: string;
  nickName: string | null;
}

export interface Asn {
  asn: string;
  name: string;
  domain?: unknown;
  route: string;
  type: string;
}

export interface Language {
  name: string;
  native: string;
  code: string;
}

export interface Currency {
  name: string;
  code: string;
  symbol: string;
  native: string;
  plural: string;
}

export interface TimeZone {
  name: string;
  abbr: string;
  offset: string;
  is_dst: boolean;
  current_time: Date;
}

export interface Threat {
  is_tor: boolean;
  is_icloud_relay: boolean;
  is_proxy: boolean;
  is_datacenter: boolean;
  is_anonymous: boolean;
  is_known_attacker: boolean;
  is_known_abuser: boolean;
  is_threat: boolean;
  is_bogon: boolean;
  blocklists: unknown[];
}

export interface Iipdata {
  ip: string;
  is_eu: boolean;
  city: string;
  region: string;
  region_code: string;
  region_type: string;
  country_name: string;
  country_code: string;
  continent_name: string;
  continent_code: string;
  latitude: number;
  longitude: number;
  postal: string;
  calling_code: string;
  flag: string;
  emoji_flag: string;
  emoji_unicode: string;
  asn: Asn;
  languages: Language[];
  currency: Currency;
  time_zone: TimeZone;
  threat: Threat;
  count: string;
}

type SocketCallback = ({ body }: { body: string }) => void;
