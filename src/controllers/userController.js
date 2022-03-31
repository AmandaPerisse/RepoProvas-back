import { getExistingUser, createUser } from '../repositories/userRepository.js';

export async function postUser(req, res) {
  const user = req.body;

  try {
    const isThereUser = await getExistingUser(user.email);
    if (isThereUser)
      return res.sendStatus(409);

    await createUser(user.name, user.email, user.password, user.pictureUrl);

    res.sendStatus(201);

  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getUser(req, res) {
  const { user } = res.locals;

  try {
    res.send(user);
    
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}