const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const AccessUser = require("../model/AccessUser");
const Vendor = require("../model/InviteVendor");
const Client = require("../model/AddClient");
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
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent: " + info.response);
        return res.status(200).send({ message: "OTP sent successfully" });
      })
      .catch((error) => {
        console.error("Error sending OTP email:", error);
        return res
          .status(500)
          .send({ message: "Error sending OTP email", error });
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

// user section on dashboard
exports.accessuser = async (req, res) => {
  const {
    fullname,
    mobile,
    email,
    password,
    date_of_hiring,
    designation,
    supervisor,
    salary,
    shift,
    other_designation,
  } = req.body;

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

exports.viewUserById = async (req, res) => {
  // Validate user ID
  if (!res) {
    return res.status(400).send({ message: "Invalid user ID" });
  }

  const { id } = req.params;

  try {
    const user = await AccessUser.findById(id).select("-password"); // Exclude password from the response
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    return res.status(200).send({ user });
  } catch (error) {
    return handleError(res, error, "Error fetching user details");
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    fullname,
    mobile,
    password,
    date_of_hiring,
    designation,
    supervisor,
    salary,
    shift,
    other_designation,
  } = req.body;

  try {
    const existingUser = await AccessUser.findById(id);
    if (!existingUser) {
      return res.status(404).send({ message: "User not found!" });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash(password, salt);
    }

    existingUser.fullname = fullname || existingUser.fullname;
    existingUser.mobile = mobile || existingUser.mobile;
    existingUser.date_of_hiring = date_of_hiring || existingUser.date_of_hiring;
    existingUser.designation = designation || existingUser.designation;
    existingUser.supervisor = supervisor || existingUser.supervisor;
    existingUser.salary = salary || existingUser.salary;
    existingUser.shift = shift || existingUser.shift;
    existingUser.other_designation =
      other_designation || existingUser.other_designation;

    const updatedUser = await existingUser.save();

    return res.status(200).send({ user: updatedUser });
  } catch (error) {
    console.error("Error during user update:", error);
    return res.status(500).send({ message: "Error updating user!", error });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    fullname,
    mobile,
    password,
    date_of_hiring,
    designation,
    supervisor,
    salary,
    shift,
    other_designation,
  } = req.body;

  try {
    // Find the existing user by ID
    const existingUser = await AccessUser.findById(id);
    if (!existingUser) {
      return res.status(404).send({ message: "User not found!" });
    }

    // If a new password is provided, hash it before saving
    if (password) {
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash(password, salt);
    }

    // Update the user details
    existingUser.fullname = fullname || existingUser.fullname;
    existingUser.mobile = mobile || existingUser.mobile;
    existingUser.date_of_hiring = date_of_hiring || existingUser.date_of_hiring;
    existingUser.designation = designation || existingUser.designation;
    existingUser.supervisor = supervisor || existingUser.supervisor;
    existingUser.salary = salary || existingUser.salary;
    existingUser.shift = shift || existingUser.shift;
    existingUser.other_designation =
      other_designation || existingUser.other_designation;

    // Save the updated user data
    const updatedUser = await existingUser.save();

    // Return the updated user
    return res.status(200).send({ user: updatedUser });
  } catch (error) {
    console.error("Error during user update:", error);
    return res.status(500).send({ message: "Error updating user!", error });
  }
};

exports.deleteUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await AccessUser.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    return res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    return handleError(res, error, "Error deleting user");
  }
};

exports.inviteagency = async (req, res) => {
  const {
    company_name,
    company_type,
    vendor_profile,
    agency_id,
    country,
    state,
    city,
    pincode,
    address,
    primary_first_name,
    primary_last_name,
    primary_phone_no,
    primary_email,
    primary_designation,
    password,
    secondary_first_name,
    secondary_last_name,
    secondary_phone_no,
    secondary_email,
    secondary_designation,
  } = req.body;

  // Optional: Add validation with Joi here if needed

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newVendor = new Vendor({
      company_name,
      company_type,
      vendor_profile,
      agency_id,
      country,
      state,
      city,
      pincode,
      address,
      primary_first_name,
      primary_last_name,
      primary_phone_no,
      primary_email,
      primary_designation,
      password: hashedPassword,
      secondary_first_name,
      secondary_last_name,
      secondary_phone_no,
      secondary_email,
      secondary_designation,
    });

    await newVendor.save(); // Save the instance
    res.status(201).json({ message: "Vendor added successfully!" });
  } catch (error) {
    console.error("Error adding vendor:", error);
    res.status(500).json({ message: "Error adding vendor", error });
  }
};

