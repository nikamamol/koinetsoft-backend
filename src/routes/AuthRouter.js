const express = require("express");
const { signup, login, logout,sendOtp,verifyOtp, accessuser, getAllUsers, getUserProfile} = require("../controller/auth");


const UserAuthRouter = express.Router();

UserAuthRouter.post('/signup', signup);
UserAuthRouter.post('/login', login);
UserAuthRouter.post('/logout', logout);
UserAuthRouter.post('/send-otp', sendOtp); 
UserAuthRouter.post('/verify-otp', verifyOtp);
UserAuthRouter.post('/addnewuser', accessuser);
UserAuthRouter.get('/getallusers', getAllUsers);


module.exports = UserAuthRouter;

