import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('⚙️  Database connected successfully!')
    } catch (error) {
        console.log('error to connect to DB',error);
        process.exit(1);
    }
}

export default connectDB;