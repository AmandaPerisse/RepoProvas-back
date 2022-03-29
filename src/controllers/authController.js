import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { getExistingUser, createNewSession, createUserObject } from '../repositories/userRepository.js';

export async function login(req, res) {
  const { email, password } = req.body;
  
  const { rows: [user] } = await getExistingUser(email);
  
  if (!user) {
    return res.sendStatus(401);
  }

  if (bcrypt.compareSync(password, user.password)) {
    const token = uuid();
    await createNewSession(token, user.id);

    return res.send(await createUserObject(token, user.name, user.email, user.pictureUrl));
  }

  res.sendStatus(401);
}