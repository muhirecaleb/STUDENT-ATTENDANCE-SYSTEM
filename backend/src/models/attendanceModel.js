import mongoose from "mongoose";

function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate(); 
}

const attendanceSchema = new mongoose.Schema({
    
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', 
        required: true,
    },
    
    month: {
        type: Number,
        required: true,
        validate: {
            validator: (value) => value >= 1 && value <= 12,
            message: 'Month must be between 1 and 12',
        }
    },

    year: {
        type: Number,
        required: true, 
    },

    dialyAttendance: {
        type: [Boolean],
        validate: {
            validator: function(value) {
                const daysInMonth = getDaysInMonth(this.month, this.year); 
                return value.length === daysInMonth; 
            },
            message: (props) => `Attendance array must have ${getDaysInMonth(props.month, props.year)} days.`,
        },   
        default: function() {
            const daysInMonth = getDaysInMonth(this.month, this.year); 
            return Array(daysInMonth).fill(false); 
        }
    },

    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class', 
        required: true,
    },

    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject', 
        required: true,
    },

    takenByTeacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
    },

}, {
    timestamps: true,
});

attendanceSchema.index({ classId: 1, month: 1, year: 1, subjectId: 1 }); 

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
