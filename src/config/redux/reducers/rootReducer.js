import { firebaseReducer } from "react-redux-firebase";
import { firestoreReducer } from "redux-firestore";
import { combineReducers } from "redux";
import authReducer from "./authReducer";
import appReducer from "./appReducer";

const rootReducer = combineReducers({
    firebase : firebaseReducer,
    firestore: firestoreReducer,
    auth: authReducer,
    app: appReducer,
});

export default rootReducer;