import { Router } from "express";
import {
    createPoll,
    voteOnPoll,
    seeResults, 
    editPoll,
    deletePoll,
    getUserPolls,
    viewPoll
} from "../controllers/polls.js";
import { isLoggedin } from "../middlewares/auth.js";

const router = Router();

router.post('/createPoll', isLoggedin, createPoll);
router.get('/all', isLoggedin, getUserPolls);
router.get('/:pollId/results', isLoggedin, seeResults);
router.post('/vote', isLoggedin, voteOnPoll);
router.put('/:pollId/edit', isLoggedin, editPoll);
router.delete('/:pollId/delete', isLoggedin, deletePoll);
router.get("/:pollId/view", isLoggedin, viewPoll);

export default router;
