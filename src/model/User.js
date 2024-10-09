const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    mobile: {
        type: Number,
        required: true,
        trim: true,
    },
    otp: String,
    otpExpires: Date,
    password: {
        type: String,
        required: true,
        trim: true,
    },
    picture: {
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'supervisor', 'oxmanager', 'reasercher', 'agent', 'client', 'quality', 'email_marketing', 'delivery', 'guest'],
        default: 'user',
    },
    // Add login timestamps
    loginTimes: [{
        timestamp: {
            type: Date,
            default: Date.now, // Default login time when the user logs in
        },
    }, ],
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;