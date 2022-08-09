

enum LIKED_LIST {
    ADD = "ADD",
    REMOVE = "REMOVE",
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
  
  // Initial State
const initialState: {subjectList: string[]} = {subjectList: []};
  
  // Reducer
const likedSubjectReducer = (state = initialState, action: {type: string, subject: string}) :{subjectList: string[]} => {
    switch (action.type) {
      case LIKED_LIST.ADD:
        return {
          subjectList: [
            ...state.subjectList,
            action.subject,
          ],
        };
      case LIKED_LIST.REMOVE:
        return {
          subjectList: state.subjectList.filter(subject => {
            return (subject !== action.subject);
          })
        }
      default:
        return state;
    }
};
  
export default likedSubjectReducer;