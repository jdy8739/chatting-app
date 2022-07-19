import { toast } from "react-toastify";

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

export const MASTER = 'MASTER';
export const REJECTED = 'rejected';
export const DISBANDED = 'disbanded';