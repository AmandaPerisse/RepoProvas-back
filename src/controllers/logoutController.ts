import { Request, Response } from "express";
import { deleteSession, validateSession } from '../repositories/authRepository.js';

export async function logout(req: Request, res: Response){

  const session = await validateSession(req.body.token)
  if(session){
    await deleteSession(req.body.token);
  }
  res.sendStatus(202);
}