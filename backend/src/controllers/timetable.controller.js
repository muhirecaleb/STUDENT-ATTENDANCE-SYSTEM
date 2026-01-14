import Timetable from "../models/timetableModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import generateRandomColor from "../utils/profileColor.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

// Upload timetable
export const uploadTimetable = async (req, res) => {
  try {
    const { title, description, classId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Get uploader ID - handle different token structures
    let uploaderId;
    if (req.user.userInfo && req.user.userInfo._id) {
      uploaderId = req.user.userInfo._id;
    } else if (req.user.role === "Admin" || req.user.role === "admin") {
      // For admin users, try to find or create admin user record
      try {
        let adminUser = await User.findOne({
          email: req.user.email,
          role: "admin",
        });
        if (!adminUser) {
          adminUser = new User({
            email: req.user.email,
            password: await bcrypt.hash("defaultAdminPass", 10), // This should be changed
            role: "admin",
            firstName: "Admin",
            secondName: "User",
            color: generateRandomColor(),
          });
          await adminUser.save();
        }
        uploaderId = adminUser._id;
      } catch (error) {
        console.error("Error creating admin user:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to authenticate admin user",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid user authentication",
      });
    }

    // Upload file to cloudinary
    const result = await uploadToCloudinary(file.buffer, "timetables");

    const timetable = new Timetable({
      title,
      description,
      fileUrl: result.secure_url,
      fileName: file.originalname,
      uploadedBy: uploaderId,
      classId: classId || null,
    });

    await timetable.save();

    res.status(201).json({
      success: true,
      message: "Timetable uploaded successfully",
      timetable,
    });
  } catch (error) {
    console.error("Error uploading timetable:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all timetables
export const getTimetables = async (req, res) => {
  try {
    const { classId } = req.query;

    let query = { isActive: true };

    if (classId) {
      query.classId = classId;
    }

    const timetables = await Timetable.find(query)
      .populate("uploadedBy", "firstName secondName")
      .populate("classId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      timetables,
    });
  } catch (error) {
    console.error("Error fetching timetables:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get timetable by ID
export const getTimetableById = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findById(id)
      .populate("uploadedBy", "firstName secondName")
      .populate("classId", "name");

    if (!timetable || !timetable.isActive) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    res.status(200).json({
      success: true,
      timetable,
    });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get timetables based on user role
export const getMyTimetables = async (req, res) => {
  try {
    const userInfo = req.user.userInfo;
    let query = { isActive: true };

    if (userInfo.role === "student") {
      // Students see timetables for their class
      const Student = (await import("../models/studentModel.js")).default;
      const student = await Student.findOne({ userId: userInfo._id });
      if (student) {
        query.classId = student.classId;
      }
    } else if (userInfo.role === "teacher") {
      // Teachers see timetables for classes they teach
      const Teacher = (await import("../models/teacherModel.js")).default;
      const teacher = await Teacher.findOne({ userId: userInfo._id });
      if (teacher && teacher.classes) {
        query.classId = { $in: teacher.classes };
      }
    }
    // Admins see all timetables (no additional filter needed)

    const timetables = await Timetable.find(query)
      .populate("uploadedBy", "firstName secondName")
      .populate("classId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      timetables,
    });
  } catch (error) {
    console.error("Error fetching my timetables:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete timetable
export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findById(id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    // Delete from cloudinary
    await deleteFromCloudinary(timetable.fileUrl);

    // Soft delete
    timetable.isActive = false;
    await timetable.save();

    res.status(200).json({
      success: true,
      message: "Timetable deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timetable:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
