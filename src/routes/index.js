import { Router } from "express";
import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import postRouter from "./postRouter.js";
import followersRouter from "./followersRouter.js";
import trendingHashtagsRouter from "./trendingHashtagsRouter.js";

const router = Router();
router.use(authRouter);
router.use(userRouter);
router.use(postRouter);
router.use(followersRouter)
router.use(trendingHashtagsRouter);

export default router;
