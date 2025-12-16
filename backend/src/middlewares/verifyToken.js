import jwt from "jsonwebtoken";

const verifyAuth = async (req, res, next) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided",
        });
    }

    try {
        const decoded =  jwt.verify(token, process.env.JWT_SECRET);

        req.body.user = decoded;

        return next();
    } catch (error) {
        console.error("Token verification failed:", error);

        return res.status(400).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export default verifyAuth;
