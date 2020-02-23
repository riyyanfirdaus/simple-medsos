import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logOut } from '../../config/redux/actions/authAction';
import { connect } from 'react-redux';
import NavbarSignIn from '../../components/navbar/NavbarSignIn';
import './Navbar.css';
import ProfileDefault from '../../assets/img/profile/ProfileDefault.png';
import moment from 'moment';
import { compose } from 'redux';
import { firestoreConnect } from 'react-redux-firebase';

const Navbar = (props) => {
    useEffect(() => {
        const M = window.M;
        const sidenav = document.querySelectorAll('.sidenav');
        M.Sidenav.init(sidenav);
        
        const dropdown = document.querySelectorAll('.dropdown-trigger');
        M.Dropdown.init(dropdown);
        
    })

    const { auth } = props;
    const { profile } = props;
    const { notifications } = props;

    return (
        <div>
            <div className="navbar-fixed">
                <nav className="blue darken-3">
                    <div className="nav-wrapper container">
                        <Link to="/" className="brand-logo">Medsos</Link>
                        {
                            auth.uid ? <NavbarSignIn /> : null
                        }
                    </div>
                </nav>
            </div>


            <ul className="sidenav notifSide" id="mobile-demo">
                <li><div className="user-view">
                    <div className="background">
                        <img src="https://img.freepik.com/free-vector/gradient-geometric-shape-background_78532-374.jpg?size=626&ext=jpg" alt=""/>
                    </div>
                    <img className="circle" src={profile.photoUrl || ProfileDefault} alt="Profile"/>
                    <span className="white-text name">{`${profile.firstName} ${profile.lastName}`}</span>
                    <span className="white-text email">{auth.email}</span>
                    </div>
                </li>
                <li><Link to="/profile" className="sidenav-close"><i className="material-icons">account_circle</i>Profile</Link></li>
                <li><a href="!#" data-target="side" className="sidenav-trigger"><i className="material-icons">notifications</i>Notification</a></li>
                <li><div className="divider"></div></li>
                <li><Link to="#" onClick={() => {
                    window.M.toast({html: `<span>Are you sure exit ?</span><button id="yesBtn" class="btn-flat toast-action">Yes</button> <button id="noBtn" class="btn-flat toast-action" onclick="window.M.Toast.dismissAll()">No</button>`, displayLength: 8000, classes: `exit` });

                    document.querySelector(`#yesBtn`).addEventListener('click', () => {
                        window.M.Toast.getInstance(document.querySelector(`.exit`)).dismiss();
                        props.logOut();
                    }) 
                }}><i className="material-icons">exit_to_app</i>Logout</Link></li>
            </ul>

            <ul className="sidenav collection" id="side">
                {
                    notifications && notifications.map(item => {
                        return (<li className="collection-item" key={item.id}>
                            <p><span className="blue-text text-darken-1">{item.user}</span> {item.content}</p>
                            <small>{moment(item.time.toDate()).fromNow()}</small>
                        </li>)
                    })
                }
                <li className="collection-item sidenav-close"><i className="material-icons">close</i></li>
            </ul>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
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
            { collection: 'notifications', limit: 7, orderBy: ['time', 'desc'] }
        ]
    })
)(Navbar);