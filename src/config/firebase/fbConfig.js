import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB-nue1ezsv6hip4IDrB736kD2Cb7bTh7s",
  authDomain: "medsos-id.firebaseapp.com",
  databaseURL: "https://medsos-id.firebaseio.com",
  projectId: "medsos-id",
  storageBucket: "medsos-id.appspot.com",
  messagingSenderId: "729695129150",
  appId: "1:729695129150:web:962fd15ac08bb9321f4b6f",
  measurementId: "G-V46ZKKD1Q8"
};
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();
export const storage = firebase.storage();

export default firebase;