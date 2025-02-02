import express from 'express';
import { isLoggedin } from '../middlewares/auth.js';
import { 
    editProfile, 
    updateUsername,
    uploadProfilePic,
    usernameAvailability, 
    getUserProfileDetails,
    getAllActiveSessions
} from '../controllers/profile.js';

const router = express.Router();

router.put('/edit', isLoggedin, editProfile);
router.put('/username', isLoggedin, updateUsername);
router.put('/editProfilePic', isLoggedin, uploadProfilePic);
router.post('/check-username', usernameAvailability);
router.get('/usr/:userId', getUserProfileDetails);
router.get('/allSessions', isLoggedin, getAllActiveSessions);

export default router;
