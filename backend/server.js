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
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authrouter)
app.use("/api/interview", interviewRouter)

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});