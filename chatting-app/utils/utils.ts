import axios, { Axios, AxiosError } from "axios";
import { toast } from "react-toastify";
import { Cookies } from 'react-cookie';

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

export const getCookie = (name: string) :string => {
	return cookies.get(name);
};

export const removeCookie = (name: string, options: ICookieOpt) => {
	return cookies.remove(name, options);
};

export const CHATO_USERINFO = "CHATO_USERINFO";

export const ID_REGEX = /^[a-zA-Z0-9]/;

export const PW_REGEX = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;

export const MASTER = 'MASTER';

export const DISBANDED = 'disbanded';

export const SUBSCRIBE_PROTOCOL_NUMBER = 0;

export const BAN_PROTOCOL_NUMBER = 2;

export const generateRandonUserId = () => {
    let a = new Uint32Array(3);
    window.crypto.getRandomValues(a);
    return (performance.now().toString(36)+Array.from(a).map(A => A.toString(36)).join("")).replace(/\./g,"");
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
    response => {
		toast.success('Hello! Welcome To Chato', toastConfig);
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