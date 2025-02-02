import { Router } from "express";
import { loginUser, registerUser, LogoutUser } from "../controllers/auth.js";

const router = Router();


//login and register routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/logout', LogoutUser);

export default router;
