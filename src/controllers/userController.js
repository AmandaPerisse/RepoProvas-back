import bcrypt from 'bcrypt';
import { connection } from '../database.js';

export async function postUser(req, res) {
  const user = req.body;

  try {
    const isThereUser = await connection.query('SELECT * FROM users WHERE email=$1', [user.email])
    if (isThereUser.rowCount !== 0) {
      return res.sendStatus(409);
    }

    const passwordHash = bcrypt.hashSync(user.password, 10);
    await connection.query(`
      INSERT INTO 
        users (username, email, password, pictureUrl) 
      VALUES ($1, $2, $3, $4)
    `, [user.username, user.email, passwordHash, user.pictureUrl])

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}
