

enum LIKED_LIST {
    ADD = "ADD",
    REMOVE = "REMOVE",
    REPLACE = "REPLACE",
    TRUNCATE = "TRUNCATE",
}
  
// Action Creators
export const addInList = (targetSubject: string) => ({ 
  type: LIKED_LIST.ADD,
  subject: targetSubject,
});

export const removeInList = (targetSubject: string) => ({ 
  type: LIKED_LIST.REMOVE,
  subject: targetSubject,
});

export const replaceList = (subjectList: string[]) => ({
  type: LIKED_LIST.REPLACE,
  subjectList: subjectList,
});

export const truncateList = () => ({ type: LIKED_LIST.REPLACE });
  
  // Initial State
const initialState: {subjectList: string[]} = {subjectList: []};

interface IAction { 
  type: string, 
  subject?: string, 
  subjectList?: string[],
}
  
  // Reducer
const likedSubjectReducer = (state = initialState, action: IAction) :{subjectList: string[]} => {
    switch (action.type) {
      case LIKED_LIST.ADD:
        if (state.subjectList.length > 7)
          state.subjectList.shift();
        return {
          subjectList: [
            ...state.subjectList,
            action.subject || '',
          ],
        };
      case LIKED_LIST.REMOVE:
        return {
          subjectList: state.subjectList.filter(subject => {
            return (subject !== action.subject);
          })
        }
      case LIKED_LIST.REPLACE:
        if (action.subjectList)
        return {
          subjectList: action.subjectList,
        }
      case LIKED_LIST.TRUNCATE:
        return {
          subjectList: [],
        }
      default:
        return state;
    }
};
  
export default likedSubjectReducer;