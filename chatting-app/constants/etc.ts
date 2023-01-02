import { toast } from "react-toastify";

export const CHATO_TOKEN = "CHATO_TOKEN";

export const ID_REGEX = /^(?!.*[!#$%&’'*+/=?^_`])[a-zA-Z0-9]+$/;

export const PW_REGEX = /^(?=.*[~`!@#$%^&*()--+={}[\]|\\:;"'<>,.?/_₹])/;

export const toastConfig = {
  position: toast.POSITION.TOP_CENTER,
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};
