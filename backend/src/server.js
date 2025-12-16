import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import adminRoutes from "./routes/admin.route.js";
import studentRoutes from "./routes/student.route.js";
import teacherRoutes from "./routes/teacher.route.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();

//middlewares
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['POST', 'UPDATE', 'DELETE' , 'GET'],
    credentials: true
}));

app.use(express.json());
app.use('/api/admin' , adminRoutes);
app.use('/api/auth' , authRoutes);
app.use('/api/teacher' , teacherRoutes);
app.use('/api/student' , studentRoutes);


const PORT = process.env.PORT || 4000

connectDB().then(() => {
    app.listen(PORT, () => {
   console.log(`✅ Server is Listening on ${PORT}`);
    })
});
