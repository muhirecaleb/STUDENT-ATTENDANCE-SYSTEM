import express from "express";
import { checkAuth, login } from "../controllers/auth.controller.js";
import verifyAuth from "../middlewares/verifyToken.js";

const authRoutes = express.Router();

authRoutes.post('/login', login);
authRoutes.post('/checkAuth',verifyAuth,checkAuth);

export default authRoutes;