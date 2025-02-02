import { Router } from "express";
import { loginUser, registerUser, logoutUser, logoutSession } from "../controllers/auth.js";
import { isLoggedin } from "../middlewares/auth.js";

const router = Router();


//login and register routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/logout', logoutUser);
router.post('/logoutSession', isLoggedin, logoutSession);

export default router;
