import User from "../models/user.model.js";
import TokenBlackList from "../models/tokenBlackList.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    const {name, email, password} = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    
   const user = await  User.create({
    name,
    email,
    password: hashPassword
   })
   const token = jwt.sign(
    {id:user._id, name:user.name},
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
   )
   res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none"
});

    res.status(201).json({message: "User registered successfully", user:{
        id: user._id,
        name: user.name,
        email: user.email
    }});
}

export const loginUser = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        return res.status(404).json({message: "User not found"});
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({message: "Invalid credentials"});
    }
    const token = jwt.sign(
        {id:user._id, name:user.name},
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none"
});
    res.status(200).json({message: "User logged in successfully", user:{
        id: user._id,
        name: user.name,
        email: user.email
    }});
};

export const logoutUser = async (req, res) => {
    const token = req.cookies.token;
    if(token){
        await TokenBlackList.create({token})
    }
    res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
});
    res.status(200).json({message: "User logged out successfully"});
}

export const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({message: "User not found"});
    }
    res.status(200).json({user:{
        id: user._id,
        name: user.name,
        email: user.email
    },message: "User fetched successfully"});
}