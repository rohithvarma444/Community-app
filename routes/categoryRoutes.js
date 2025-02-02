import { Router } from "express";
import { createCategory, getAllCategories } from "../controllers/category.js";

const router = Router();

router.post('/createCategory', createCategory);
router.get('/getCategories', getAllCategories);


export default router;
