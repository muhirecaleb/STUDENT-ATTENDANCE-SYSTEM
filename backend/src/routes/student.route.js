import express from "express";
import {
  fetchStudentAttendance,
  fetchStudentSubjects,
  getStudentOverview,
  getStudentMonthlyAttendance,
  getStudentAttendanceYears,
} from "../controllers/student.controller.js";

const studentRoutes = express.Router();

studentRoutes.post("/fetch-attendance", fetchStudentAttendance);
studentRoutes.post("/fetch-subjects", fetchStudentSubjects);
studentRoutes.post("/get-overview", getStudentOverview);
studentRoutes.post("/get-monthly-attendance", getStudentMonthlyAttendance);
studentRoutes.post("/get-attendance-years", getStudentAttendanceYears);

export default studentRoutes;
