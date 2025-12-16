import express from "express";
import { fetchStudentAttendance ,fetchStudentSubjects } from "../controllers/student.controller.js";

const studentRoutes = express.Router();

studentRoutes.post('/fetch-attendance', fetchStudentAttendance);
studentRoutes.post('/fetch-subjects', fetchStudentSubjects);


export default studentRoutes;