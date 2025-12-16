import mongoose from "mongoose";

const classModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, 
    subjectIds:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }]
}, {
    timestamps: true
});

const Class = mongoose.model('Class',classModel);

export default Class;