import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    isPresent: {
      type: Boolean,
      default: false,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    takenByTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ classId: 1, date: 1, subjectId: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
