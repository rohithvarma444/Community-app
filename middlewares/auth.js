import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();



//in production we can use cookies rather than authorization (as here postman doesnt store cookies using authorisation)
//prod code
//const token = req.cookies.token
export const isLoggedin = async (req, res, next) => {
    try {
        if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided",
            });
        }

        const token = req.headers.authorization.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        const session = await prisma.session.findUnique({ where: { token } });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid or expired session",
            });
        }
        req.user.session = session.session_id;
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid token or session",
        });
    }
};
