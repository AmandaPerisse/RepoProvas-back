import { Router } from "express";
import { getTrendingHashtags } from "../controllers/trendingHashtagsController.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";

const trendingHashtagsRouter = Router();
trendingHashtagsRouter.get('/timeline', getTrendingHashtags);
export default trendingHashtagsRouter;