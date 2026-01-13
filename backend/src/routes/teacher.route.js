import express from "express";
import {
  getAllClassesAndSubjects,
  getStudentsAttendanceForDay,
  getClasses,
  getStudentsById,
  getTeacherOverview,
  getTeacherStats,
  submitAttendance,
} from "../controllers/teacher.controller.js";

const teacherRoutes = express.Router();

teacherRoutes.post("/students", getStudentsById);
teacherRoutes.post("/classes", getClasses);
teacherRoutes.post("/getAttendance", getStudentsAttendanceForDay);
teacherRoutes.post("/getAllClassesAndSubjects", getAllClassesAndSubjects);
teacherRoutes.post("/submitAttendance", submitAttendance);
teacherRoutes.post("/getTeacherStats", getTeacherStats);
teacherRoutes.post("/getTeacherCount", getTeacherOverview);

export default teacherRoutes;
