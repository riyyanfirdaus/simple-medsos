import React, { useState } from 'react';
import { connect } from 'react-redux';
import { addComment } from '../../config/redux/actions/appAction';
import { compose } from 'redux';
import { firestoreConnect } from 'react-redux-firebase';
import moment from 'moment';

const ModalComment = (props) => {
    const [comment, setComment] = useState('');

    const handleChange = (e) => {
        setComment(e.target.value);
    }

    const {comments} = props;
    const {postId} = props;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            comment: comment,
            postId: postId
        }
        const res = await props.addComment(data).catch(err => err);
        if(res) {
            setComment('');
            console.log('add comment success');
        } else {
            console.log('add comment failed');
        }
    }


    return (
        <div>
            <div id="modalComment" className="modal modal-comment modal-fixed-footer">
                <div className="modal-content">
                    <ul className="collection">
                        {
                            comments && comments.map(comment => {
                                if(comment.postId === postId) {
                                    return (
                                        <li className="collection-item avatar grey lighten-4" key={comment.id}>
                                            <img src={comment.authorPhoto} className="circle" alt=""/>
                                            <span className="grey-text text-darken-4">{comment.authorName}</span>
                                            <p className="comment-text grey-text text-darken-2">{comment.content}</p>
                                            <span className=" comment-text-time grey-text text-darken-1 right">{moment(comment.createdAt.toDate()).calendar()}</span>
                                        </li>
                                    )
                                } else {
                                    return null;
                                }
                            })
                        }
                    </ul>
                </div>
                <div className="modal-footer">
                    <div className="row">
                        <form onSubmit={handleSubmit}>
                            <div className="col s9 m10">
                                <input type="text" className="validate" autoFocus placeholder="ketik disini" value={comment} onChange={handleChange} />
                            </div>
                            <div className="col s1 m2">
                                <button className="blue darken-3 waves-effect waves-light btn"><i className="material-icons">send</i></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        comments: state.firestore.ordered.comments
    }
}

const mapDispatchToProps = (dispatch) => ({
    addComment: (data) => dispatch(addComment(data))
});

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    firestoreConnect((props) => {
        if(!props.auth.uid) return []
        return [
            {collection: 'comments', orderBy: ['createdAt']}
        ]
    })
)(ModalComment);