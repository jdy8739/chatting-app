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