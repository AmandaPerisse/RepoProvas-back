import { connection } from '../database.js';

export async function getExistingUser(email) {
	return await connection.query('SELECT * FROM users WHERE email=$1', [email]);
}

export async function createNewSession(token, userId) {
	return await connection.query('INSERT INTO sessions (token, "userId") VALUES ($1, $2)', [token, userId]);
}

export async function createUserObject(token, userName, email, pictureUrl) {
	return { token, user: { userName, email, pictureUrl } };
}