import mongoose from 'mongoose';
const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tradeup';
    try {
        await mongoose.connect(uri);
        console.log('MongoDB connected');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
export default connectDB;
