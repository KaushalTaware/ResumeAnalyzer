import "dotenv/config"
import express from "express";
import connectDB from "./config/database.js";
import authrouter from "./routes/auth.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

connectDB()
const app  = express()
app.use(cors({
     origin: [
        "http://localhost:5173",
        "https://resume-analyzer-neon-seven.vercel.app/",
        "https://resume-analyzer-geupe5129-kaushal-taware-s-projects.vercel.app"
    ],
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authrouter)
app.use("/api/interview", interviewRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});