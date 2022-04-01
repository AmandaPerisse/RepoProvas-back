import { Router } from "express";
import { getPostsAmount } from "../controllers/postsAmountController.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";

const postsAmountRouter = Router();
postsAmountRouter.get('/postamount', validateTokenMiddleware, getPostsAmount);

export default postsAmountRouter;