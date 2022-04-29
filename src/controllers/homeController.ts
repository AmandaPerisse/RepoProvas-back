import { Request, Response } from "express";
import { getTestsDisciplines, updateTest } from '../repositories/homeRepository.js';

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
    res.send(testsArray)
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