import prisma from "../db/prisma/db.js";
import { uploadImage } from "../utils/imageUpload.js";

export const editProfile = async (req, res) => {
    try {
        const { bio, mobileNumber } = req.body;
        const userId = req.user.id;

        const updatedUser = await prisma.user.update({
            where: { user_id: userId },
            data: { bio, mobileNumber },
            select: { 
                user_id: true, 
                username: true, 
                email: true, 
                bio: true, 
                mobileNumber: true, 
                profilePic: true 
            },
        });

        return res.status(200).json({
            success: true,
            message: "Profile has been updated successfully",
            userInfo: updatedUser,
        });
    } catch (error) {
        console.error(`Error in ${req.method} ${req.originalUrl}: `, error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update Username
export const updateUsername = async (req, res) => {
    try {
        const { username } = req.body;
        const userId = req.user.id;

        if (!username) {
            return res.status(400).json({ success: false, message: "Username cannot be empty" });
        }

        const usernameTaken = await prisma.user.findUnique({
            where: { username },
            select: { user_id: true },
        });

        if (usernameTaken) {
            return res.status(400).json({ success: false, message: "Username is already taken" });
        }

        const updatedUser = await prisma.user.update({
            where: { user_id: userId },
            data: { username },
            select: { user_id: true, username: true },
        });

        return res.status(200).json({
            success: true,
            message: "Username updated successfully",
            userInfo: updatedUser,
        });
    } catch (error) {
        console.error(`Error in ${req.method} ${req.originalUrl}: `, error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Upload Profile Picture
export const uploadProfilePic = async (req, res) => {
    try {
        const { profilePic } = req.files;
        const userId = req.user.id;

        if (!profilePic) {
            return res.status(400).json({ success: false, message: "No profile picture provided" });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(profilePic.mimetype)) {
            return res.status(400).json({ success: false, message: "Invalid file type. Only JPEG, PNG, and GIF are allowed." });
        }

        const uploadedPic = await uploadImage(profilePic, "image_uploads", 100, 100, 80);
        
        const updatedUser = await prisma.user.update({
            where: { user_id: userId },
            data: { profilePic: uploadedPic.secure_url },
            select: { user_id: true, profilePic: true },
        });

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            userInfo: updatedUser,
        });
    } catch (error) {
        console.error(`Error in ${req.method} ${req.originalUrl}: `, error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Check Username Availability
export const usernameAvailability = async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username || username.length < 3 || username.length > 20) {
            return res.status(400).json({ success: false, message: "Username should be between 3 and 20 characters" });
        }

        const isTaken = await prisma.user.findUnique({
            where: { username },
            select: { user_id: true }
        });

        return res.status(200).json({
            success: !isTaken,
            message: isTaken ? "Username is not available" : "Username is available"
        });
    } catch (error) {
        console.error(`Error in ${req.method} ${req.originalUrl}: `, error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get User Profile Details
export const getUserProfileDetails = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await prisma.user.findUnique({
            where: { user_id: parseInt(userId) },
            select: {
                user_id: true,
                username: true,
                email: true,
                bio: true,
                mobileNumber: true,
                profilePic: true,
                Posts: { select: { post_id: true, description: true, upload_file: true } },
                Polls: { select: { poll_id: true, poll_title: true } },
            },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "User profile details fetched successfully",
            userInfo: user,
        });

    } catch (error) {
        console.error(`Error in ${req.method} ${req.originalUrl}: `, error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get All Active Sessions
export const getAllActiveSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("check here");
        console.log(userId);

        const allActiveSessions = await prisma.session.findMany({
            where: { user_id: parseInt(userId) }
        });

        return res.status(200).json({
            success: true,
            message: "All active sessions fetched successfully",
            allActiveSessions: allActiveSessions
        });
    } catch (error) {
        console.error(`Error in ${req.method} ${req.originalUrl}: `, error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
