import { combineReducers } from "redux";
import { HYDRATE } from "next-redux-wrapper";
import signInReducer, { IUserSignedInInfo } from "./signInReducer";

const rootReducer = (
  state: any, 
  action: { type: string; userInfo: IUserSignedInInfo, payload?: unknown }) => {
  switch (action.type) {
    case HYDRATE:
      return action.payload;
    default:
      return combineReducers({ signInReducer })(state, action);
  }
};

export default rootReducer;