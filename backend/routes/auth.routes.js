import express from "express";
import { registerUser, loginUser, logoutUser, getMe } from "../controller/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const authrouter = express.Router();
authrouter.post("/register",registerUser);
authrouter.post("/login",loginUser);
authrouter.get("/logout",logoutUser);
authrouter.get("/me",protect,getMe);




export default authrouter;