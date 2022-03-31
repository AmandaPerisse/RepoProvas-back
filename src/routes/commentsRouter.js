import { Router } from "express";
import { getComments, postComment } from "../controllers/commentsControlle.js";
import { getUser, postUser } from "../controllers/userController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import { commentSchema } from "../schemas/commentSchems.js";

const commentsRouter = Router();
commentsRouter.post('/comments', validateSchemaMiddleware(commentSchema, 422), validateTokenMiddleware, postComment);
commentsRouter.get('/comments/:postId', validateTokenMiddleware, getComments);
export default commentsRouter;