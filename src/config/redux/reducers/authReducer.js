const initState = {
    authError: null
}

const authReducer = (state=initState, action) => {
    switch (action.type) {
        case 'LOGIN_ERROR':
            window.M.toast({html: `<span>Login Error</span>`});
            return {
                ...state,
                authError: 'Login failed'
            }
        case 'LOGIN_SUCCESS':
            window.M.toast({html: `<span>Login Success</span>`});
            return {
                ...state,
                authError: null
            }
        case 'SIGNOUT_SUCCESS':
            window.M.toast({html: `<span>Logout Success</span>`});
            return state;
        case 'REGISTER_SUCCESS':
            window.M.toast({html: `<span>Register Success</span>`});
            return {
                ...state,
                authError: null
            }
        case 'REGISTER_ERROR':
            window.M.toast({html: `<span>Register Error</span>`});
            return {
                ...state,
                authError: action.err.message
            }
        default:
            return state;
    }
}
export default authReducer;