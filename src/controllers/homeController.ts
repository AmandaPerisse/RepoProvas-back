import { Request, Response } from "express";
import { getTestsDisciplines } from '../repositories/homeRepository.js';

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
                semester: value.teachersDisciplines.disciplines.terms.semester
            }))
            
        }
        testsArray.push(test);
    }     
    res.send(testsArray)
}