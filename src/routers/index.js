import { Router } from "express";
import { prisma } from "../database.js";

const router = Router();

/*await prisma.users.create({
	data: {
		email: "banana@email.com",
		password: "super_senha_do_banana"
	}
});*/

export default router;