exports.myAgencyData = async (req, res) => {
  try {
    const vendors = await Vendor.find(); // Retrieve all vendors from the database
    res.status(200).json(vendors); // Send the vendors as a JSON response
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Error fetching vendors", error });
  }
};
exports.viewAgencyById = async (req, res) => {
  const { id } = req.params; // Agency ID to update
  const {
    company_name,
    company_type,
    vendor_profile,
    country,
    state,
    city,
    pincode,
    address,
    primary_first_name,
    primary_last_name,
    primary_phone_no,
    primary_email,
    primary_designation,
    secondary_first_name,
    secondary_last_name,
    secondary_phone_no,
    secondary_email,
    secondary_designation,
  } = req.body;

  try {
    const updateData = {
      company_name,
      company_type,
      vendor_profile,
      country,
      state,
      city,
      pincode,
      address,
      primary_first_name,
      primary_last_name,
      primary_phone_no,
      primary_email,
      primary_designation,
      secondary_first_name,
      secondary_last_name,
      secondary_phone_no,
      secondary_email,
      secondary_designation,
    };

    // Update the vendor details in the database
    const updatedVendor = await Vendor.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({ message: "View Vedor Details", updatedVendor });
  } catch (error) {
    console.error("Error view vendor:", error);
    res.status(500).json({ message: "Error view vendor", error });
  }
};

exports.updateAgency = async (req, res) => {
  const { id } = req.params; // Agency ID to update
  const {
    company_name,
    company_type,
    vendor_profile,
    country,
    state,
    city,
    pincode,
    address,
    primary_first_name,
    primary_last_name,
    primary_phone_no,
    primary_email,
    primary_designation,
    secondary_first_name,
    secondary_last_name,
    secondary_phone_no,
    secondary_email,
    secondary_designation,
  } = req.body;

  // Optional: Add validation with Joi here if needed
  if (!id) {
    return res.status(400).json({ message: "Invalid agency ID" });
  }

  try {
    const updateData = {
      company_name,
      company_type,
      vendor_profile,
      country,
      state,
      city,
      pincode,
      address,
      primary_first_name,
      primary_last_name,
      primary_phone_no,
      primary_email,
      primary_designation,
      secondary_first_name,
      secondary_last_name,
      secondary_phone_no,
      secondary_email,
      secondary_designation,
    };

    // Update the vendor details in the database
    const updatedVendor = await Vendor.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({ message: "Vendor updated successfully", updatedVendor });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ message: "Error updating vendor", error });
  }
};

exports.deleteAgencyById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Vendor.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send({ message: "Vendor not found" });
    }
    return res.status(200).send({ message: "Vendor deleted successfully" });
  } catch (error) {
    return handleError(res, error, "Error deleting Vendor");
  }
};

// billing
// add client

exports.addClient= async (req, res) => {
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.status(201).send(newClient);
  } catch (error) {
    res.status(400).send(error.message);
  }
};
// view client
exports.viewClient = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).send(clients);
  } catch (error) {
    res.status(400).send(error.message);
  }
};
// view client details with id 
exports.viewClientDetails = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    res.status(200).send(client);
  } catch (error) {
    res.status(400).send(error.message);
  }

}
// update client
exports.updateClient = async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send(updatedClient);
  } catch (error) {
    res.status(400).send(error.message);
  }
}
exports.deleteClient = async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    res.status(200).send(deletedClient);
  } catch (error) {
    res.status(400).send(error.message);
  }

}