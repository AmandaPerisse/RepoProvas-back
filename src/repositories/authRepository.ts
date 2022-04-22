import { prisma } from "../database.js";

export async function validateUser(email: string) {
	const user = prisma.users.findUnique({
        where: {
            email: email,
        }
    });
    return user;
}
export async function createUser(email: string, password: string) {
	const getUserQuery = await prisma.users.create({
        data: {
            email: email,
            password: password
        }
    });
}
export async function createNewSession(token: string, id: number) {
	const getUserQuery = await prisma.sessions.create({
        data: {
            token: token,
            userId: id
        }
    });
}
export async function validateSession(token: string) {
	const session = prisma.sessions.findUnique({
        where: {
            token: token,
        }
    });
    return session;
}
export async function deleteSession(token: string) {
	return await prisma.sessions.delete({
        where: {
            token: token,
        },
      })
}