import { Request, Response } from "express";
import { getTestsDisciplines, updateTest, getCategories, 
    getDisciplines, getTeachers, getTerms, getCategory, getDiscipline,
    getTeacher, getTerm, getTeacherDiscipline, insertTest, validateUrl } from '../repositories/homeRepository.js';

export async function testsDisciplines(req: Request, res: Response){
    const tests = await getTestsDisciplines();
    let testsArray = [];

    for(let i = 0; i<tests.length;i++){
        let thisTest = [];
        thisTest.push(tests[i]);
        const test = {
            disciplineName: thisTest.map(value => ({
                name: value.teachersDisciplines.disciplines.name
            })),
            complement: thisTest.map(value => ({
                name: value.name,
                category: value.categories.name,
                teacher: value.teachersDisciplines.teachers.name,
                semester: value.teachersDisciplines.disciplines.terms.semester,
                url: value.pdfUrl,
                views: value.views
            }))
            
        }
        testsArray.push(test);
    }     
    res.send(testsArray);
}

export async function setViews(req: Request, res: Response){
    const { url } = req.body;
    const test = await updateTest(url);
    if(test){
        res.send(test);
    }
    else{
        res.sendStatus(404);
    }
}

export async function getAllData(req: Request, res: Response){

    const categories = await getCategories();
    const disciplines = await getDisciplines();
    const teachers = await getTeachers();
    const terms = await getTerms();
     
    res.send({categories, disciplines, teachers, terms});
}

export async function testRegister(req: Request, res: Response){

    const { name, pdf, category, discipline, teacher, term } = req.body;
    const test = await validateUrl(pdf);

    if(!test){
        const categoryObject = await getCategory(category);

        const termObject = await getTerm(term);

        const disciplineObject = await getDiscipline(discipline, termObject);

        const teacherObject = await getTeacher(teacher);

        const categoryId = categoryObject.id;
        const teacherDisciplineObject = await getTeacherDiscipline(teacherObject, disciplineObject);

        const teacherDisciplineId = teacherDisciplineObject[0].id;

        const newTest = await insertTest(name, pdf, categoryId, teacherDisciplineId);

        res.send(newTest);
    }
    else{
        res.sendStatus(409);
    }
}