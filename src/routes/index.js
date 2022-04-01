import { Router } from "express";
import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import postRouter from "./postRouter.js";
import followerRouter from "./followersRouter.js";
import trendingHashtagsRouter from "./trendingHashtagsRouter.js";
import commentsRouter from "./commentsRouter.js";
import postsAmountRouter from "./postsAmountRouter.js";

const router = Router();
router.use(authRouter);
router.use(userRouter);
router.use(postRouter);
router.use(followerRouter)
router.use(trendingHashtagsRouter);
router.use(commentsRouter);
router.use(postsAmountRouter);

export default router;
