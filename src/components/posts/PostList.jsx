import React, { useState, useEffect } from 'react';
import moment from 'moment';
import '../../containers/pages/Home/Home.css';
import NoImage from '../../assets/img/NoImage.jpg';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { addLike, deleteLike, deletePost, updatePost } from '../../config/redux/actions/appAction';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import ModalComment from './ModalComment';
import firebase, { storage } from '../../config/firebase/fbConfig';
import ProfileDefault from '../../assets/img/profile/ProfileDefault.png';

const PostList = (props) => {
    const [postId, setPostId] = useState('');
    const [modalId, setModalId] = useState('');
    const [editId, setEditId] = useState('');
    const [imagePostEdit, setImagePostEdit] = useState(null);
    const [imageEditPreview, setImageEditPreview] = useState(null);
    const [imagePostUrl, setImagePostUrl] = useState(null);
    const [contentPostEdit, setContentPostEdit] = useState('');
    const [likeId, setLikeId] = useState('');
    const [visible, setVisible] = useState(10);
    const [isEdit, setIsEdit] = useState(false);
    const [progress, setProgress] = useState(0);
    
    const {posts} =  props;
    const {likes} = props;
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    const displayMore = {
        display: 'none'
    }

    const displayBtnEdit = {
        top: '-29px',
        right: '-49px'
    }
    
    useEffect(() => {
        const M = window.M;
        const dropdownMenu = document.querySelectorAll('.dropdown-trigger');
        M.Dropdown.init(dropdownMenu);

        const modal = document.querySelectorAll('.modal');
        M.Modal.init(modal, {
            preventScrolling: false
        });

        M.textareaAutoResize(document.querySelector('#content'));
    })

    const openModalComment = (post) => {
        setModalId(post.id);
    }

    const handleDeletePost = async (postId, imagePostUrl) => {
        const dataDelete = {
            postId,
            imagePostUrl
        }
        await props.deletePost(dataDelete).catch(err => err);
        
    }
    
    const handleSubmitLike = async (e) => {
        e.preventDefault();
        if(postId) {
            await props.addLike(postId).catch(err => err);
        } else {
            await props.deleteLike(likeId).catch(err => err);
        }
    }

    const editPost = (post) => {
        setIsEdit(true);
        setEditId(post.id);
        setImagePostEdit(post.imagePostUrl);
        setContentPostEdit(post.content);
    }

    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            let file = event.target.files[0];
            setImageEditPreview(URL.createObjectURL(event.target.files[0]));

            const storageRef = storage.ref();
            const uploadTask = storageRef.child(`images/post/${file.name}`).put(file);

            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            snapshot => {
            
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(progress);
            }, error => {
                console.log(error);
            }, () => {
                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                    setImagePostUrl(downloadURL);
                    if(imagePostEdit) {
                        const httpsReference = storage.refFromURL(imagePostEdit);
                        httpsReference.delete();
                    }
                });
            } );
        }
    }

    const submitEditPost = async () => {
        const data = {
            editId,
            contentPostEdit,
            imagePostUrl: imagePostUrl || imagePostEdit
        }

        await props.updatePost(data);

        setIsEdit(false);
        setEditId('');
        setImagePostEdit(null);
        setImageEditPreview(null);
        setImagePostUrl(null);
        setContentPostEdit('');
        setProgress(0);

    }

    const loadMore = () => {
        setVisible(visible + 4);
    }

    
    return (
        <div>
            <div className="col s12 m6">
                {
                    posts && posts.slice(0, visible).map(post => {
                        post.likes = [];
                        likes && likes.map(like => {
                            if(like.postId === post.id) {
                                post.likes.push(like); 
                            }
                            return like;
                        })
                        let word = post.content;
                        let lessWord = word.slice(0, 325);
                        let fulWord = word.slice(325, word.length);
                        return (
                            <div className="card sticky-action" key={post.id}>
                                <div className="card-profile-title">
                                    <div className="row">
                                        <div className="col s2">
                                            <img src={post.authorPhotoUrl || ProfileDefault} width="43" alt="" className="circle profile-post" />                        
                                        </div>
                                        <div className="col s8">
                                            <p className="grey-text text-darken-4 profile-title">{`${post.authorFirstName} ${post.authorLastName}`}</p>
                                            <span className="grey-text text-darken-1 time">{moment(post.createdAt.toDate()).calendar()}</span>
                                        </div>
                                        {
                                            (post.authorId === userData.uid) ?
                                            (
                                            <div className="col s2">
                                                <i className="dropdown-trigger small material-icons" data-target={`dropdownMenu-${post.id}`}>expand_more</i>
                                                <ul id={`dropdownMenu-${post.id}`} className="dropdown-content" key={post.id}>
                                                    <li onClick={() => editPost(post)}><i className="tiny material-icons" >edit</i> edit post</li>
                                                    <li onClick={() => {
                                                        window.M.toast({html: `<span>Are you sure delete this post ?</span><button id="yesBtn" class="btn-flat toast-action">Yes</button> <button id="noBtn" class="btn-flat toast-action" onclick="window.M.Toast.dismissAll()">No</button>`, displayLength: 8000, classes: `taoster` });
                                                        
                                                        document.querySelector(`#yesBtn`).addEventListener('click', () => {
                                                            window.M.Toast.getInstance(document.querySelector(`.taoster`)).dismiss();
                                                            handleDeletePost(post.id, post.imagePostUrl);
                                                            setTimeout(() => {
                                                                window.M.toast({html: 'delete post success'});
                                                            }, 500);
                                                        }) 
                                                        }}><i className="tiny material-icons">edit</i> delete post</li>
                                                </ul>
                                            </div> ): null

                                        }
                                    </div>
                                </div>
                                <div className="card-image">
                                    {
                                        <>
                                            {
                                              post.imagePostUrl && isEdit === false
                                              ? <img src={imageEditPreview || post.imagePostUrl} className="responsive-img" alt="" />
                                              : null  
                                            }
                                            {
                                                isEdit === true && post.id === editId ? (
                                                    <span>
                                                        <img src={imageEditPreview || post.imagePostUrl || NoImage} className="responsive-img" alt="" />
                                                        <div className="input-field col s3 right">
                                                            <input type="file" hidden id="file" onChange={onImageChange}/>
                                                            <div className="file-path-wrapper">
                                                                <label htmlFor="file">
                                                                    <span style={displayBtnEdit} className="btn-floating btn-small red"><i className="material-icons">edit</i></span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        {
                                                            imageEditPreview ? (
                                                                <div className="progress">
                                                                    <div className="determinate" style={{width: `${progress}%`}}></div>
                                                                </div>
                                                            ) : null
                                                        }
                                                    </span>
                                                ) : null
                                            }
                                        </>
                                    }
                                </div>
                                <div className="card-content">
                                    {
                                        (post.id !== editId) ? (
                                            (word.length > 325) ? <p className="paragraph-font">{lessWord}<span id={`dots-${post.id}`}>...</span><span id={`more-${post.id}`} style={displayMore}>{fulWord}</span></p>
                                            : <p className="paragraph-font">{word}</p>
                                        ) : null
                                    }
                                    {
                                        (post.id !== editId) ? (
                                            (word.length > 325)
                                            ? <i id={`readMore-${post.id}`} className="read-more grey-text text-darken-5" onClick={() => {
                                                const dots = document.getElementById(`dots-${post.id}`);
                                                const moreText = document.getElementById(`more-${post.id}`);
                                                const readMore = document.getElementById(`readMore-${post.id}`);
            
                                                if (dots.style.display === "none") {
                                                    dots.style.display = "inline";
                                                    readMore.innerHTML = "read more"
                                                    moreText.style.display = "none";
                                                } else {
                                                    dots.style.display = "none";
                                                    readMore.innerHTML = "read less";
                                                    moreText.style.display = "inline";
                                                }
                                            }}>read more</i>
                                            : null
                                        ) : null
                                    }
                                    {
                                        isEdit === true && post.id === editId ? (
                                            <>
                                                <div className="row">
                                                    <div className="col s12">
                                                        <div className="input-field col s12">
                                                            <textarea id="content" className="materialize-textarea" value={contentPostEdit} onChange={(e) => setContentPostEdit(e.target.value)} cols="30" rows="10"></textarea>
                                                        </div>
                                                        <button className="btn btn-small" onClick={() => {
                                                            setIsEdit(false);
                                                            setEditId('');
                                                        }}>cancel</button>
                                                        <button className="btn btn-small" onClick={submitEditPost}>save</button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : null
                                    }
                                    {
                                        isLoaded(likes) ? (
                                            (post.likes.find(x => x.userLikeId === userData.uid && x.postId === post.id))
                                            ? <span className="like-show"><p className="font-like"><i className="tiny material-icons circle blue white-text">thumb_up</i> {
                                                (post.likes.length === 1) ? "You" : `You, and ${post.likes.length - 1} other`
                                            }</p></span>
                                            : (post.likes.length >= 1) ? <p className="font-like"><i className="tiny material-icons circle blue white-text">thumb_up</i> {post.likes.length}</p> : null
                                        ) : null
                                    }
                                </div>
                                <div className="card-action">
                                    <form onSubmit={handleSubmitLike}>
                                        {
                                            isLoaded(likes) ? (
                                                (post.likes.find(x => x.userLikeId === userData.uid && x.postId === post.id)) ? (
                                                    <button onClick={() => {
                                                        setLikeId(post.likes.find(x => x.userLikeId === userData.uid && x.postId === post.id).id);
                                                        setPostId('');
                                                    } }><i className="material-icons blue-text">thumb_up</i></button>
                                                ) : (
                                                    <button onClick={() => {
                                                        setPostId(post.id);
                                                        setLikeId('');
                                                    }}><i className="material-icons grey-text">thumb_up</i></button>
                                                )
                                            ) : isEmpty(likes)
                                            ? <button onClick={() => {
                                                setPostId(post.id);
                                                setLikeId('');
                                            }}><i className="material-icons grey-text">thumb_up</i></button> : null
                                            
                                        }
                                    </form>
                                    <button data-target="modalComment" className="modal-trigger" onMouseOver={() => openModalComment(post)}><i className="material-icons grey-text">insert_comment</i></button>
                                </div>
                            </div>
                        )
                    })
                }
                {
                    (isLoaded(posts) && visible < posts.length)
                    ? <button className="btn btn-small blue darken-3 waves-effect waves-light col s12" onClick={loadMore}>Load More</button>
                    : null
                }
            </div>
            <ModalComment postId={modalId} />
        </div>
    )

}

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        likes: state.firestore.ordered.likes
    }
}

const mapDispatchToProps = (dispatch) => ({
    addLike: (data) => dispatch(addLike(data)),
    deleteLike: (data) => dispatch(deleteLike(data)),
    updatePost: (data) => dispatch(updatePost(data)),
    deletePost: (data) => dispatch(deletePost(data))
});

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    firestoreConnect((props) => {
        if(!props.auth.uid) return []
        return [
            { collection: 'likes' }
        ]
    })
)(PostList);