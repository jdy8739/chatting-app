import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { Cookies } from 'react-cookie';
import { ISignedIn } from "../components/commons/NavBar";

const cookies = new Cookies();

interface ICookieOpt {
	path: string;
	expires?: Date;
	secure?: boolean;
	httpOnly?: boolean;
}

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
    response => {
		toast.success('Your info has been altered successfully!', toastConfig);
		return response;
	},
    error => {
		handleErrors(error);
        return Promise.reject(error);
})

const handleErrors = ({ request }: AxiosError) => {
	const status = request.status;
	if (status === 500) {
		toast.error('Please upload your pic in smaller sizes.', toastConfig);
	} else if (status === 400) {
		toast.error('There might be some errors on the server. Please try later. :(', toastConfig);
	} else if (status === 409) {
		toast.error('Id is duplicate. Please try another id.', toastConfig);
	} else if (status === 401) {
		toast.error('Unauthorized. Please sign in again.', toastConfig);
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
    (error: AxiosError) => {
        const status = error.response?.status;
        if (status === 404)
            toast.error('No such Id in our record.', toastConfig);
        else if (status === 400)
            toast.error('Password does not matches!.', toastConfig);
        return Promise.reject();
    }
)

export const requestWithTokenAxios = axios.create();

requestWithTokenAxios.interceptors.request.use(
	request => {
		if (request.headers)
			request.headers['authorization'] = `Bearer ${getAccessToken(CHATO_TOKEN)}`;
		return request;
	},
	error => error,
)

requestWithTokenAxios.interceptors.response.use(
	(response: AxiosResponse) => response,
	async (error: AxiosError) => {
		console.log(error);
		const status = error.response?.status;
		if (status === 401) {
			console.log(error);
			const targetUrl = error.config.url;
			const method = error.config.method;
			const body = error.config.data;
			const env = error.config.env?.FormData;
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
				const resendResult = await resendRequest(method, targetUrl, body, env);
				if (resendResult) {
					return { data: resendResult };
				}
			} else if (accessTokenRequestStatus !== 200) {
				// 리프레시 토큰도 만료됐을 때.
				// 상태가 200이 아니면 재로그인 페이지로
			}
		} else if (status === 403) {
			toast.error('You are not authorized!', toastConfig);
		}
		return error;
	}
)

type Tenv = (new (...args: any[]) => object) | undefined;

const resendRequest = (method?: string, url?: string, body?: JSON, env?: Tenv) :Promise<unknown> => {
	return new Promise(async (success, fail) => {
		let result: unknown;
		try {
			if (method && url) {
				const contentType = { 'Content-Type': 'application/json' };
				switch (method) {
					case 'get':
						result = await (await requestWithTokenAxios.get(url, { headers: contentType })).data;
						break;
					case 'post':
						result = await (await requestWithTokenAxios.post(url, (env && env?.length > 0) ? env : body, { headers: contentType })).data;
						break;
					case 'put':
						result = await (await requestWithTokenAxios.put(url, (env && env?.length > 0) ? env : body, { headers: contentType })).data;
						break;
					case 'delete':
						result = await (await requestWithTokenAxios.delete(url, { headers: contentType })).data;
						break;
				}
			}
			success(result);
		} catch (e) { fail(); };
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