import { combineReducers } from "redux";
import { HYDRATE } from "next-redux-wrapper";
import signInReducer from "./signInReducer";

const rootReducer = (state: any, action: any) => {
  switch (action.type) {
    case HYDRATE:
      return action.payload;
    default:
      return combineReducers({ signInReducer })(state, action);
  }
};

export default rootReducer;