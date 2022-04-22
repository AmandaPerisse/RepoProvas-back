import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import { createUser, validateUser } from '../repositories/authRepository.js';

export async function create(req: Request, res: Response){

    const { email, password } = req.body;
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await validateUser(email);
    if(user){
        res.sendStatus(409);
    }
    else{
        await createUser(email, passwordHash);
        res.sendStatus(201);
    }
}