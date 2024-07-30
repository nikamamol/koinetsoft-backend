const express = require("express");
const {
  signup,
  login,
  logout,
  sendOtp,
  verifyOtp,
  accessuser,
  getAllUsers,
  viewUserById,
  updateUser,
  deleteUserById,
  inviteagency
} = require("../controller/auth");

const UserAuthRouter = express.Router();

UserAuthRouter.post('/signup', signup);
UserAuthRouter.post('/login', login);
UserAuthRouter.post('/logout', logout);
UserAuthRouter.post('/send-otp', sendOtp);
UserAuthRouter.post('/verify-otp', verifyOtp);
// user
UserAuthRouter.post('/addnewuser', accessuser);
UserAuthRouter.get('/getallusers', getAllUsers);
UserAuthRouter.get('/viewuserbyid/:id', viewUserById);
UserAuthRouter.put('/updateuser/:id', updateUser);
UserAuthRouter.delete('/deleteuser/:id', deleteUserById);
// add agency
UserAuthRouter.post('/invitagency', inviteagency);

module.exports = UserAuthRouter;
