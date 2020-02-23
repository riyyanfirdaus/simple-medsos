import React, { Component } from 'react';
import './Profile.css';
import '../Home/Home.css';
import BgProfile from '../../../assets/img/BgProfile.jpg';
import ProfileDefault from '../../../assets/img/profile/ProfileDefault.png';
import firebase, { storage } from '../../../config/firebase/fbConfig';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { editProfile } from '../../../config/redux/actions/appAction';

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            imagePreview: null,
            imageBgPreview: null,
            progress: 0,
            progressBg: 0
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSetState = this.handleSetState.bind(this);
        this.onImageChange = this.onImageChange.bind(this);
        this.onImageBgChange = this.onImageBgChange.bind(this);
    }

    componentDidMount() {
        const M = window.M;
        const modal = document.querySelectorAll('.modal');
        M.Modal.init(modal, {
            preventScrolling: false
        });
    }

    handleSetState = (data) => {
        this.setState({
            firstName: data.firstName,
            lastName: data.lastName,
            photoUrl: data.photoUrl,
            photoBgUrl: data.photoBgUrl,
            email: data.email
        });
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]:  e.target.value
        });
    }

    onImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            let file = e.target.files[0];
            this.setState({
                imagePreview: URL.createObjectURL(e.target.files[0])
            });

            const storageRef = storage.ref();
            const uploadTask = storageRef.child(`images/profile/${file.name}`).put(file);

            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            snapshot => {
            
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                this.setState({
                    progress: progress
                })
                
            }, error => {
                console.log(error);
            }, () => {
                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                    this.setState({
                        photoUrl: downloadURL
                    });
                    if(this.props.profile.photoUrl) {
                        const httpsReference = storage.refFromURL(this.props.profile.photoUrl);
                        httpsReference.delete();
                    }
                });
            } );
        }
    }

    onImageBgChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            let BgFile = e.target.files[0];
            this.setState({
                imageBgPreview: URL.createObjectURL(e.target.files[0])
            });

            const storageRef = storage.ref();
            const uploadTask = storageRef.child(`images/profile/BgProfile/${BgFile.name}`).put(BgFile);

            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            snapshot => {
            
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                this.setState({
                    progressBg: progress
                })
                
            }, error => {
                console.log(error);
            }, () => {
                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                    this.setState({
                        photoBgUrl: downloadURL
                    });
                    if(this.props.profile.photoBgUrl) {
                        const httpsReference = storage.refFromURL(this.props.profile.photoBgUrl);
                        httpsReference.delete();
                    }
                });
            } );
        }
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        console.log(this.state);
        const res = await this.props.editProfile(this.state).catch(err => err);
        if(res) {
            this.setState({
                firstName: '',
                lastName: '',
                email: '',
                imagePreview: null,
                imageBgPreview: null,
                progress: 0,
                progressBg: 0
            })
        }
    }

    render() {
        const { auth } = this.props;
        const { profile } = this.props;
        const data = {
            firstName: profile.firstName,
            lastName: profile.lastName,
            photoUrl: profile.photoUrl,
            photoBgUrl: profile.photoBgUrl,
            email: auth.email,
        }
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if(!userData) {
         return <Redirect to="/login" />
        }
        return (
            <div>
                <div className="container">
                    <div id="profile-page-header" className="card">
                        <div className="card-image waves-effect waves-block waves-light">
                            <img className="activator" src={profile.photoBgUrl || BgProfile} alt="bg-profile"/>
                        </div>
                        <div className="card-profile-image">
                            <img src={profile.photoUrl || ProfileDefault} alt="profile" className="circle white"/>
                        </div>
                        <div className="card-content">
                            <button data-target="profile" className="btn modal-trigger btn-floating halfway-fab waves-effect waves-light red" onClick={() => this.handleSetState(data)}><i className="material-icons">edit</i></button>                    
                            <div className="row">                    
                                <div className="col s6 m6 offset-s6 offset-m3">                        
                                    <h4 className="card-title grey-text text-darken-4">{`${profile.firstName} ${profile.lastName}`}</h4>
                                    <p className="medium-small grey-text">{auth.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <section>
                    <div id="profile" className="modal modal-fixed-footer">
                        <form onSubmit={this.handleSubmit}>
                            <div className="modal-content">
                                <h4>Edit Profile</h4>
                                <div className="row">
                                    <div className="col s12">
                                        <div className="row">
                                            <div className="input-field col s6">
                                                <input placeholder="first name" id="firstName" type="text" className="validate" value={this.state.firstName} onChange={this.handleChange} />
                                                <label htmlFor="firstName">First Name</label>
                                            </div>
                                            <div className="input-field col s6">
                                                <input placeholder="last name" id="lastName" type="text" className="validate" value={this.state.lastName} onChange={this.handleChange} />
                                                <label htmlFor="lastName">Last Name</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="input-field col s12">
                                                <input disabled placeholder="email" id="disabled" type="text" className="validate" value={this.state.email} />
                                                <label htmlFor="disabled">Email</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <h6>Photo Profile</h6>
                                            <img className="responsive-img photoUrl" src={this.state.imagePreview || profile.photoUrl || ProfileDefault} alt="photoProfile" />
                                            {
                                                this.state.imagePreview ? (
                                                    <div className="progress">
                                                        <div className="determinate" style={{width: `${this.state.progress}%`}}></div>
                                                    </div>
                                                ) : null
                                            }
                                            <input type="file" id="file" onChange={this.onImageChange} />
                                        </div>
                                        <div className="row">
                                            <h6>Background Image</h6>
                                            <img className="responsive-img photoUrl" src={ this.state.imageBgPreview || profile.photoBgUrl || BgProfile} alt="photoBgProfile" />
                                            {
                                                this.state.imageBgPreview ? (
                                                    <div className="progress">
                                                        <div className="determinate" style={{width: `${this.state.progressBg}%`}}></div>
                                                    </div>
                                                ) : null
                                            }
                                            <input type="file" id="fileBg" onChange={this.onImageBgChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="modal-close waves-effect waves-green btn-flat">Agree</button>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile
    }
}

const mapDispatchToProps = (dispatch) => ({
    editProfile: (data) => dispatch(editProfile(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);