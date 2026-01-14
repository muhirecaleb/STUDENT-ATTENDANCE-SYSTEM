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
      return res.status(404).json({
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

    if (attendanceRecords.length === 0) {
      return res.status(200).json({ success: true, attendance: [] });
    }

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

//API to get student overview stats
export const getStudentOverview = async (req, res) => {
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

    // Get student's class and subjects
    const studentProfile = await Student.findById(
      findStudent.profileId
    ).populate("classId");
    if (!studentProfile)
      return res
        .status(404)
        .json({ success: false, message: "Student profile not found" });

    const classData = await Class.findById(studentProfile.classId).populate(
      "subjectIds"
    );
    const totalSubjects = classData?.subjectIds?.length || 0;

    // Get current month attendance stats
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const attendanceRecords = await Attendance.find({
      studentId: findStudent.profileId,
      date: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1),
      },
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      (record) => record.isPresent
    ).length;
    const attendancePercentage =
      totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    res.status(200).json({
      success: true,
      overview: {
        totalSubjects,
        totalDays,
        presentDays,
        attendancePercentage,
        className: classData?.name || "N/A",
      },
    });
  } catch (error) {
    console.log("error to get student overview", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getStudentMonthlyAttendance = async (req, res) => {
  const { studentId, year } = req.body;
  if (!studentId || !year) {
    return res
      .status(400)
      .json({ success: false, message: "Student ID and year are required." });
  }

  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid year format." });
  }

  try {
    const findStudent = await User.findById(studentId).select("profileId");
    if (!findStudent)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    const result = await Attendance.aggregate([
      {
        $addFields: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
      },
      {
        $match: {
          studentId: findStudent.profileId,
          year: yearNum,
        },
      },
      {
        $facet: {
          monthly: [
            {
              $group: {
                _id: "$month",
                totalPresent: { $sum: { $cond: ["$isPresent", 1, 0] } },
                totalDays: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                month: "$_id",
                totalPresent: {
                  $concat: [
                    {
                      $toString: {
                        $round: [
                          {
                            $multiply: [
                              {
                                $divide: ["$totalPresent", "$totalDays"],
                              },
                              100,
                            ],
                          },
                          2,
                        ],
                      },
                    },
                    "%",
                  ],
                },
                totalAbsent: {
                  $concat: [
                    {
                      $toString: {
                        $round: [
                          {
                            $multiply: [
                              {
                                $divide: [
                                  {
                                    $subtract: ["$totalDays", "$totalPresent"],
                                  },
                                  "$totalDays",
                                ],
                              },
                              100,
                            ],
                          },
                          2,
                        ],
                      },
                    },
                    "%",
                  ],
                },
              },
            },
            {
              $sort: {
                month: 1,
              },
            },
          ],
          overall: [
            {
              $group: {
                _id: null,
                totalPresent: { $sum: { $cond: ["$isPresent", 1, 0] } },
                totalDays: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                totalPresentPercentage: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: ["$totalPresent", "$totalDays"],
                        },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                totalAbsentPercentage: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $subtract: ["$totalDays", "$totalPresent"] },
                            "$totalDays",
                          ],
                        },
                        100,
                      ],
                    },
                    2,
                  ],
                },
              },
            },
          ],
        },
      },
    ]);

    const monthlyAttendance = result[0]?.monthly || [];
    const overall = result[0]?.overall[0] || {
      totalPresentPercentage: 0,
      totalAbsentPercentage: 0,
    };

    res.status(200).json({
      success: true,
      monthlyAttendance,
      overall,
    });
  } catch (error) {
    console.error("Error while fetching student monthly attendance:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getStudentAttendanceYears = async (req, res) => {
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

    const years = await Attendance.distinct("date", {
      studentId: findStudent.profileId,
    }).then((dates) => {
      const uniqueYears = [...new Set(dates.map((date) => date.getFullYear()))];
      return uniqueYears.sort((a, b) => b - a); // descending
    });

    res.status(200).json({
      success: true,
      years,
    });
  } catch (error) {
    console.error("Error while fetching student attendance years:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
