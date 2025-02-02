import prisma from "../db/prisma/db.js";
import {videoUploader} from '../utils/videoUpload.js';
import {uploadImage} from '../utils/imageUpload.js';

//creating the post
export const createPost = async (req, res) => {
    const { description, categoryId } = req.body;
    const { filesToUpload } = req.files;

    let uploadedFile = null;

    if (filesToUpload) {
        const fileExtension = filesToUpload.mimetype.split('/')[1];

        if (fileExtension === 'mp4') {
            uploadedFile = await videoUploader(filesToUpload, "video_uploads");
        } else if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
            uploadedFile = await uploadImage(filesToUpload, "image_uploads", 1000, 1000, 80);
        }
    }

    const userId = req.user.id;

    try {
        const postData = {
            user_id: userId,
            category_id: parseInt(categoryId),
            description: description,
        };

        if (uploadedFile) {
            postData.upload_file = uploadedFile.secure_url;
        }

        const post = await prisma.post.create({
            data: postData,
        });

        return res.status(200).json({
            success: true,
            message: "Post has been created successfully",
            postId: post.post_id,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const deletePost = async (req, res) => {
    const { postId } = req.body;
    const userId = req.user.id;

    const toDeletePost = await prisma.post.findUnique({
        where: {
            post_id: parseInt(postId),
        },
    });

    if (!toDeletePost) {
        return res.status(404).json({
            success: false,
            message: "Post not found",
        });
    }

    if (toDeletePost.user_id !== userId) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to delete this post",
        });
    }

    if (toDeletePost.upload_file) {
        await cloudinary.uploader.destroy(toDeletePost.upload_file);
    }

    await prisma.post.delete({
        where: {
            post_id: parseInt(postId),
        },
    });

    return res.status(200).json({
        success: true,
        message: "Post has been deleted successfully",
    });
};


