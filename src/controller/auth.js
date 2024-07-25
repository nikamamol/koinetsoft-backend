const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config(); 

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true, // Enable debug output
  logger: true // Log information
});

exports.signup = async (req, res) => {
  const { username, email, password, address, mobile } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: "User already exists!" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      address,
      mobile,
    });
    return res.status(201).send({ user });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).send({ message: "Error signing up!", error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      return res.status(400).send({ message: "User not found" });
    }

    const passwordMatched = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!passwordMatched) {
      return res.status(400).send({ message: "Wrong password" });
    }

    const jwtToken = jwt.sign(
      {
        _id: existingUser._id,
        email: existingUser.email,
      },
      process.env.JWT_KEY,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    res.cookie("token", jwtToken, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).send({ message: "Login successful", token: jwtToken });
  } catch (error) {
    return res.status(500).send({ message: "Error logging in!", error: error });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).send({ message: "logged out successfully!" });
  } catch (error) {
    return res.status(500).send({ message: "Error logging out!", error });
  }
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).send({ message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    const expiresIn = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    existingUser.otp = otp;
    existingUser.otpExpires = expiresIn;
    await existingUser.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP email:", error);
        return res.status(500).send({ message: "Error sending OTP email", error });
      } else {
        console.log('Email sent: ' + info.response);
        return res.status(200).send({ message: 'OTP sent successfully' });
      }
    });
  } catch (error) {
    console.error("Error during OTP generation:", error);
    return res.status(500).send({ message: "Error sending OTP", error });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).send({ message: "User not found" });
    }

    if (existingUser.otp !== otp) {
      return res.status(400).send({ message: "Invalid OTP" });
    }

    if (existingUser.otpExpires < Date.now()) {
      return res.status(400).send({ message: "OTP has expired" });
    }

    // Clear OTP fields after successful verification
    existingUser.otp = null;
    existingUser.otpExpires = null;
    await existingUser.save();

    const jwtToken = jwt.sign(
      {
        _id: existingUser._id,
        email: existingUser.email,
      },
      process.env.JWT_KEY,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    res.cookie("token", jwtToken, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).send({ message: 'OTP verified successfully', jwtToken });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).send({ message: "Error verifying OTP", error });
  }
};