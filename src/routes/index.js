import { Router } from "express";
import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import trendingHashtagsRouter from "./trendingHashtagsRouter.js";
import postRouter from "./postRouter.js";

const router = Router();
router.use(authRouter);
router.use(userRouter);
router.use(trendingHashtagsRouter);
router.use(postRouter);

export default router;
