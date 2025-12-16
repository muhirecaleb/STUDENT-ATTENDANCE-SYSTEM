import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    secondName: {
      type: String,
      required: true,
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Class', 
    },
    status: {
      type: String,
      enum: ['Active', 'Withdrawn', 'Graduated', 'Suspended'],
      default: 'Active',
    },
  },
  {
    timestamps: true, 
  }
);


const Student = mongoose.model('Student', studentSchema);

export default Student;
