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

export async function getCategories() {
	const categories = await prisma.categories.findMany({});
    return categories;
}

export async function getDisciplines() {
	const disciplines = await prisma.disciplines.findMany({});
    return disciplines;
}

export async function getTeachers() {
	const teachers = await prisma.teachers.findMany({});
    return teachers;
}

export async function getTerms() {
	const terms = await prisma.terms.findMany({});
    return terms;
}

export async function validateUrl(url: string) {
	const test = await prisma.tests.findUnique({
        where: {
            pdfUrl: url,
        },
    });
    return test;
}

export async function getCategory(category: string) {
	const categoryId = await prisma.categories.findUnique({
        where: {
            name: category
        }
    });
    return categoryId;
}

export async function getTerm(term: string) {
	const teacherId = await prisma.terms.findMany({
        where: {
            semester: term
        }
    });
    return teacherId;
}

export async function getDiscipline(discipline: string, term: object) {
    const id =  term[0].id;
	const disciplineId = await prisma.disciplines.findMany({
        where: {
            name: discipline,
            termId: id
        }
    });
    return disciplineId;
}

export async function getTeacher(teacher: string) {
	const teacherId = await prisma.teachers.findMany({
        where: {
            name: teacher
        }
    });
    return teacherId;
}

export async function getTeacherDiscipline(teacher: object, discipline: object) {
    const teacherId = teacher[0].id;
    const disciplineId = discipline[0].id;
	const teacherDiscipline = await prisma.teachersDisciplines.findMany({
        where: {
            disciplineId: disciplineId,
            teacherId: teacherId
        }
    });
    return teacherDiscipline;
}

export async function insertTest(name: string, url: string, categoryId: number, teacherDisciplineId: number) {

    const test = await prisma.tests.create({
        data: {
          name: name,
          pdfUrl: url,
          categoryId: categoryId,
          teacherDisciplineId: teacherDisciplineId
        },
      })

}