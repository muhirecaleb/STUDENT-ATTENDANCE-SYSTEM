import express from "express";
import {
  addClass,
  addStudent,
  addTeacher,
  adminLogin,
  getAllClasses,
  getAllClassesById,
  getAllTeachers,
  getClassesAndSubjects,
  getStudentsByClass,
  updateTeacher,
  updateClass,
  updateStudent,
  deleteClass,
  deleteTeacher,
  deleteStudent,
  getMonthlyAttendance,
  getCounts,
  getClasses,
} from "../controllers/admin.controller.js";

const adminRoutes = express.Router();

adminRoutes.post("/login", adminLogin);
adminRoutes.post("/add-student", addStudent);
adminRoutes.post("/add-class", addClass);
adminRoutes.post("/getStudentsByClass", getStudentsByClass);
adminRoutes.post("/add-teacher", addTeacher);
adminRoutes.post("/updateTeacher", updateTeacher);
adminRoutes.post("/updateClass", updateClass);
adminRoutes.post("/updateStudent", updateStudent);
adminRoutes.post("/getMonthlyAttendance", getMonthlyAttendance);

adminRoutes.delete("/class/:id", deleteClass);
adminRoutes.delete("/teacher", deleteTeacher);
adminRoutes.delete("/student/:id", deleteStudent);

adminRoutes.get("/classes", getAllClasses);
adminRoutes.get("/teachers", getAllTeachers);
adminRoutes.get("/getClassesAndSubjects", getClassesAndSubjects);
adminRoutes.get("/classesById", getAllClassesById);
adminRoutes.get("/classesById", getAllClassesById);
adminRoutes.get("/counts", getCounts);
adminRoutes.get("/getClasses", getClasses);

export default adminRoutes;
