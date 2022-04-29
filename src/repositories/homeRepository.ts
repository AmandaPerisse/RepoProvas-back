import { prisma } from "../database.js";

export async function getTestsDisciplines() {
	const tests = await prisma.tests.findMany({
        select: {
            name: true,
            pdfUrl: true,
            views: true,
            categories: {
                select: {
                    name: true,
                }
            },
            teachersDisciplines: {
                select: {
                    teachers: {
                        select: {
                            name: true
                        }
                    },
                    disciplines: {
                        select: {
                            name: true,
                            terms: {
                                select: {
                                    semester: true
                                }
                            }
                        }
                    }
                },
            },
        },
    });
    return tests;
}

export async function updateTest(url: string) {
	const test = await prisma.tests.update({
        where: {
            pdfUrl: url,
        },
        data:{
            views: {
                increment: 1,
            }
        }
    })
    return test;
}