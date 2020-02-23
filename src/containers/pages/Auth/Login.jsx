import React, { Component } from 'react';
import './Login.css';
import AvtLogin from '../../../assets/img/avatars/AvtLogin.png';
import { connect } from 'react-redux';
import { logIn } from '../../../config/redux/actions/authAction';
import { Redirect, withRouter, Link } from 'react-router-dom';


class Login extends Component {
    

    state = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        photoUrl: ''
    }
    

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        })
    }


    handleSubmit = async (e) => {
        e.preventDefault();
        const {email, password} = this.state;
        const {history} = this.props;
        const res = await this.props.logIn({email, password}).catch(err => err);
        if(res) {
            localStorage.setItem('userData', JSON.stringify(res));
            this.setState({
                email: '',
                password: ''
            })
            history.push('/')
        }
    }

    render() {
        const { authError } = this.props;
        const userData = JSON.parse(localStorage.getItem('userData'));
        if(userData) {
            return <Redirect to="/" />
        }
        return (
            <div className="container">
                <div className="row">
                    <div className="col m6 offset-m3 z-depth-6 card-panel">
                        <form className="form-login" onSubmit={this.handleSubmit}>
                            <div className="row">
                                <div className="col s12 center">
                                    <img className="image-login" src={AvtLogin} alt=""/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="input-field col s12">
                                    <i className="material-icons prefix">mail</i>
                                    <input id="email" type="text" className="validate" onChange={this.handleChange} />
                                    <label htmlFor="icon_prefix">Email</label>
                                </div>
                                <div className="input-field col s12">
                                    <i className="material-icons prefix">lock_outline</i>
                                    <input id="password"  type="password" className="validate" onChange={this.handleChange} />
                                    <label htmlFor="icon_telephone">Password</label>
                                </div>
                            </div>
                            <div className="row">
                                <div className="input-field col s12">
                                    <button className="btn waves-effect wafes-light col s12">Login</button>
                                </div>
                                <div className="center-align">
                                    <small>Don't have an account? <Link to="/register">Register</Link></small>
                                </div>
                                <div className="red-text center">
                                    { authError ? <p>{ authError }</p> : null }
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}


const mapStateToProps = (state) => ({
    authError: state.auth.authError,
    auth: state.firebase.auth
})

const mapDispatchToProps = (dispatch) => ({
    logIn: (cred) => dispatch(logIn(cred)) 
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));