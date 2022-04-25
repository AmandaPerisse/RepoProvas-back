import { Router } from "express";
import loginRouter from "./loginRouter.js";
import signupRouter from "./signupRouter.js";
import logoutRouter from "./logoutRouter.js";
import homeRouter from "./homeRouter.js";

const router = Router();
router.use(signupRouter);
router.use(loginRouter);
router.use(logoutRouter);
router.use(homeRouter);

export default router;
