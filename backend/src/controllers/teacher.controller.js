import Attendance from "../models/attendanceModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";
import User from "../models/userModel.js";

//API TO GET STUDENTS BASED ON CLASS
export const getStudentsById = async (req, res) => {
  const { id } = req.body;

  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "The class should be provided" });

  try {
    const getStudents = await Student.find({ classId: id }).select(
      "-createdAt -updatedAt -_id -classId"
    );

    if (!getStudents)
      return res.status(404).json({
        success: false,
        message: "The students with this id is not found.",
      });

    return res.status(200).json({ success: true, students: getStudents || [] });
  } catch (error) {
    console.log("Error while getting  students:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//API TO FETCH ALL CLASSES FOR A TEACHER
export const getClasses = async (req, res) => {
  const { id } = req.body;

  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "The teacher id should be provided" });

  try {
    const getTeacherId = await User.findById(id).select(
      "-_id -createdAt -updatedAt -firstName -secondName -color -role -password -email -__v"
    );

    const getClasses = await Teacher.findById(getTeacherId.profileId)
      .select("-createdAt -updatedAt -firstName -secondName -subjectIds")
      .populate({
        path: "classes",
        select: "-subjectIds -createdAt -updatedAt -__v",
      });

    if (!getClasses)
      return res.status(404).json({
        success: false,
        message: "The teacher with this id is not found.",
      });

    return res.status(200).json({ success: true, classes: getClasses || [] });
  } catch (error) {
    console.log("Error while getting  classes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//API TO FETCH  ALL CLASSES AND SUBJECTS FOR A TEACHER

export const getAllClassesAndSubjects = async (req, res) => {
  const { id } = req.body;

  try {
    const findTeacherId = await User.findById(id).select("profileId");

    if (!findTeacherId)
      return res
        .status(400)
        .json({ success: false, message: "User with this id is not found" });

    const getClasses = await Teacher.findById(findTeacherId.profileId)
      .select("classes")
      .populate({
        path: "classes",
        select: "name subjectIds",
        populate: {
          path: "subjectIds",
          select: "name",
        },
      });

    if (!getClasses)
      return res
        .status(404)
        .json({ success: false, message: "No classes found." });
    return res.status(200).json({ success: true, classes: getClasses || [] });
  } catch (error) {
    console.log("Error while getting  classes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//API TO LIST ALL STUDENTS AND THEIR ATTENDANCE FOR A DAY
export const getStudentsAttendanceForDay = async (req, res) => {
  const { date, classId, takenByTeacherId, subjectId } = req.body;

  try {
    // Validate required fields
    if (!date || !classId || !takenByTeacherId || !subjectId) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Fetch students belonging to the specified class
    const students = await Student.find({ classId }).select(
      "_id firstName secondName"
    );

    // Fetch existing attendance for the day
    const attendances = await Attendance.find({
      date: new Date(date),
      classId,
      subjectId,
    }).select("studentId isPresent");

    // Create a map of studentId to isPresent
    const attendanceMap = new Map();
    attendances.forEach((att) => {
      attendanceMap.set(att.studentId.toString(), att.isPresent);
    });

    // Prepare the response
    const attendanceList = students.map((student) => ({
      studentId: student._id,
      firstName: student.firstName,
      secondName: student.secondName,
      isPresent: attendanceMap.get(student._id.toString()) || false,
    }));

    return res.status(200).json({ success: true, attendanceList });
  } catch (error) {
    console.log("Error while getting students and attendance:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const submitAttendance = async (req, res) => {
  try {
    const { date, classId, subjectId, takenByTeacherId, attendanceData } =
      req.body;

    if (
      !date ||
      !classId ||
      !subjectId ||
      !takenByTeacherId ||
      !attendanceData
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const teacherUser = await User.findById(takenByTeacherId).select(
      "profileId"
    );
    if (!teacherUser) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    const attendanceDate = new Date(date);

    // Use bulk operations for efficiency
    const bulkOps = attendanceData.map(({ studentId, isPresent }) => ({
      updateOne: {
        filter: { studentId, date: attendanceDate, classId, subjectId },
        update: { isPresent, takenByTeacherId: teacherUser.profileId },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOps);

    res
      .status(200)
      .json({ success: true, message: "Attendance submitted successfully" });
  } catch (error) {
    console.error("Error submitting attendance:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTeacherStats = async (req, res) => {
  const { teacherId } = req.body;

  if (!teacherId) {
    return res
      .status(400)
      .json({ success: false, message: "Teacher ID is required" });
  }

  try {
    const teacher = await Teacher.findById(teacherId).populate({
      path: "classes",
      populate: {
        path: "subjectIds",
        select: "name",
      },
    });

    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    const totalClasses = teacher.classes.length;

    const classIds = teacher.classes.map((cls) => cls._id);
    const totalStudents = await Student.countDocuments({
      classId: { $in: classIds },
    });

    const totalSubjects = teacher.classes.reduce((subjects, cls) => {
      cls.subjectIds.forEach((subject) => subjects.add(subject.name));
      return subjects;
    }, new Set()).size;

    return res.status(200).json({
      success: true,
      stats: {
        totalClasses,
        totalStudents,
        totalSubjects,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//API to fetch total number for subjects , classes and students for a teacher
export const getTeacherOverview = async (req, res) => {
  const { id } = req.body;
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "The teacher id should be provided" });

  try {
    const findTeacherId = await User.findById(id).select("profileId");

    if (!findTeacherId)
      return res
        .status(400)
        .json({ success: false, message: "User with this id is not found" });
    const getClasses = await Teacher.findById(findTeacherId.profileId)
      .select("classes subjectIds")
      .populate({
        path: "classes",
        select: "name subjectIds",
        populate: {
          path: "subjectIds",
          select: "name",
        },
      });

    if (!getClasses)
      return res.status(404).json({
        success: false,
        message: "No classes found for this teacher.",
      });

    const totalClasses = Array.isArray(getClasses.classes)
      ? getClasses.classes.length
      : 0;

    const classIds = (getClasses.classes || []).map((c) => c._id);
    const totalStudents = await Student.countDocuments({
      classId: { $in: classIds },
    });

    const subjectSet = new Set();
    (getClasses.classes || []).forEach((cls) => {
      if (Array.isArray(cls.subjectIds)) {
        cls.subjectIds.forEach((sub) => {
          if (sub && sub.name) subjectSet.add(sub.name);
        });
      }
    });

    const totalSubjects = subjectSet.size;

    return res.status(200).json({
      success: true,
      count: {
        totalClasses,
        totalStudents,
        totalSubjects,
      },
    });
  } catch (error) {
    console.log("Error while getting teacher overview:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
