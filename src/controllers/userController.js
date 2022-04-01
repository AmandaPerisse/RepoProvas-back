import { connection } from '../database.js';
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

export async function getUserId(req, res) {
  const { id } = req.params;
  try {
    const result = await connection.query(`SELECT * FROM users WHERE id=$1`, [id])
    if (result.rowCount === 0) {
      return res.sendStatus(400);
    }
    res.send(result.rows);
  }
  catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getAllUsers(req, res) {
  try {
    let result = await connection.query(`SELECT * FROM users`);
    if (result.rowCount === 0) {
      return res.sendStatus(400);
    }
    res.send(result.rows);
  }
  catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }

}

export async function getUserName(req, res) {
  const { name } = req.params
  try {
    let result = await connection.query(`SELECT * FROM users WHERE name = $1`, [name]);
    if (result.rowCount === 0) {
      return res.sendStatus(400);
    }
    res.send(result.rows);
  }
  catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}