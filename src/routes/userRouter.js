import { Router } from "express";
import { getUser, postUser, getUserId, getAllUsers, getUserName } from "../controllers/userController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import userSchema from "../schemas/userSchema.js";

const userRouter = Router();
userRouter.post('/users', validateSchemaMiddleware(userSchema, 422), postUser);
userRouter.get('/users', validateTokenMiddleware, getUser);
userRouter.get('/userid/:id', validateTokenMiddleware, getUserId);
userRouter.get('/allusers', getAllUsers);
userRouter.get('/username/:name', getUserName);
export default userRouter;