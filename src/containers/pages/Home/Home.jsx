import React, { Component } from "react";
import firebase, { storage } from '../../../config/firebase/fbConfig';
// import { Link } from "react-router-dom";
import './Home.css';
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { createPost } from "../../../config/redux/actions/appAction";
import { compose } from "redux";
import { firestoreConnect } from "react-redux-firebase";
import PostList from "../../../components/posts/PostList";

class Home extends Component {
    constructor() {
        super();
        this.state = {
            content: '',
            imagePostUrl: null,
            imagePreview: null,
            progress: 0
        }

    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        })
    }

    onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            let file = event.target.files[0];
            this.setState({
                imagePreview: URL.createObjectURL(event.target.files[0])
            });
            const storageRef = storage.ref();
            const uploadTask = storageRef.child(`images/post/${file.name}`).put(file);

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
                        imagePostUrl: downloadURL
                    });
                });
            } );
        }
    }

    removeImage = async () => {
        await storage.refFromURL(this.state.imagePostUrl).delete()
        .then(() => {
            this.setState({
                imagePreview: null,
                progress: 0
            })
        })
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        const { createPost } = this.props;
        if(this.state.content || this.state.imagePostUrl) {
            const res = await createPost(this.state).catch(err => err);
            if(res) {
                window.M.toast({html: `<span>Create Post Success</span>`});
                this.setState({
                    content: '',
                    imagePreview: null,
                    imagePostUrl: null
                });
            } else {
                window.M.toast({html: `<span>Create Post Failed</span>`});
            }
        }
    }


    render() {
        const { posts } = this.props;
        const userData = JSON.parse(localStorage.getItem('userData'));
        if(!userData) {
         return <Redirect to="/login" />
        }
            
        
        return (
            <div className="container">
                <div className="row flex-s">
                    <PostList posts={posts} />
                    <div className="col s12 m6 box-send">
                        <div className="card">
                            <div className="card-content">
                                <form onSubmit={this.handleSubmit}>
                                    {
                                        !this.state.imagePreview ? (
                                            <div className="input-field col s3">
                                                <input type="file" hidden id="file" onChange={this.onImageChange}/>
                                                <div className="file-path-wrapper">
                                                    <label htmlFor="file" className="imageBtn">
                                                        <i className="material-icons small">add_a_photo</i>
                                                    </label>
                                                </div>
                                            </div>

                                        ) : null
                                    }
                                    <span>
                                        {
                                            this.state.imagePreview ? (
                                                <div className="close" onClick={this.removeImage}><i className="material-icons circle  grey lighten-3">close</i></div>
                                            ) : null
                                        }
                                        <img id="target" className="responsive-img" src={this.state.imagePreview} alt=""/>
                                        {
                                            this.state.imagePreview ? (
                                                <div className="progress">
                                                    <div className="determinate" style={{width: `${this.state.progress}%`}}></div>
                                                </div>
                                            ) : null
                                        }
                                    </span>
                                    <div className="input-field">
                                        <textarea id="content" className ="materialize-textarea" value={this.state.content} onChange={this.handleChange} placeholder="post something"></textarea>
                                        {
                                            this.state.content !== '' || this.state.imagePreview ? (
                                                this.state.progress === 100 || this.state.content !== '' ? (
                                                    <button className="blue darken-3 waves-effect waves-light btn-small"><i className="material-icons right">send</i>SEND</button>
                                                ) : (
                                                    <button className="blue darken-3 waves-effect waves-light btn-small" disabled><i className="material-icons right">send</i>SEND</button>
                                                )
                                            ) : null
                                        }
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        posts: state.firestore.ordered.posts
    }
}

const mapDispatchToProps = (dispatch) => ({
    createPost: (data) => dispatch(createPost(data))
});

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    firestoreConnect((props) => {
        if(!props.auth.uid) return []
        return [
            { collection: 'posts', orderBy: ['createdAt', 'desc'] }
        ]
    })
)(Home);