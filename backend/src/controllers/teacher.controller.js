import Attendance from "../models/attendanceModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";
import User from "../models/userModel.js";

//API TO GET STUDENTS BASED ON CLASS
export const getStudentsById = async (req,res) => {
    
    const { id } = req.body;

    if(!id) return res.status(400).json({ success: false , message: "The class should be provided" });

    try {

        const getStudents = await Student.find({classId: id}).select('-createdAt -updatedAt -_id -classId');
        
        if(!getStudents)  return res.status(404).json({ success: false , message: "The students with this id is not found." });
        
        return  res.status(200).json({ success: true , students: getStudents || []});
    } catch (error) {
    console.log("Error while getting  students:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    }
};

//API TO FETCH ALL CLASSES FOR A TEACHER
export const getClasses = async (req,res) => {
    const { id } = req.body;

        if(!id) return res.status(400).json({ success: false , message: "The teacher id should be provided" });

    try {

        const getTeacherId = await User.findById(id).select('-_id -createdAt -updatedAt -firstName -secondName -color -role -password -email -__v')

        const getClasses = await Teacher.findById(getTeacherId.profileId).select('-createdAt -updatedAt -firstName -secondName -subjectIds').populate({
            path: 'classes',
            select: '-subjectIds -createdAt -updatedAt -__v'
        });

        if(!getClasses) return res.status(404).json({ success: false , message: "The teacher with this id is not found." });

        return  res.status(200).json({ success: true , classes: getClasses || []});

    } catch (error) {
    console.log("Error while getting  classes:", error);
    res.status(500).json({ success: false, message: "Internal server error" }); 
    }
};

//API TO FETCH  ALL CLASSES AND SUBJECTS FOR A TEACHER

export const getAllClassesAndSubjects = async (req,res) => {

    const { id } = req.body;

    try {       

        const findTeacherId = await User.findById(id).select('profileId');

        if(!findTeacherId) return res.status(400).json({ success: false , message: "User with this id is not found" });


        const getClasses = await Teacher.findById(findTeacherId.profileId)
        .select('classes')
        .populate({
            path: 'classes',
            select: 'name subjectIds',
            populate: {
                path: 'subjectIds',    
                select: 'name',    
            },
        });

        if(!getClasses) return res.status(404).json({ success: false , message: "No classes found." });
        return  res.status(200).json({ success: true , classes: getClasses || []});

    } catch (error) {                           
    console.log("Error while getting  classes:", error);
    res.status(500).json({ success: false, message: "Internal server error" }); 
    }
};

//API TO LIST ALL STUDENTS AND THEIR ATTENDANCE 
export const getAllStudentsAndAttendance = async (req, res) => {
  const { month, year, classId, takenByTeacherId, subjectId } = req.body;

  try {
    // Validate required fields
    if (!month || !year || !classId || !takenByTeacherId || !subjectId) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Fetch students belonging to the specified class
    const students = await Student.find({ classId }).select('_id');

    // Check if an attendance record already exists
    const existAttendance = await Attendance.findOne({ month, year, classId, subjectId });

    if (existAttendance) {
      const attendanceListPromise = Promise.all(
        students.map(async (item) => {
          try {
            const studentAttendance = await Attendance.find({
              studentId: item._id,
              month,
              year,
              classId,
              subjectId,
            })
              .select('studentId dialyAttendance')
              .populate({
                path: 'studentId',
                select: 'firstName secondName',
              });
            return studentAttendance;
          } catch (error) {
            console.log('Error fetching student attendance:', error);
            return null;
          }
        })
      );

      const attendanceList = await attendanceListPromise;

      return res.status(200).json({ success: true, attendanceList });
    }

    // Create attendance if none exists
    const teacherId = await User.findById(takenByTeacherId);

    const createAttendancePromise = Promise.all(
      students.map(async (item) => {
        const createdAttendanceDoc = await Attendance.create({
          month,
          year,
          classId,
          takenByTeacherId: teacherId._id,
          subjectId,
          studentId: item._id,
        });

        const populatedAttendance = await Attendance.findById(createdAttendanceDoc._id)
          .select('studentId dialyAttendance')
          .populate({
            path: 'studentId',
            select: 'firstName secondName',
          });

        return [populatedAttendance];
      })
    );

    const attendanceList = await createAttendancePromise;

    return res.status(200).json({ success: true, attendanceList });
  } catch (error) {
    console.log("Error while getting students and attendance:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const updateRecord = async (req, res) => {
 try {
  const { payload } = req.body;

const { attendanceId, dayIndex, isPresent } = payload;

  const attendanceRecord = await Attendance.findById(attendanceId);

  if (!attendanceRecord) {
   return res.status(404).json({ success: false, message: 'Attendance record not found' });
  }

  const updatePath = `dialyAttendance.${dayIndex}`;
  const updatedRecord = await Attendance.findByIdAndUpdate(
   attendanceId,
   { $set: { [updatePath]: isPresent } },
   { new: true } 
  );

  if (!updatedRecord) {
   return res.status(500).json({ success: false, message: 'Update failed' });
  }

  res.status(200).json({ success: true, message: 'Attendance updated successfully' });
 } catch (error) {
  console.error('Error updating attendance:', error);
  res.status(500).json({ success: false, message: 'Server error' });
 }
};


export const getTeacherStats = async (req, res) => {
  const { teacherId } = req.body;

  if (!teacherId) {
    return res.status(400).json({ success: false, message: "Teacher ID is required" });
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
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

  
    const totalClasses = teacher.classes.length;

    const classIds = teacher.classes.map((cls) => cls._id);
    const totalStudents = await Student.countDocuments({ classId: { $in: classIds } });

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
export const getTeacherOverview = async (req,res) => {
  const { id } = req.body;
      if(!id) return res.status(400).json({ success: false , message: "The teacher id should be provided" });

  try { 
      const findTeacherId = await User.findById(id).select('profileId');

      if(!findTeacherId) return res.status(400).json({ success: false , message: "User with this id is not found" });
      const getClasses = await Teacher.findById(findTeacherId.profileId)
      .select('classes subjectIds')
      .populate({
        path: 'classes',
        select: 'name subjectIds',
        populate: {
          path: 'subjectIds',
          select: 'name'
        }
      });

      if(!getClasses) return res.status(404).json({ success: false , message: "No classes found for this teacher." });

      const totalClasses = Array.isArray(getClasses.classes) ? getClasses.classes.length : 0;

      const classIds = (getClasses.classes || []).map((c) => c._id);
      const totalStudents = await Student.countDocuments({ classId: { $in: classIds } });

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
