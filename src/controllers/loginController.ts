import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createNewSession, validateUser } from '../repositories/authRepository.js';

dotenv.config();

export async function login(req: Request, res: Response){

    const { email, password } = req.body;
    const user = await validateUser(email);
    if (!user){
      return res.sendStatus(404);
    }
    else if (bcrypt.compareSync(password, user.password)) {
        const secretKey = process.env.JWT_SECRET;
        const token = jwt.sign(req.body, secretKey);
        await createNewSession(token, user.id);
        res.send({ token: token, user: user.id });
    }
    else{
      return res.sendStatus(401);
    }
}