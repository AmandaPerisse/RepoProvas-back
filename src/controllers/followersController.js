import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { connection } from '../database.js';

export async function unfollow (req, res) {
    const { userId, followerId } = req.params;
    try 
    {
        if (!userId || !followerId)
        {
            return res.sendStatus(400)
        }
        await connection.query(`DELETE FROM followers WHERE "userId" = $1 AND "friendId" = $2`, [userId, followerId]);
    } 
    catch (error) 
    {
        alert('Não foi possível realizar a operação...');
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function follow (req, res) {
    const { userId, followerId } = req.params;
    try
    {
        if (!userId || !followerId)
        {
            return res.sendStatus(400)
        }
        await connection.query(`
        INSERT INTO followers ("userId", "friendId")
        VALUES ($1, $2)
        `, [userId, followerId]);
    }
    catch (error) 
    {
        alert('Não foi possível realizar a operação...');
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function checkIfFollows (req, res) {
    const { userId, followerId } = req.params;
    try
    {
        if (!userId || !followerId)
        {
            return res.sendStatus(400)
        }
        const result = await connection.query(`
        SELECT FROM followers
        WHERE "userId" = $1 AND "friendId" = $2`, [userId, followerId]);
        if (result.rowsCount === 0)
        {
            return res.send(false);
        }
        return res.send(true);
    }
    catch (error) 
    {
        alert('Não foi possível realizar a operação...');
        console.log(error);
        return res.sendStatus(500);
    }   
}