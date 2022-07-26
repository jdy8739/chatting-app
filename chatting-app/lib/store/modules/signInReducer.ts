const SIGN_IN = "SIGN_IN";

const SING_OUT = "SIGN_OUT"

// Action Creators
export const signIn = (text: string) => ({ type: SIGN_IN, text });

export const signOut = () => ({ type: SING_OUT });
// Initial State
const initialState: {id: string} = {id: ''};

// Reducer
const signInReducer = (state = initialState, action: {type: string, text: string}) => {
  switch (action.type) {
    case SIGN_IN:
      return {...state, ['id']: action.text}
    case SING_OUT:
      return {['id']: ''}
    default:
      return state;
  }
};


export default signInReducer;