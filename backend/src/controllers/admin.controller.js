import validator from "validator";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import Student from "../models/studentModel.js";
import Subject from "../models/subjectModel.js";
import Class from "../models/classModel.js";
import Teacher from "../models/teacherModel.js";
import generateRandomColor from "../utils/profileColor.js";
import Attendance from "../models/attendanceModel.js";

//Admin login

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required " });

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Find or create admin user record
      let adminUser = await User.findOne({ email, role: "admin" });
      if (!adminUser) {
        adminUser = new User({
          email,
          password: await bcrypt.hash(password, 10),
          role: "admin",
          firstName: "Admin",
          secondName: "User",
          color: generateRandomColor(),
        });
        await adminUser.save();
      }

      const token = jwt.sign(
        {
          userInfo: {
            ...adminUser._doc,
            password: undefined,
          },
        },
        process.env.JWT_SECRET
      );

      res.status(200).json({
        success: true,
        token,
        user: {
          ...adminUser._doc,
          password: undefined,
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log("error to login", error.message);
  }
};

// API to add a student

export const addStudent = async (req, res) => {
  const { email, firstName, secondName, password, classId } = req.body;

  if (!email || !firstName || !secondName || !password || !classId) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    //Check if a user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    //check if the class exist

    const existClass = await Class.findById(classId);

    if (!existClass) {
      return res.status(409).json({
        success: false,
        message: "Class does not exist",
      });
    }

    //validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    //hashpassword
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    //add a new Student user
    const newStudent = await Student({
      firstName,
      secondName,
      classId,
    });

    await newStudent.save();

    const color = generateRandomColor();

    const newUser = await User({
      firstName,
      secondName,
      email,
      password: hashedPassword,
      role: "student",
      profileId: newStudent._id,
      color,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      newUser: {
        ...newUser._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error to add student", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//API to add a teacher

export const addTeacher = async (req, res) => {
  const { email, firstName, secondName, password, classes, subjectIds, role } =
    req.body;

  if (
    !email ||
    !firstName ||
    !secondName ||
    !password ||
    !classes ||
    !subjectIds
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    //Check if a teacher already exists
    const existingTeacher = await User.findOne({ email });
    if (existingTeacher) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const classExist = [];

    for (const id of classes) {
      const checkClass = await Class.findById(id);
      if (!checkClass) {
        classExist.push(false);
        break;
      } else {
        classExist.push(true);
      }
    }

    if (classExist.includes(false)) {
      return res
        .status(404)
        .json({ success: false, message: "One or more classes do not exist" });
    }

    //validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    //hash password
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    //add a new Teacher user
    const newTeacher = await Teacher({
      firstName,
      secondName,
      classes,
      subjectIds,
    });

    await newTeacher.save();

    const color = generateRandomColor();

    const newUser = await User({
      firstName,
      secondName,
      email,
      password: hashedPassword,
      role: "teacher",
      profileId: newTeacher._id,
      color,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Teacher added successfully",
      newUser,
      newTeacher,
    });
  } catch (error) {
    console.log("error to add teacher", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//API to add a class

export const addClass = async (req, res) => {
  const { name, subjectIds } = req.body;

  if (!name || !subjectIds) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // Check if the class already exists
    const checkClassIfExist = await Class.findOne({ name });

    if (checkClassIfExist) {
      return res
        .status(400)
        .json({ success: false, message: "Class already exists" });
    }
    // Get the subject IDs using async/await
    const subjectIdPromises = subjectIds.map(async (subjectName) => {
      const uniqueSuffix = nanoid(6);
      const reliableId =
        subjectName.substring(0, 3).toUpperCase() + "-" + uniqueSuffix;

      const createSubject = await Subject.create({
        name: subjectName,
        subjectId: reliableId,
      });

      await createSubject.save();
      return createSubject._id;
    });

    // Wait for all promises to resolve
    const resolvedSubjectIds = await Promise.all(subjectIdPromises);

    // Create the new class with the resolved subject IDs
    const createClass = await Class.create({
      name,
      subjectIds: resolvedSubjectIds,
    });

    await createClass.save();
    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      class: createClass,
    });
  } catch (error) {
    console.log("Error while adding class:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//API to fetch all classes

export const getAllClasses = async (_, res) => {
  try {
    const classes = await Class.find({}).populate("subjectIds", "name");

    res.status(200).json({
      success: true,
      classes,
    });
  } catch (error) {
    console.log("Error while adding class:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//api to fetch class by id
export const getAllClassesById = async (_, res) => {
  try {
    const classes = await Class.find({}, "name _id");

    res.status(200).json({
      success: true,
      classes,
    });
  } catch (error) {
    console.log("Error while adding class:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getStudentsByClass = async (req, res) => {
  const { id } = req.body;

  try {
    // Find all students in this class
    const students = await Student.find({ classId: id });

    if (!students || students.length === 0) {
      return res.status(200).json({
        success: true,
        students: [],
      });
    }

    // Get user info for each student
    const studentsWithInfo = await Promise.all(
      students.map(async (student) => {
        const user = await User.findOne({
          profileId: student._id,
          role: "student",
        }).select("-password -color -createdAt -updatedAt");

        return {
          _id: student._id, // Student document ID for CRUD operations
          userId: user._id,
          firstName: user.firstName,
          secondName: user.secondName,
          email: user.email,
          role: user.role,
          classId: student.classId,
        };
      })
    );

    res.status(200).json({
      success: true,
      students: studentsWithInfo,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//api to get all classes and their subjects

export const getClassesAndSubjects = async (_, res) => {
  try {
    const classes = await Class.find({}).populate(
      "subjectIds",
      "name subjectId"
    );
    res.status(200).json({
      success: true,
      classes,
    });
  } catch (error) {
    console.log("Error while getting classes and subjects:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// API to update a class
export const updateClass = async (req, res) => {
  const { id, name, subjectIds } = req.body;

  if (!id || (!name && !subjectIds)) {
    return res.status(400).json({
      success: false,
      message: "Class id and fields to update are required",
    });
  }

  try {
    const classDoc = await Class.findById(id);
    if (!classDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }

    // If name is changing, ensure no other class uses the same name
    if (name && name !== classDoc.name) {
      const existing = await Class.findOne({ name });
      if (existing && existing._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: "Another class with this name already exists",
        });
      }
    }

    let resolvedSubjectIds = classDoc.subjectIds;

    // If subjectIds are provided as names (strings), create subjects and replace
    if (subjectIds && Array.isArray(subjectIds) && subjectIds.length > 0) {
      const subjectIdPromises = subjectIds.map(async (subjectName) => {
        // create new Subject for each provided name
        const uniqueSuffix = nanoid(6);
        const reliableId =
          subjectName.substring(0, 3).toUpperCase() + "-" + uniqueSuffix;
        const createSubject = await Subject.create({
          name: subjectName,
          subjectId: reliableId,
        });
        await createSubject.save();
        return createSubject._id;
      });

      resolvedSubjectIds = await Promise.all(subjectIdPromises);
    }

    classDoc.name = name || classDoc.name;
    classDoc.subjectIds = resolvedSubjectIds;

    const updated = await classDoc.save();

    const populated = await Class.findById(updated._id).populate(
      "subjectIds",
      "name subjectId"
    );

    res.status(200).json({
      success: true,
      message: "Class updated successfully",
      class: populated,
    });
  } catch (error) {
    console.log("Error while updating class:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// API to delete a class
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Class id is required" });

    const classDoc = await Class.findById(id);
    if (!classDoc)
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });

    // delete associated subjects
    if (classDoc.subjectIds && classDoc.subjectIds.length > 0) {
      await Subject.deleteMany({ _id: { $in: classDoc.subjectIds } });
    }

    await Class.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Class deleted" });
  } catch (error) {
    console.log("Error while deleting class:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//api to get all teachers

export const getAllTeachers = async (_, res) => {
  try {
    const users = await User.find({ role: "teacher" }).select(
      "-password -createdAt -updatedAt -color"
    );

    const teachers = await Promise.all(
      users.map(async (u) => {
        let profile = null;
        if (u.profileId) {
          profile = await Teacher.findById(u.profileId).select(
            "classes subjectIds"
          );
        }

        return {
          email: u.email,
          firstName: u.firstName,
          secondName: u.secondName,
          role: u.role,
          profileId: u.profileId,
          classes: profile ? profile.classes : [],
          subjectIds: profile ? profile.subjectIds : [],
        };
      })
    );

    res.status(200).json({
      success: true,
      teachers,
    });
  } catch (error) {
    console.log("Error while getting teachers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//api to update teacher
export const updateTeacher = async (req, res) => {
  const { firstName, secondName, classes, subjectIds, email } = req.body;

  const teacher = await User.findOne({ email });

  if (!teacher) {
    return res
      .status(404)
      .json({ success: false, message: "Teacher not found" });
  }

  const updateData = { firstName, secondName, classes, subjectIds };

  try {
    const updateUser = await User.findByIdAndUpdate(
      teacher._id,
      { firstName, secondName },
      { new: true }
    );

    await updateUser.save();

    // Update the teacher document
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacher.profileId,
      updateData,
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      updatedTeacher,
    });
  } catch (error) {
    console.log("Error while updating teacher:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, role: "teacher" });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });

    // delete profile document if exists
    if (user.profileId) {
      await Teacher.findByIdAndDelete(user.profileId);
    }

    // delete user
    await User.findByIdAndDelete(user._id);

    return res.json({ success: true, message: "Teacher deleted" });
  } catch (err) {
    console.error("Error deleting teacher", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to update a student
export const updateStudent = async (req, res) => {
  const { id, email, firstName, secondName, classId, password } = req.body;

  if (!id || (!firstName && !secondName && !classId && !password && !email)) {
    return res.status(400).json({
      success: false,
      message: "Student id and at least one field to update are required",
    });
  }

  try {
    const student = await Student.findById(id);
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    // Update student fields
    if (firstName) student.firstName = firstName;
    if (secondName) student.secondName = secondName;
    if (classId) student.classId = classId;

    const updatedStudent = await student.save();

    const user = await User.findOne({
      profileId: student._id,
      role: "student",
    });
    if (user) {
      if (firstName) user.firstName = firstName;
      if (secondName) user.secondName = secondName;
      if (email) user.email = email;
      if (password) {
        const salt = 10;
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
      }
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// API to delete a student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Student id is required" });

    const student = await Student.findById(id);
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    // delete linked user
    await User.findOneAndDelete({ profileId: student._id, role: "student" });

    // delete student
    await Student.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Student deleted" });
  } catch (error) {
    console.error("Error deleting student", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//API for attendance of each month of the selected year
export const getMonthlyAttendance = async (req, res) => {
  const { year: yearString } = req.body;
  if (!yearString) {
    return res
      .status(400)
      .json({ success: false, message: "Year is required." });
  }

  const year = parseInt(yearString, 10);
  if (isNaN(year)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid year format." });
  }

  try {
    const result = await Attendance.aggregate([
      {
        $addFields: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $facet: {
          monthly: [
            {
              $group: {
                _id: "$month",
                totalPresent: { $sum: { $cond: ["$isPresent", 1, 0] } },
                totalAbsent: { $sum: { $cond: ["$isPresent", 0, 1] } },
                totalPossibleAttendance: { $sum: 1 },
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
                                $divide: [
                                  "$totalPresent",
                                  "$totalPossibleAttendance",
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
                totalAbsent: {
                  $concat: [
                    {
                      $toString: {
                        $round: [
                          {
                            $multiply: [
                              {
                                $divide: [
                                  "$totalAbsent",
                                  "$totalPossibleAttendance",
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
                totalAbsent: { $sum: { $cond: ["$isPresent", 0, 1] } },
                totalPossibleAttendance: { $sum: 1 },
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
                          $divide: [
                            "$totalPresent",
                            "$totalPossibleAttendance",
                          ],
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
                          $divide: ["$totalAbsent", "$totalPossibleAttendance"],
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
    console.error("Error while fetching monthly attendance:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//API to get count for total students, teachers, classes, subjects
export const getCounts = async (_, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const classCount = await Class.countDocuments();
    const subjectCount = await Subject.countDocuments();

    res.status(200).json({
      success: true,
      counts: {
        students: studentCount,
        teachers: teacherCount,
        classes: classCount,
        subjects: subjectCount,
      },
    });
  } catch (error) {
    console.error("Error while fetching counts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getClasses = async (_, res) => {
  try {
    const classes = await Class.find()
      .select("-createdAt -updatedAt -__v")
      .populate({
        path: "students",
        select: "-password -email -createdAt -updatedAt -__v",
      });

    if (!classes || classes.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No classes found." });
    }

    return res.status(200).json({ success: true, classes });
  } catch (error) {
    console.error("Error while fetching all classes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
