import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { getExistingUser, createNewSession, createUserObject } from '../repositories/userRepository.js';

export async function login(req, res) {
  const { email, password } = req.body;
  
  const existingUser = await getExistingUser(email);
  
  if (!existingUser) 
    return res.sendStatus(401);
  
  if (bcrypt.compareSync(password, existingUser.password)) {
    const token = uuid();
    await createNewSession(token, existingUser.id);

    return res.send(await createUserObject(token, existingUser.name, existingUser.email, existingUser.pictureUrl));
  }

  res.sendStatus(401);
}