import { firestore, storage } from '../../firebase/fbConfig';

export const createPost = (post) => (dispatch, getState) => {
    const profile = getState().firebase.profile;
    const authorId = getState().firebase.auth.uid;
    return new Promise((resolve, reject) => {
        firestore.collection('posts').add({
            content: post.content,
            imagePostUrl: post.imagePostUrl,
            authorFirstName: profile.firstName,
            authorLastName: profile.lastName,
            authorPhotoUrl: profile.photoUrl,
            authorId: authorId,
            createdAt: new Date()
        }).then((res) => {
            dispatch({ type: 'CREATE_POST', post });
            resolve(res);
        }).catch((err) => {
            dispatch({ type: 'CREATE_POST_ERROR', err });
            reject(false);
        })
    });

}

export const updatePost = (post) => (dispatch) => {
    return new Promise((resolve, reject) => {
        firestore.collection('posts').doc(post.editId).update({
            content: post.contentPostEdit,
            imagePostUrl: post.imagePostUrl,
            lastUpdate: new Date()
        }).then(res => {
            window.M.toast({html: `<span>Success Update Post</span>`});
            resolve(res);
        }).catch(err => {
            window.M.toast({html: `<span>Failed Update Post</span>`});
            reject(false);
        })
    });
}

export const deletePost = (dataDelete) => (dispatch) => {
    const deletePostDoc = firestore.collection("posts").doc(dataDelete.postId).delete();
    const fileDelete = (dataDelete.imagePostUrl) ? storage.refFromURL(dataDelete.imagePostUrl).delete() : deletePostDoc;
    return new Promise((resolve, reject) => {
        fileDelete.then(() => {
            firestore.collection("likes").where("postId", "==", dataDelete.postId)
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(like) {
                    if(like.id) {
                        firestore.collection("likes").doc(like.id).delete();
                    }
                })
            })

            firestore.collection("comments").where("postId", "==", dataDelete.postId)
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(comment) {
                    if(comment.id) {
                        firestore.collection("comments").doc(comment.id).delete();
                    }
                })
            })

            if(dataDelete.imagePostUrl) {
                firestore.collection("posts").doc(dataDelete.postId).delete()
                .then(res => {
                    console.log('success', res);
                    resolve(res);
                })
                .catch(err => reject(false))
            }
        }).catch(err => err);
    });
}

export const addLike = (postId) => (dispatch, getState) => {
    const likeId = getState().firebase.auth.uid;
    return new Promise((resolve, reject) => [
        firestore.collection('likes').add({
            postId: postId,
            userLikeId: likeId,
            createdAt: new Date()
        }).then(res => {
            dispatch({ type: 'ADD_LIKE', postId });
            resolve(res);
        }).catch(err => {
            dispatch({ type: 'ADD_LIKE_ERROR', err });
            reject(false);
        })
    ]);
}

export const deleteLike = (likeId) => (dispatch) => {
    return new Promise((resolve, reject) => {
        firestore.collection('likes').doc(likeId).delete()
        .then(res => {
            dispatch({ type: 'DELETE_LIKE' });
        }).catch(err => {
            dispatch({ type: 'DELETE_LIKE_ERROR', err });
            reject(false);
        })
    });
}

export const addComment = (data) => (dispatch, getState) => {
    const authUserId = getState().firebase.auth.uid;
    const profile = getState().firebase.profile;
    return new Promise((resolve, reject) => [
        firestore.collection('comments').add({
            postId: data.postId,
            authorCommentId: authUserId,
            authorName: `${profile.firstName} ${profile.lastName}`,
            authorPhoto: profile.photoUrl,
            content: data.comment,
            createdAt: new Date()
        }).then(res => {
            dispatch({ type: 'ADD_COMMENT', data });
            resolve(res);
        }).catch(err => {
            dispatch({ type: 'ADD_COMMENT_ERROR', err });
            reject(false);
        })
    ]);
}

export const editProfile = (profile) => (dispatch, getState) => {
    const authUserId = getState().firebase.auth.uid;
    console.log(profile);
    return new Promise((resolve, reject) => {
        firestore.collection('users').doc(authUserId).update({
            firstName: profile.firstName,
            lastName: profile.lastName,
            photoUrl: profile.photoUrl,
            photoBgUrl: profile.photoBgUrl,
            lastUpdate: new Date()
        }).then(() => {
            firestore.collection("posts").where("authorId", "==", authUserId)
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    if(doc.id) {
                        firestore.collection("posts").doc(doc.id)
                        .update({
                            authorPhotoUrl: profile.photoUrl
                        });
                    }
                    firestore.collection("comments").where("postId", "==", doc.id)
                    .get()
                    .then(function(querySnapshot) {
                        querySnapshot.forEach(function(comment) {
                            if(comment.id) {
                                firestore.collection("comments").doc(comment.id)
                                .update({
                                    authorPhoto: profile.photoUrl
                                });
                            }
                        })
                    })
                });
            })
            .catch(function(error) {
                console.log("Error getting documents: ", error);
            });
        }).then(res => {
            dispatch({ type: 'EDIT_USER' });
            resolve(res);
        }).catch(err => {
            dispatch({ type: 'EDIT_USER_ERROR', err });
            reject(false);
        })
    });
}