//adding the like to the post
export const   addLike = async(req,res)=> {
    const postId = req.params.postId;
    const userId = req.user.id;


    try{


        //this way redices the time or the db while fetching the totalLikes on the post.
        //when we wanted to see who liked on the post, we can fetches the likes db.
        const exsistingLike = await prisma.like.findUnique({
            where:{
                user_id_post_id: {
                    user_id: userId,
                    post_id: parseInt(postId)
                }
            }
        })

        if(exsistingLike){
            return res.status(400).json({
                success: false,
                message: "You have already liked this post"
            })
        }

        await prisma.like.create({
            data:{
                user_id: userId,
                post_id: parseInt(postId)
            }
        })
        await prisma.post.update({
            where:{
                post_id: parseInt(postId)
            },
            data:{
                like_count: { increment: 1 }
            }
        })

        return res.status(200).json({
            success: true,
            message: "Post has been liked successfully",
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

//checking the user_like and removing it
export const dislikePost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;


    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                user_id_post_id: {
                    user_id: userId,
                    post_id: parseInt(postId),
                }
            }
        });
        
        if (!existingLike) {
            return res.status(400).json({
                success: false,
                message: "You haven't liked this post yet."
            });
        }

        await prisma.like.delete({
            where: {
                user_id_post_id: {
                    user_id: userId,
                    post_id: parseInt(postId),
                }
            }
        });

        await prisma.post.update({
            where: { post_id: parseInt(postId) },
            data: { like_count: { decrement: 1 } }
        });

        return res.status(200).json({
            success: true,
            message: "Post has been disliked successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

//show all the likes
export const getAllLikes = async (req, res) => {
    const postId = parseInt(req.params.postId); 

    try {
        const post = await prisma.post.findUnique({
            where: {
                post_id: postId,
            },
            select: {
                like_count: true, 
            },
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if (post.like_count === 0) {
            return res.status(404).json({
                success: false,
                message: "No likes are found for this post",
            });
        }

        const likes = await prisma.like.findMany({
            where: {
                post_id: postId,
            },
            include: {
                User: {
                    select: {
                        user_id: true,
                        username: true,
                        profilePic: true,
                    },
                },
            },
        });

        if (!likes || likes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No likes found for this post",
            });
        }

        return res.status(200).json({
            success: true,
            message: "All likes fetched successfully",
            likes: likes,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// Add comment
export const addComment = async (req, res) => {
    const { content } = req.body;
    const postId = req.params.postId;
    const userId = req.user.id;

    if (!content) {
        return res.status(400).json({
            success: false,
            message: "Content is required"
        });
    }

    try {
        const existingComment = await prisma.comment.findFirst({
            where: {
                post_id: parseInt(postId),
                user_id: userId
            }
        });

        if (existingComment) {
            return res.status(400).json({
                success: false,
                message: "You have already commented on this post"
            });
        }

        const comment = await prisma.comment.create({
            data: {
                post_id: parseInt(postId),
                user_id: userId,
                content: content
            }
        });

        await prisma.post.update({
            where: {
                post_id: parseInt(postId),
            },
            data: {
                comment_count: { increment: 1 }
            }
        });

        return res.status(200).json({
            success: true,
            message: "Comment has been added successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Edit comment
export const editComment = async (req, res) => {
    const { commentId, content } = req.body;
    const userId = req.user.id;

    if (!content) {
        return res.status(400).json({
            success: false,
            message: "Content is required"
        });
    }

    try {
        const existingComment = await prisma.comment.findUnique({
            where: { comment_id: parseInt(commentId) }
        });

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        if (existingComment.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this comment"
            });
        }

        const updatedComment = await prisma.comment.update({
            where: { comment_id: parseInt(commentId) },
            data: { content: content }
        });

        return res.status(200).json({
            success: true,
            message: "Comment has been updated successfully",
            comment: updatedComment
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete comment
export const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;

    try {
        const existingComment = await prisma.comment.findUnique({
            where: { comment_id: parseInt(commentId) }
        });

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        if (existingComment.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this comment"
            });
        }

        const postId = existingComment.post_id; 

        await prisma.comment.delete({
            where: { comment_id: parseInt(commentId) }
        });

        await prisma.post.update({
            where: { post_id: postId },
            data: { comment_count: { decrement: 1 } }
        });

        return res.status(200).json({
            success: true,
            message: "Comment has been deleted successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get all comments
export const getAllComments = async (req, res) => {
    const postId = req.params.postId;

    try {
        const comments = await prisma.comment.findMany({
            where: {
                post_id: parseInt(postId),
            },
            include: {
                User: {
                    select: {
                        user_id: true,
                        username: true,
                        profilePic: true,
                    },
                },
            },
        });

        if (!comments || comments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No comments found for this post",
            });
        }

        return res.status(200).json({
            success: true,
            message: "All comments fetched successfully",
            comments: comments,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const getPostDetails = async (req, res) => {
    const postId = req.params.postId;
    const commentLimit = 5;  
    const likeLimit = 3;     

    try {
        const postInfo = await prisma.post.findUnique({
            where: {
                post_id: parseInt(postId),
            },
            select: {
                post_id: true,
                description: true,
                upload_file: true,
                created_at: true,
                like_count: true,
                comment_count: true,
                User: {
                    select: {
                        user_id: true,
                        username: true,
                        profilePic: true,
                    },
                },
                Category: {
                    select: {
                        category_name: true, 
                    },
                },
                comments: {
                    take: commentLimit,
                    select: {
                        comment_id: true,
                        content: true,
                        created_at: true,
                        User: {
                            select: {
                                user_id: true,
                                username: true,
                                profilePic: true,
                            },
                        },
                    },
                },
                Likes: {
                    take: likeLimit,
                    select: {
                        user_id: true
                    },
                },
                _count: {
                    select: {
                        Likes: true,
                        comments: true
                    }
                }
            },
        });

        if (!postInfo) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Post details fetched successfully",
            postInfo: postInfo, 
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

//getting the posts by category (normal method with : date)
export const getPostsByCategory = async(req,res)=> {
    const categoryId = req.params.categoryId;
    
    try{
        const posts = await prisma.post.findMany({
            where:{
                category_id: parseInt(categoryId),
            },
            select: {
                post_id: true,
                description: true,
                upload_file: true,
                like_count: true,
                comment_count: true,
                created_at: true,
                User: {
                    select: {
                        user_id: true,
                        username: true,
                        profilePic: true,
                    },
                },
                Category: true,
            },
            orderBy: {
                created_at: "desc"
            }
        });

        if (!posts || posts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No posts found in this category",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Posts fetched successfully",
            posts: posts
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

//getting the posts by category (trending: max(likes+comments))
export const getTrendingPosts = async (req, res) => {
    const categoryId = parseInt(req.params.categoryId);

    try {
        const posts = await prisma.post.findMany({
            where: {
                category_id: categoryId
            },
            orderBy: [
                {
                    like_count: "desc", 
                },
                {
                    comment_count: "desc",
                }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Trending posts fetched successfully",
            posts: posts
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

