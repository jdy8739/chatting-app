import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { Cookies } from 'react-cookie';
import { ISignedIn } from "../components/commons/NavBar";
import webstomp, { Client } from "webstomp-client";

axios.defaults.baseURL = `${process.env.NEXT_PUBLIC_API_URL}`;
const cookies = new Cookies();

export const API_KEY_REQUEST_URL = 'https://api.ipdata.co?api-key=';

interface ICookieOpt {
	path: string;
	expires?: Date;
	secure?: boolean;
	httpOnly?: boolean;
}

export class SocketStomp {
	socket: WebSocket;
	stomp: Client;
	constructor() {
		this.socket = new WebSocket(`${process.env.NEXT_PUBLIC_SOCKET_URL}/stomp/chat`);
		this.stomp = webstomp.over(this.socket);
        this.stomp.debug = () => null;
	}
};

export const setCookie = (name: string, value: string, options: ICookieOpt) => {
	return cookies.set(name, value, options);
};

export const getAccessToken = (name: string) :string | null => {
	const tokens: string[] = cookies.get(name);
	if (tokens) return tokens[0];
	else return null;
};

export const getRefreshToken = (name: string) :string | null => {
	const tokens: string[] = cookies.get(name);
	if (tokens) return tokens[1];
	else return null;
};

export const removeCookie = (name: string, options: ICookieOpt) => {
	return cookies.remove(name, options);
};

export const CHATO_TOKEN = "CHATO_TOKEN";

