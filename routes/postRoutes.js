import { Router } from "express";
import { 
    createPost,
    deletePost,
    addLike,
    dislikePost,
    getAllLikes,
    addComment,
    editComment,
    deleteComment,
    getAllComments,
    getPostDetails,
    getPostsByCategory,
    getTrendingPosts
} from '../controllers/posts.js';
import { isLoggedin } from "../middlewares/auth.js";

const router = Router();

// Post routes
router.post('/createPost', isLoggedin, createPost); 
router.delete('/deletePost', isLoggedin, deletePost); 

// Like routes
router.post('/:postId/like', isLoggedin, addLike); 
router.post('/:postId/dislike', isLoggedin, dislikePost); 
router.get('/:postId/likes', getAllLikes); 

// Comment routes
router.post('/:postId/comment', isLoggedin, addComment); 
router.put('/editComment', isLoggedin, editComment); 
router.delete('/:commentId/deleteComment', isLoggedin, deleteComment); 
router.get('/:postId/comments', getAllComments); 

// Get post details
router.get('/:postId', getPostDetails);

// Get posts by category
router.get('/category/:categoryId', getPostsByCategory); 
router.get('/category/:categoryId/trending', getTrendingPosts); 

export default router;
