import React, { useEffect } from 'react';
import './App.css';
import firebase from '../config/firebase/fbConfig';
import { store } from '../config/redux/store';
import { Provider } from 'react-redux';
import { ReactReduxFirebaseProvider } from 'react-redux-firebase';
import { createFirestoreInstance } from 'redux-firestore';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import Navbar from './templates/Navbar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

const rrfConfig = {
  userProfile: 'users',
  useFirestoreForProfile: true
}

const rrfProps = {
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch,
  createFirestoreInstance
}




function App() {
  useEffect(() => {
    const elem = document.getElementById('startingLoader');
    window.onload = () => {
     if (elem) {
      elem.remove();
     }
    }
  });

  return (
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <Router>
          <div>
            <Navbar />
            <Switch>
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <Route exact  path="/profile" component={Profile} />
              <Route exact path="/" component={Home} />
            </Switch>
          </div>
        </Router>
      </ReactReduxFirebaseProvider>
    </Provider>
  );
}

export default App;
