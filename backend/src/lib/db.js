import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(process.env.NODE_ENV === 'development' ? process.env.MONGO_LOCAL_URI : process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of 30
    });

    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error("Suggestions:");
      console.error("- Verify your IP is whitelisted in MongoDB Atlas");
      console.error("- Check your internet connection/firewall");
      console.error("- Verify the MongoDB URI is correct");
    }
    
    process.exit(1);
  }
};