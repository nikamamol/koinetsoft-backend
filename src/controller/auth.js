const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const AccessUser = require("../model/AccessUser");
require("dotenv").config();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: true, // Enable debug output
  logger: true, // Log information
});

exports.signup = async (req, res) => {
  const { firstName, lastName, email, password, phone, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: "User already exists!" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      username: `${firstName} ${lastName}`, // You can concatenate first and last names for username or adjust as needed
      email,
      password: hashedPassword,
      mobile: phone, // Use phone for mobile
      role, // Include role here
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

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    const expiresIn = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    existingUser.otp = otp;
    existingUser.otpExpires = expiresIn;
    await existingUser.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "amolspatil018@gamil.com",
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP email:", error);
        return res
          .status(500)
          .send({ message: "Error sending OTP email", error });
      } else {
        console.log("Email sent: " + info.response);
        return res
          .status(200)
          .send({ message: "OTP sent successfully", email });
      }
    });
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

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresIn = new Date(Date.now() + 10 * 60 * 1000);

    existingUser.otp = otp;
    existingUser.otpExpires = expiresIn;
    await existingUser.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };

    // Use a promise-based approach for sending email
    transporter.sendMail(mailOptions)
      .then(info => {
        console.log("Email sent: " + info.response);
        return res.status(200).send({ message: "OTP sent successfully" });
      })
      .catch(error => {
        console.error("Error sending OTP email:", error);
        return res.status(500).send({ message: "Error sending OTP email", error });
      });

  } catch (error) {
    console.error("Error during OTP generation:", error);
    return res.status(500).send({ message: "Error sending OTP", error });
  }
};


exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;
  try {
    const existingUser = await User.findOne({ otp });

    if (!existingUser) {
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
      { expiresIn: "1d" } // Token expires in 1 day
    );

    res.cookie("token", jwtToken, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      httpOnly: true,
      sameSite: "lax",
    });

    return res
      .status(200)
      .send({ message: "OTP verified successfully", token: jwtToken });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).send({ message: "Error verifying OTP", error });
  }
};


exports.accessuser = async (req, res) => {
  const { fullname, mobile, email, password, date_of_hiring, designation, supervisor, salary, shift, other_designation } = req.body;

  try {
    const existingUser = await AccessUser.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await AccessUser.create({
      fullname,
      mobile,
      email,
      password: hashedPassword,
      date_of_hiring,
      designation,
      supervisor,
      salary,
      shift,
      other_designation,
    });

    return res.status(201).send({ user });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).send({ message: "Error signing up!", error });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await AccessUser.find(); // Retrieve all users
    return res.status(200).send({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).send({ message: "Error fetching users!", error });
  }
};