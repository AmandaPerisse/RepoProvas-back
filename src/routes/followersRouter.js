import { Router } from "express";
import { follow, unfollow, checkIfFollows, userFriends } from "../controllers/followersController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import { newDescriptionSchema, postSchema } from "../schemas/postSchemas.js";

const followerRouter = Router();

followerRouter.get('/checkiffollows/:userId/:followerId', checkIfFollows);

followerRouter.post('/follow/:userId/:followerId', follow);

followerRouter.delete('/unfollow/:userId/:followerId', unfollow);

followerRouter.get('/userfriends/:id', userFriends);

export default followerRouter;