enum SIGN {
  IN = "SIGN_IN",
  OUT = "SIGN_OUT",
}

export interface IUserSignedInInfo {
  userNo: number;
  userId: string;
  userNickName: string;
}

// Action Creators
export const signIn = (userInfo: IUserSignedInInfo) => ({
  type: SIGN.IN,
  userInfo,
});

export const signOut = () => ({ type: SIGN.OUT });

// Initial State
const initialState: { userInfo: IUserSignedInInfo } = {
  userInfo: {
    userNo: -1,
    userId: "",
    userNickName: "",
  },
};

// Reducer
const signInReducer = (
  state = initialState,
  action: { type: string; userInfo: IUserSignedInInfo }
): { userInfo: IUserSignedInInfo } => {
  switch (action.type) {
    case SIGN.IN:
      return {
        userInfo: { ...action.userInfo },
      };
    case SIGN.OUT:
      return {
        userInfo: {
          userNo: -1,
          userId: "",
          userNickName: "",
        },
      };
    default:
      return state;
  }
};

export default signInReducer;
