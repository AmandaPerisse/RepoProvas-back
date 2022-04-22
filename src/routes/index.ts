import { Router } from "express";
import loginRouter from "./loginRouter.js";
import signupRouter from "./signupRouter.js";
import logoutRouter from "./logoutRouter.js";

const router = Router();
router.use(signupRouter);
router.use(loginRouter);
router.use(logoutRouter);

export default router;
