import mongoose from "mongoose";

const teacherModel = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  secondName: {
    type: String,
    required: true,
    trim: true
  },

  classes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    }
  ],

  subjectIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    }
  ]
}, {
  timestamps: true
});

const Teacher = mongoose.model('Teacher', teacherModel);

export default Teacher;
