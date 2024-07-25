const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
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
    mobile:{
      type: Number,
      required: true,
      trim: true
    },
    otp: String, 
    otpExpires: Date ,
    address:{
      type:String,
      required: true,
      
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    picture: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;