import express from "express";
import { getAllClassesAndSubjects, getAllStudentsAndAttendance, getClasses, getStudentsById, getTeacherOverview, getTeacherStats, updateRecord } from "../controllers/teacher.controller.js";

const teacherRoutes = express.Router();

teacherRoutes.post('/students', getStudentsById);
teacherRoutes.post('/classes', getClasses);
teacherRoutes.post('/getAttendance', getAllStudentsAndAttendance);
teacherRoutes.post('/getAllClassesAndSubjects', getAllClassesAndSubjects);
teacherRoutes.post('/updateDailyAttendance', updateRecord);
teacherRoutes.post('/getTeacherStats', getTeacherStats);
teacherRoutes.post('/getTeacherCount', getTeacherOverview)

export default teacherRoutes;