import express from "express";
import {
  uploadTimetable,
  getTimetables,
  getTimetableById,
  getMyTimetables,
  deleteTimetable,
} from "../controllers/timetable.controller.js";
import verifyAuth from "../middlewares/verifyToken.js";
import multer from "multer";

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, images, and documents
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, images, and documents are allowed."
        ),
        false
      );
    }
  },
});

// Routes
router.post("/upload", verifyAuth, upload.single("timetable"), uploadTimetable);
router.get("/", verifyAuth, getTimetables);
router.get("/my", verifyAuth, getMyTimetables);
router.get("/:id", verifyAuth, getTimetableById);
router.delete("/:id", verifyAuth, deleteTimetable);

export default router;
