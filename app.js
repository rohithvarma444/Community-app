import express from "express";
import { urlencoded } from "express";
import { cloudinaryConnect } from "./config/cloudinary.js";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import removeSessions from "./utils/scheduler.js";

import fileUpload from "express-fileupload";
import loginRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
dotenv.config(); 
const PORT = process.env.PORT || 3000;

cloudinaryConnect();
const app = express();

app.use(express.json());
app.use(urlencoded({extended: true}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));



app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
            connectSrc: ["'self'"],
        },
    })
);
removeSessions();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);
// Routes
app.use('/api/v1/user', loginRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/poll', pollRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/category', categoryRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});




