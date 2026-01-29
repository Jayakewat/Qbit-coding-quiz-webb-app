// import mongoose from 'mongoose';

// export const connectDB = async () => {
//     await mongoose.connect('mongodb+srv://jayakewat345_db_user:QuizApp123@cluster0.elnbhps.mongodb.net/QuizApp').then(() => {
//         console.log('DB CONNECTED')
//     })
// }


import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB CONNECTED');
    } catch (error) {
        console.error('DB CONNECTION FAILED:', error.message);
        process.exit(1);
    }
};
