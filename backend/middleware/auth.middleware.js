import tokenBlacklist from "../models/tokenBlacklist.model.js";
import jwt from "jsonwebtoken";

 export const protect = async (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    const blacklistedToken = await tokenBlacklist.findOne({ token });

    if(blacklistedToken) {
        return res.status(401).json({ message: "token is invalid" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized, token is invalid" });
    }

}

