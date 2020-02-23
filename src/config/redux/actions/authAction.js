import firebase, { firestore } from '../../firebase/fbConfig';

export const register = (newUser) => (dispatch) => {
    firebase.auth().createUserWithEmailAndPassword(
        newUser.email,
        newUser.password
    ).then(res => {
        const data = {
            uid: res.user.uid,
            email: res.user.email
        }
        localStorage.setItem('userData', JSON.stringify(data));
        return firestore.collection('users').doc(res.user.uid).set({
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          photoUrl: newUser.photoUrl,
          photoBgUrl: '',
          createdAt: new Date()
        })
    }).then(() => {
        dispatch({ type: 'REGISTER_SUCCESS' })
    }).catch(err => {
        dispatch({ type: 'REGISTER_ERROR', err })
    })
}

export const logIn = (credentials) => (dispatch) => {
    return new Promise((resolve, reject) => {
        firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
        .then(res => {
            const data = {
                uid: res.user.uid,
                email: res.user.email
            }
            dispatch({type: 'LOGIN_SUCCESS'});
            resolve(data);
        })
        .catch(err =>  {
            dispatch({type: 'LOGIN_ERROR'}, err);
            reject(false);
        })
    });
}


export const logOut = () => (dispatch) => {
    firebase.auth().signOut().then(() => {
        firebase.logout();
        localStorage.removeItem('userData');
        dispatch({ type: 'SIGNOUT_SUCCESS' });
    });
}