export const ID_REGEX = /^(?!.*[!#$%&’'*+/=?^_`])[a-zA-Z0-9]+$/;

export const PW_REGEX = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;

export const generateRandonUserId = () => {
    let bytes = new Uint32Array(3);
    window.crypto.getRandomValues(bytes);
    return (performance.now().toString(36)+Array.from(bytes).map(byte => byte.toString(36)).join("")).replace(/\./g,"");
};

export const getPreviousRoomId = () :string | null => {
	const storage = globalThis.sessionStorage;
	const previousRoomId = storage.getItem('previousRoomId');
	storage.clear();
	return previousRoomId;
}

export const setPreviousRoomId = (id: number) => {
	globalThis.sessionStorage.setItem('previousRoomId', id + '');
}

export const clearPreviousRoomId = () => globalThis.sessionStorage.clear();

export const toastConfig = {
	position: toast.POSITION.TOP_CENTER,
	autoClose: 2500,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
	progress: undefined,
	theme: 'colored',
};

export const signupAxios = axios.create();

signupAxios.interceptors.response.use(
    response => response,
    error => {
		handleErrors(error.response.status);
        return Promise.reject(error);
})

const handleErrors = (status: number) => {
	if (status === 500) {
		toast.error('Please upload your pic in smaller sizes.', toastConfig);
	} else if (status === 400) {
		toast.error('There might be some errors on the server. Please try later. :(', toastConfig);
	} else if (status === 409) {
		toast.error('Id is duplicate. Please try another id.', toastConfig);
	} else if (status === 403) {
		toast.error('You are not authorized!', toastConfig);
	}
}

export const signinAxios = axios.create();

signinAxios.interceptors.response.use(
    (response: { data: Partial<ISignedIn> }) => {
		toast.success('Hello! Welcome To Chato', toastConfig);
		const accessToken = response.data.accessToken;
		const refreshToken = response.data.refreshToken;
		if (accessToken && refreshToken) {
			bakeCookie(accessToken, refreshToken);
			delete response.data.refreshToken;
		} else if (accessToken) {
			const refreshToken = getRefreshToken(CHATO_TOKEN);
			if (refreshToken) bakeCookie(accessToken, refreshToken);
		}
		delete response.data.accessToken;
		return response;
	},
    ({ response }: AxiosError) => {
        handleTokenErrors(response?.status);
        return Promise.reject();
    }
)

export const requestWithTokenAxios = axios.create();
// requestWithTokenAxios.defaults.headers.common['authorization'] = `Bearer ${getAccessToken(CHATO_TOKEN)}`;

requestWithTokenAxios.interceptors.request.use(
	request => {
		const accessToken = getAccessToken(CHATO_TOKEN);
		if (request.headers && accessToken)
			request.headers['authorization'] = `Bearer ${accessToken}`;
		return request;
	},
	({ response }: AxiosError) => response,
)

requestWithTokenAxios.interceptors.response.use(
	(response: AxiosResponse) => {
		const data = response.data;
		if (typeof data === 'string' && data.length > 50) {
			const refreshToken = getRefreshToken(CHATO_TOKEN);
			if (refreshToken) bakeCookie(data, refreshToken);
		}
		return response;
	},
	async ({ response, config }: AxiosError) => {
		const status = response?.status;
		if (status === 401) {
			const targetUrl = config.url;
			const method = config.method;
			const body = config.data;
			const env = config.env?.FormData;
			const { status: accessTokenRequestStatus, data: accessToken }: { status: number, data: string } = 
				await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/reissue_token`, {
				headers: {
					'refresh_token': `Bearer ${getRefreshToken(CHATO_TOKEN)}`,
					'authorization': `Bearer ${getAccessToken(CHATO_TOKEN)}`,
				}
			})
			if (accessTokenRequestStatus === 200 && (accessToken)) {
				const refreshToken = getRefreshToken(CHATO_TOKEN);
				if (refreshToken) bakeCookie(accessToken, refreshToken);
				const result = await resendRequest(method, targetUrl, body, env);
				
				if (result?.status === 200 && 'data' in result) return {
					status: 200,
					data: result.data,
				}
				else return { status: result?.status }
			} else if (accessTokenRequestStatus !== 200) {
				return { status: 401 };
			}
		} else handleTokenErrors(response?.status);
		return response;
	}
)

const handleTokenErrors = (status: number | undefined) => {
	if (!status) {}
	else if (status === 403 || status === 400) toast.error('Unauthorized or, the password does not matches!.', toastConfig);
	else if (status === 409) toast.error('Id is duplicate. Please try another id.', toastConfig);
	else if (status === 404) toast.error('No such Id in our records.', toastConfig);
	else if (status === 304) toast.error('The number of participants exceeds the limit.');
	else toast.error('It cannot be done!', toastConfig);
}

type Tenv = (new (...args: any[]) => object) | undefined;

type result = (AxiosResponse | AxiosError | undefined);

const resendRequest = (method?: string, url?: string, body?: JSON, env?: Tenv) :Promise<result> => {
	return new Promise(async (success, fail) => {
		let result: result = undefined;
		try {
			if (method && url) {
				const contentType = { 'Content-Type': 'application/json' };
				switch (method) {
					case 'get':
						result = (await requestWithTokenAxios.get(url, { headers: contentType }));
						break;
					case 'post':
						result = (await requestWithTokenAxios.post(url, (env && env?.length > 0) ? env : body, { headers: contentType }));
						break;
					case 'put':
						result = (await requestWithTokenAxios.put(url, (env && env?.length > 0) ? env : body, { headers: contentType }));
						break;
					case 'delete':
						result = (await requestWithTokenAxios.delete(url, { headers: contentType }));
						break;
				}
			}
			success(result);
		} catch (e) { fail(result); };
	})
}

export const modalBgVariant = {
    initial: {
        opacity: 0
    },
    animate: {
        opacity: 1
    },
    exit: {
        opacity: 0
    }
}

export const getNowTime = () :string => {
	const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes()}`;
	return time;
}

export const bakeCookie = (accessToken: string, refreshToken: string) => {
	const now = new Date();
	setCookie(
		CHATO_TOKEN,
		JSON.stringify([accessToken, refreshToken]),
		{
			path: '/',
			expires: new Date(now.setMinutes(now.getMinutes() + 180)),
			secure: false,
			httpOnly: false,
		},
	);
}

export const getPinnedSubjectStorage = () :(string[] | null) => {
	const subjectArray = globalThis.localStorage.getItem('pinned');
	return subjectArray ? JSON.parse(subjectArray) : null;
}

export const setPinnedSubjectStorage = (subject: string) => {
	let subjectArray = getPinnedSubjectStorage();
	if (subjectArray) {
		const filtered = subjectArray.filter(elem => elem !== subject);
		if (subjectArray.length === filtered.length) {
			if (filtered.length > 7) { filtered.shift(); };
			filtered.push(subject);
		}
		subjectArray = filtered;
	} else subjectArray = [subject];
	globalThis.localStorage.setItem('pinned', JSON.stringify(subjectArray));
}