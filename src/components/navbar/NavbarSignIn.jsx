import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logOut } from '../../config/redux/actions/authAction';
import './NavbarSignIn.css';
import { compose } from 'redux';
import { firestoreConnect } from 'react-redux-firebase';
import moment from 'moment';



const NavbarSignIn = (props) => {

    useEffect(() => {
        const M = window.M;
        const dropdown = document.querySelectorAll('.dropdown-trigger');
        M.Dropdown.init(dropdown);
    })

    const { notifications } = props;

    return (
        <span>
            <a href="!#" data-target="mobile-demo" className="sidenav-trigger"><i className="material-icons">menu</i></a>
            <ul className="right hide-on-med-and-down">
                <li className="dropdown-trigger" data-target="notif">
                    <i className="material-icons">notifications</i>
                </li>
                <li><Link to="/profile"><i className="material-icons right">account_circle</i></Link></li>
                <li onClick={() => {
                    window.M.toast({html: `<span>Are you sure exit ?</span><button id="yesBtn" class="btn-flat toast-action">Yes</button> <button id="noBtn" class="btn-flat toast-action" onclick="window.M.Toast.dismissAll()">No</button>`, displayLength: 8000, classes: `exit` });

                    document.querySelector(`#yesBtn`).addEventListener('click', () => {
                        window.M.Toast.getInstance(document.querySelector(`.exit`)).dismiss();
                        props.logOut();
                    }) 
                }}><Link to="#"><i className="material-icons">exit_to_app</i></Link></li>
            </ul>
            <ul id="notif" className="dropdown-content collection">
                {
                    notifications && notifications.map(item => {
                        return (<li className="collection-item" key={item.id}>
                            <p><span className="blue-text text-darken-1">{item.user}</span> {item.content}</p>
                            <small>{moment(item.time.toDate()).fromNow()}</small>
                        </li>)
                    })
                }
            </ul>
        </span>
    )
}

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        notifications: state.firestore.ordered.notifications
    }
}

const mapDispatchToProps = (dispatch) => ({
    logOut: () => dispatch(logOut())
})

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    firestoreConnect((props) => {
        if(!props.auth.uid) return []
        return [
            { collection: 'notifications', limit: 5, orderBy: ['time', 'desc'] }
        ]
    })
)(NavbarSignIn);