import mongoose from "mongoose";

const connectDB = async () => { 
    try {
        await mongoose.connect("mongodb+srv://kaushalstaware_db_user:Aq1spWXkaaQE8vCH@cluster0.j0sy9tc.mongodb.net/project"
           );
        console.log("MongoDB connected");
    } catch (error) {   
        console.error("Error connecting to MongoDB:", error);
    }
}

export default connectDB;
