import express from "express";
import { urlencoded } from "express";
import { cloudinaryConnect } from "./config/cloudinary.js";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";

// Import routes
import loginRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
dotenv.config(); 
const PORT = process.env.PORT || 3000;

// Connect to cloudinary
cloudinaryConnect();

const app = express();

app.use(express.json());
app.use(urlencoded({extended: true}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

// Routes
app.use('/api/v1/user', loginRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/poll', pollRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/category', categoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});


