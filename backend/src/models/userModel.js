import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        trim: true,
        required: true
    },
    secondName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    
    password: {
   type: String,
    trim: true,
    required: true,
    },

    role: {
         type: String,
        enum: ['student', 'admin', 'teacher'],
        default: 'student'
    },
    color: {
        type: String,
        required: true,
        trim: true
    },

    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profileModelName'
    },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;