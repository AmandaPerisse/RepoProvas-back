import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { connection } from '../database.js';

export async function login(req, res) {
  const { email, password } = req.body;

  const { rows: [user] } = await connection.query('SELECT * FROM users WHERE email=$1', [email])
  if (!user) {
    return res.sendStatus(401);
  }

  if (bcrypt.compareSync(password, user.password)) {
    const token = uuid();
    await connection.query('INSERT INTO sessions (token, "userId") VALUES ($1, $2)', [token, user.id])
    
    return res.send({
      token: token,
      user: {
        username: user.username,
        email: user.email,
        pictureUrl: user.pictureurl
      }
    });
  }

  res.sendStatus(401);
}

