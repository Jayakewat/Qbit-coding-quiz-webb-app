import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true //trim automatically removes whitespace (spaces) from the beginning and end of a string before saving it to MongoDB.
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },
},
{
    timestamps: true //when the user has created their account
}

);

export default mongoose.models.User || mongoose.model('User', userSchema);