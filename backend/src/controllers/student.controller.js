import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Attendance from "../models/attendanceModel.js";
import Student from "../models/studentModel.js";
import Class from "../models/classModel.js";

//API to login User
export const studentLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const existUser = await User.findOne({ email });

    if (!existUser) {
      return res
        .status(404)
        .json({ success: false, message: "Email does not exist" });
    }

    //check if the password matches
    const checkPassword = await bcrypt.compare(password, existUser.password);

    if (!checkPassword) {
      {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }
    }

    //create a token for the user

    const token = jwt.sign(
      {
        userInfo: {
          ...existUser._doc,
          password: undefined,
        },
      },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        ...existUser._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error to login student", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  const userInfo = req.body.user;

  if (!userInfo)
    return res
      .status(401)
      .json({ success: false, message: "No userInfo provided" });

  if (userInfo.role === "Admin")
    return res.status(200).json({ success: true, user: userInfo });

  console.log(userInfo);

  try {
    const findUser = await User.findById(userInfo.userInfo._id);

    if (findUser)
      return res.status(200).json({ success: true, user: userInfo });
    if (!findUser)
      res.status(404).json({ success: false, message: "No user found" });
  } catch (error) {
    console.log("error to login student", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//API to fetch all  subjects of a student

export const fetchStudentSubjects = async (req, res) => {
  const { studentId } = req.body;
  if (!studentId) {
    return res
      .status(400)
      .json({ success: false, message: "Student ID is required" });
  }
  try {
    const findStudent = await User.findById(studentId).select("profileId");
    if (!findStudent)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    const findClassId = await Student.findById(findStudent.profileId).select(
      "classId"
    );
    if (!findClassId)
      return res
        .status(404)
        .json({ success: false, message: "Class not found for the student" });

    const getSubjects = await Class.findById(findClassId.classId)
      .select("subjectIds")
      .populate({
        path: "subjectIds",
        select: "-__v",
      });
    if (!getSubjects)
      return res
        .status(404)
        .json({
          success: false,
          message: "No subjects found for the student's class",
        });
    res
      .status(200)
      .json({ success: true, subjects: getSubjects.subjectIds || [] });
  } catch (error) {
    console.log("error to fetch student subjects", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//API to fetch all attendance of a student
export const fetchStudentAttendance = async (req, res) => {
  const { studentId, month, year, subjectId } = req.body;

  if (!studentId || !month || !year) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const findStudent = await User.findById(studentId).select("profileId");
    if (!findStudent)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    const daysInMonth = new Date(year, month, 0).getDate();
    const attendanceRecords = await Attendance.find({
      studentId: findStudent.profileId,
      date: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
      subjectId: subjectId,
    }).select("date isPresent -_id");

    const attendanceMap = new Map();
    attendanceRecords.forEach((record) => {
      const day = record.date.getDate();
      attendanceMap.set(day, record.isPresent);
    });

    const attendance = Array.from(
      { length: daysInMonth },
      (_, i) => attendanceMap.get(i + 1) || false
    );

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    console.log("error to fetch student attendance", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
