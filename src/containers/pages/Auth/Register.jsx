import React, { Component } from 'react';
import './Register.css';
import AvtLogin from '../../../assets/img/avatars/AvtLogin.png';
import { connect } from 'react-redux';
import { register } from '../../../config/redux/actions/authAction';
import firebase, { storage } from '../../../config/firebase/fbConfig';
import { Redirect, Link } from 'react-router-dom';

class Register extends Component {
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

    onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            let reader = new FileReader();
            let file = event.target.files[0];
            reader.onload = (e) => {
                this.setState({
                    imagePreview: e.target.result
                });
                const storageRef = storage.ref();
                const uploadTask = storageRef.child(`images/profile/${file.name}`).put(file);

                uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                snapshot => {
                
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    console.log('Upload is ' + progress + '% done');
                }, error => {
                    console.log(error);
                }, () => {
                    uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                        this.setState({
                            photoUrl: downloadURL
                        });
                    });
                } );
            };
            reader.readAsDataURL(file);
        }
    }


    handleSubmit = (e) => {
        e.preventDefault();       
        const { register } = this.props;
        register(this.state);
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
                        <form onSubmit={this.handleSubmit} className="form-register">
                            <div className="row">
                                <div className="input-field col s12 center">
                                    <img className="image-login" src={AvtLogin} alt=""/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="input-field col s12">
                                    <input id="email" type="text" className="validate" onChange={this.handleChange} />
                                    <label htmlFor="email">Email</label>
                                </div>
                                <div className="input-field col s12">
                                    <input id="password" type="password" className="validate" onChange={this.handleChange} />
                                    <label htmlFor="password">Password</label>
                                </div>
                                <div className="input-field col s6">
                                    <input id="firstName" type="text" className="validate" onChange={this.handleChange} />
                                    <label htmlFor="firstName">First Name</label>
                                </div>
                                <div className="input-field col s6">
                                    <input id="lastName" type="text" className="validate" onChange={this.handleChange} />
                                    <label htmlFor="lastName">Last Name</label>
                                </div>
                                <div className="input-field col s3">
                                    <input type="file" hidden id="file" multiple onChange={this.onImageChange} />
                                    <div className="file-path-wrapper">
                                        <label htmlFor="file">
                                            <i className="material-icons small">add_a_photo</i>
                                        </label>
                                    </div>
                                </div>
                                <div className="input-field col s9">
                                    <img id="target" className="responsive-img"  src={this.state.imagePreview} alt=""/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="input-field col s12">
                                    <button className="btn waves-effect wafes-light col s12">Register</button>
                                </div>
                                <div className="center-align">
                                    <small>Back to <Link to="/login">Login</Link></small>
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
    auth: state.firebase.auth,
    authError: state.auth.authError
})

const mapDispatchToProps = (dispatch) => ({
    register: (newUser) => dispatch(register(newUser))
})

export default connect(mapStateToProps, mapDispatchToProps)(Register);