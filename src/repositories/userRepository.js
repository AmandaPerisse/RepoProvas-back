import { connection } from '../database.js';
import bcrypt from 'bcrypt';

export async function getExistingUser(email) {
	const getUserQuery = await connection.query('SELECT * FROM users WHERE email=$1', [email]);
  return getUserQuery.rows[0];
}

export async function createNewSession(token, userId) {
	return await connection.query('INSERT INTO sessions (token, "userId") VALUES ($1, $2)', [token, userId]);
}

export async function createUserObject(token, userName, email, pictureUrl) {
	return { token, user: { userName, email, pictureUrl } };
}

export async function createUser(name, email, password, pictureUrl) {
	const passwordHash = bcrypt.hashSync(password, 10);
    return await connection.query(`
      INSERT INTO 
        users ("name", email, password, "pictureUrl")
      VALUES ($1, $2, $3, $4)
    `, [name, email, passwordHash, pictureUrl])
}