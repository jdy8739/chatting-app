import { CombinedState, combineReducers } from "redux";
import { HYDRATE } from "next-redux-wrapper";
import signInReducer from "./signInReducer";

const rootReducer = (
  state: any, 
  action: { type: string; text: string, payload?: unknown }) => {
  switch (action.type) {
    case HYDRATE:
      return action.payload;
    default:
      return combineReducers({ signInReducer })(state, action);
  }
};

export default rootReducer;