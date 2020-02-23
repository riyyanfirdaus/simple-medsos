const initState = {
}

const appReducer = (state = initState, action) => {
    switch (action.type) {
        case 'CREATE_POST':
            return state;
        case 'CREATE_POST-ERROR':
            return state;
        case 'ADD_COMMENT':
            return state;
        case 'ADD_COMMENT_ERROR':
            return state;
        case 'ADD_LIKE':
            return state;
        case 'ADD_LIKE_ERROR':
            return state;
        case 'DELETE_LIKE':
            return state;
        case 'DELETE_LIKE_ERROR':
            return state;
        case 'EDIT_USER':
            window.M.toast({html: `<span>User Update Success</span>`});
            return state;
        case 'EDIT_USER_ERROR':
            window.M.toast({html: `<span>User Update Failed</span>`});
            return state;
        case 'CHANGE_SHOW':
            return state
        default:
            return state;
    }
}
export default appReducer;