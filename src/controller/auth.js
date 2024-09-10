const User = require("../model/User");
const uplaodCSV = require("../model/CsvData");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const AccessUser = require("../model/AccessUser");
const Vendor = require("../model/InviteVendor");
const Client = require("../model/AddClient");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fastcsv = require("fast-csv");
const CompanySchema = require("../model/CsvData");
const CampaignSchema = require("../model/CampaignSchema");
const Template = require("../model/CreateTemplate");
const authenticateToken = require("../middleware/auth");
const operationCsvFile = require("../model/OperationCsv");
const OperationCsvFile = require("../model/OperationCsv");

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

exports.signup = async(req, res) => {
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

exports.login = async(req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user is already authenticated by verifying the token
        const token = req.headers.authorization;

        if (token) {
            try {
                const decodedToken = jwt.verify(token, process.env.JWT_KEY);
                return res.status(200).send({ message: "User already authenticated", redirectTo: "/dashboard" });
            } catch (err) {
                // Token is invalid, proceed with login
                console.error("Invalid token", err);
            }
        }

        // Continue with login process
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).send({ message: "User not found" });
        }

        const passwordMatched = await bcrypt.compare(password, existingUser.password);

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
            to: email, // Use the user's email
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending OTP email:", error);
                return res.status(500).send({ message: "Error sending OTP email", error });
            } else {
                console.log("Email sent: " + info.response);
                return res.status(200).send({ message: "OTP sent successfully", email });
            }
        });
    } catch (error) {
        return res.status(500).send({ message: "Error logging in!", error });
    }
};

exports.logout = async(req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).send({ message: "logged out successfully!" });
    } catch (error) {
        return res.status(500).send({ message: "Error logging out!", error });
    }
};

exports.sendOtp = async(req, res) => {
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

exports.verifyOtp = async(req, res) => {
    const { otp } = req.body;
    try {
        // Find the user based on OTP
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

        // Generate JWT token with user details
        const jwtToken = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            username: existingUser.username, // Include username in token payload if needed
            role: existingUser.role, // Include username in token payload if needed
        }, process.env.JWT_KEY, { expiresIn: "1d" }); // Token expires in 1 day

        // Send success response with token and username
        return res.status(200).send({
            message: "OTP verified successfully",
            token: jwtToken,
            username: existingUser.username, // Add username to the response
            role: existingUser.role, // Add username to the response
        });

        // Optionally, set the token in cookies if needed
        res.cookie("token", jwtToken, {
            path: "/",
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
            httpOnly: true,
            sameSite: "lax",
        });

    } catch (error) {
        console.error("Error during OTP verification:", error);
        return res.status(500).send({ message: "Error verifying OTP", error });
    }
};


// user section on dashboard
exports.accessuser = async(req, res) => {
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

exports.getAllUsers = async(req, res) => {
    try {
        const users = await AccessUser.find(); // Retrieve all users
        return res.status(200).send({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).send({ message: "Error fetching users!", error });
    }
};

exports.viewUserById = async(req, res) => {
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

exports.updateUser = async(req, res) => {
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

exports.updateUser = async(req, res) => {
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

exports.deleteUserById = async(req, res) => {
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

exports.inviteagency = async(req, res) => {
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

exports.myAgencyData = async(req, res) => {
    try {
        const vendors = await Vendor.find(); // Retrieve all vendors from the database
        res.status(200).json(vendors); // Send the vendors as a JSON response
    } catch (error) {
        console.error("Error fetching vendors:", error);
        res.status(500).json({ message: "Error fetching vendors", error });
    }
};
exports.viewAgencyById = async(req, res) => {
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
        const updatedVendor = await Vendor.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        if (!updatedVendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(200).json({ message: "View Vedor Details", updatedVendor });
    } catch (error) {
        console.error("Error view vendor:", error);
        res.status(500).json({ message: "Error view vendor", error });
    }
};

exports.updateAgency = async(req, res) => {
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
        const updatedVendor = await Vendor.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        if (!updatedVendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res
            .status(200)
            .json({ message: "Vendor updated successfully", updatedVendor });
    } catch (error) {
        console.error("Error updating vendor:", error);
        res.status(500).json({ message: "Error updating vendor", error });
    }
};

exports.deleteAgencyById = async(req, res) => {
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

exports.addClient = async(req, res) => {
    try {
        const newClient = new Client(req.body);
        await newClient.save();
        res.status(201).send(newClient);
    } catch (error) {
        res.status(400).send(error.message);
    }
};
// view client
exports.viewClient = async(req, res) => {
    try {
        const clients = await Client.find();
        res.status(200).send(clients);
    } catch (error) {
        res.status(400).send(error.message);
    }
};
// view client details with id
exports.viewClientDetails = async(req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        res.status(200).send(client);
    } catch (error) {
        res.status(400).send(error.message);
    }
};
// update client
exports.updateClient = async(req, res) => {
    try {
        const updatedClient = await Client.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true }
        );
        res.status(200).send(updatedClient);
    } catch (error) {
        res.status(400).send(error.message);
    }
};
exports.deleteClient = async(req, res) => {
    try {
        const deletedClient = await Client.findByIdAndDelete(req.params.id);
        res.status(200).send(deletedClient);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Destination folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

// Multer upload middleware
const upload = multer({ storage: storage }).single("file");
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).send({ message: "No token provided." });
    }

    const actualToken = token.split(" ")[1]; // Split to get the actual token after 'Bearer'

    jwt.verify(actualToken, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized! Invalid token." });
        }

        req.userId = decoded.id;
        next();
    });
};

exports.uploadCsv = [
    upload,
    async(req, res) => {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) {
                return res.status(401).send({ message: "Unauthorized. Token required." });
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).send({ message: "Unauthorized. Token missing." });
            }

            jwt.verify(token, process.env.JWT_KEY, async(err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: "Unauthorized. Invalid token." });
                }

                const userId = decoded.userId;
                // console.log(userId);
                await handleFileUpload(req, res, userId);
            });
        } catch (error) {
            console.error("Error in token validation:", error);
            res.status(500).send({ message: "Internal server error during token validation", error });
        }
    },
];

async function handleFileUpload(req, res, userId) {
    try {
        const { campaignName, campaignCode } = req.body;

        if (!req.file) {
            return res.status(400).send({ message: "No file uploaded." });
        }

        if (!campaignName || !campaignCode) {
            return res.status(400).send({ message: "Missing campaign name or campaign code." });
        }

        const file = req.file;

        if (!file.filename || !file.originalname || !file.mimetype || !file.size || !file.path) {
            return res.status(400).send({ message: "Incomplete file metadata." });
        }

        let fileContent;
        try {
            fileContent = fs.readFileSync(file.path);
        } catch (readError) {
            console.error("Error reading file content:", readError);
            return res.status(500).send({ message: "Error reading file content", error: readError });
        }

        const newFile = new CompanySchema({
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            content: fileContent,
            campaignName,
            campaignCode,
            status: [
                { userType: "Employee", checked: true },
                { userType: "Quality", checked: false },
                { userType: "Email Marketing", checked: false },
            ],
            userId,
        });

        await newFile.save();

        res.status(200).send({
            message: "File uploaded and stored successfully",
            file: newFile,
        });
    } catch (error) {
        console.error("Error uploading or storing file:", error);
        res.status(500).send({ message: "Internal server error during file upload or storage", error });
    }
}


exports.updateStatus = [
    async(req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validate the input
            if (!Array.isArray(status)) {
                return res
                    .status(400)
                    .send({ message: "Invalid status format. It should be an array." });
            }
            // Fetch the document by ID
            const campaign = await CompanySchema.findById(id);

            if (!campaign) {
                return res.status(404).send({ message: "Campaign not found." });
            }
            // Update the status field
            campaign.status = status;

            // Save the updated document
            await campaign.save();

            res.status(200).send({
                message: "Status updated successfully",
                campaign,
            });
        } catch (error) {
            console.error("Error updating status:", error);
            res.status(500).send({ message: "Error updating status", error });
        }
    },
];


exports.deleteFile = [authenticateToken, async(req, res) => {
    try {
        const { id } = req.params;

        // Find the file by ID
        const file = await CompanySchema.findById(id);
        if (!file) {
            return res.status(404).send({ message: "File not found." });
        }

        // Get the file path and ensure it's absolute
        const filePath = path.resolve(file.path);

        // Check if file exists before attempting to delete
        fs.access(filePath, fs.constants.F_OK, async(err) => {
            if (err) {
                console.error("File not found at path:", filePath);
                return res.status(404).send({ message: "File not found on filesystem" });
            }

            try {
                // Delete the file document from the database
                await CompanySchema.findByIdAndDelete(id);

                // Delete the file from the server's filesystem
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error("Error deleting file from filesystem:", unlinkErr);
                        return res.status(500).send({
                            message: "File deleted from DB, but error removing it from filesystem",
                            error: unlinkErr,
                        });
                    }
                    res.status(200).send({ message: "File deleted successfully" });
                });
            } catch (deleteErr) {
                console.error("Error deleting file from database:", deleteErr);
                res.status(500).send({ message: "Error deleting file from DB", error: deleteErr });
            }
        });
    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).send({ message: "Error deleting file", error });
    }
}];


const authenticateToken1 = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized. Token required." });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: "Unauthorized. Token missing." });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized. Invalid token." });
        }

        // Attach userId to the request object
        req.userId = decoded.userId;
        next();
    });
};

exports.getCsvByRAFiles = [
    authenticateToken1, // Use the token verification middleware
    async(req, res) => {
        try {
            // Extract userId from the request object (assuming it's set in authenticateToken middleware)
            const { userId } = req;

            // console.log("userId", userId);
            // Find files associated with the userId
            const files = await CompanySchema.find({ userId });

            if (!files || files.length === 0) {
                return res.status(404).send({ message: "No files found for this user." });
            }

            res.status(200).send({
                message: "Files retrieved successfully",
                files,
            });
        } catch (error) {
            console.error("Error retrieving files:", error);
            res.status(500).send({ message: "Error retrieving files", error });
        }
    },
];



exports.getCsvFiles = [
    verifyToken, // Add token verification middleware here
    async(req, res) => {
        try {
            const files = await CompanySchema.find();

            if (!files || files.length === 0) {
                return res.status(404).send({ message: "No files found." });
            }

            res.status(200).send({
                message: "Files retrieved successfully",
                files: files,
            });
        } catch (error) {
            console.error("Error retrieving files:", error);
            res.status(500).send({ message: "Error retrieving files", error });
        }
    },
];


exports.getExcelFiles = async(req, res) => {
    const { fileId } = req.params;
    const filePath = path.join(__dirname, 'uploads', `${fileId}.xlsx`); // Adjust the path as necessary

    if (fs.existsSync(filePath)) {
        try {
            // Read the Excel file
            const workbook = xlsx.readFile(filePath);
            const sheetNames = workbook.SheetNames;

            for (const sheetName of sheetNames) {
                const sheet = workbook.Sheets[sheetName];
                const sheetData = xlsx.utils.sheet_to_json(sheet);

                // Save each sheet's data to MongoDB
                const excelData = new CompanySchema({
                    fileName: fileId,
                    sheetName,
                    data: sheetData
                });
                await excelData.save();
            }

            res.status(200).json({ success: true, message: 'Excel data saved to database' });
        } catch (error) {
            console.error('Error processing the Excel file:', error);
            res.status(500).json({ success: false, message: 'Error processing the Excel file' });
        }
    } else {
        res.status(404).json({ success: false, message: 'File not found' });
    }
};
// GET API to retrieve a specific CSV file by ID

exports.getCsvFileById = [
    verifyToken, // Add token verification middleware if needed
    async(req, res) => {
        try {
            const fileId = req.params.id;
            const file = await CompanySchema.findById(fileId);

            if (!file) {
                return res.status(404).send({ message: "File not found." });
            }

            // Check if the content is stored in the database
            if (file.content && file.content.length > 0) {
                res.setHeader("Content-Type", file.mimetype);
                res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
                return res.send(file.content);
            }

            // Check if the file path is stored and the file exists on the filesystem
            if (file.path && fs.existsSync(file.path)) {
                res.setHeader("Content-Type", file.mimetype);
                res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
                return fs.createReadStream(file.path).pipe(res);
            }

            // If neither the content nor the path is available
            return res.status(404).send({ message: "File content not found." });
        } catch (error) {
            console.error("Error retrieving file:", error);
            return res.status(500).send({ message: "Error retrieving file", error });
        }
    },
];

exports.downloadCsvFileById = [
    verifyToken, // Add token verification middleware if needed
    async(req, res) => {
        try {
            const fileId = req.params.id;
            const file = await CompanySchema.findById(fileId);

            if (!file) {
                return res.status(404).send({ message: "File not found." });
            }

            // Check if the content is stored in the database
            if (file.content && file.content.length > 0) {
                res.setHeader("Content-Type", "text/csv");
                res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
                return res.send(file.content);
            }

            // Check if the file path is stored and the file exists on the filesystem
            if (file.path && fs.existsSync(file.path)) {
                res.setHeader("Content-Type", "text/csv");
                res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
                return fs.createReadStream(file.path).pipe(res);
            }

            // If neither the content nor the path is available
            return res.status(404).send({ message: "File content not found." });
        } catch (error) {
            console.error("Error retrieving file:", error);
            return res.status(500).send({ message: "Error retrieving file", error });
        }
    },
];
// File update route

exports.updateCsvFileById = [
    verifyToken,
    async(req, res) => {
        try {
            const fileId = req.params.id;
            const { originalname, mimetype, buffer } = req.file || {};
            const { filePath } = req.body || {};

            // Find the file by ID
            const file = await CompanySchema.findById(fileId);
            // console.log(filePath)
            // console.log(file)
            // console.log(fileId)
            if (!file) {
                return res.status(404).json({ message: "File not found." });
            }

            // Update file metadata
            if (originalname) file.originalname = originalname;
            if (mimetype) file.mimetype = mimetype;

            // Update file content if buffer is provided
            if (buffer) {
                file.content = buffer; // Update in-memory content

                // Save to filesystem if a path is provided
                if (filePath) {
                    // Ensure directory exists
                    const dir = path.dirname(filePath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }

                    // Write buffer to the specified file path
                    fs.writeFileSync(filePath, buffer);
                    file.path = filePath; // Update the path in the database
                }
            }

            // Save the updated file metadata and content to the database
            const updatedFile = await file.save();

            res.status(200).json({ message: "File updated successfully.", file: updatedFile });
        } catch (error) {
            console.error("Error updating file:", error);
            res.status(500).json({ message: "Error updating file", error: error.message });
        }
    }
];

// operation team upload file 

exports.uploadOperationCsvFile = [
    upload, // Expecting a single file with field name 'file'
    async(req, res) => {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) {
                return res.status(401).send({ message: "Unauthorized. Token required." });
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).send({ message: "Unauthorized. Token missing." });
            }

            jwt.verify(token, process.env.JWT_KEY, async(err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: "Unauthorized. Invalid token." });
                }

                const userId = decoded.userId;
                await handleFileUploadByOperation(req, res, userId);
            });
        } catch (error) {
            console.error("Error in token validation:", error);
            res.status(500).send({ message: "Internal server error during token validation", error });
        }
    },
];

async function handleFileUploadByOperation(req, res, userId) {
    try {
        const { campaignName, campaignCode } = req.body;

        if (!req.file) {
            return res.status(400).send({ message: "No file uploaded." });
        }

        if (!campaignName || !campaignCode) {
            return res.status(400).send({ message: "Missing campaign name or campaign code." });
        }

        const file = req.file;

        // Read file content
        let fileContent;
        try {
            fileContent = fs.readFileSync(file.path);
        } catch (readError) {
            console.error("Error reading file content:", readError);
            return res.status(500).send({ message: "Error reading file content", error: readError });
        }

        // Create a new document in the database
        const newFile = new OperationCsvFile({
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            content: fileContent,
            campaignName,
            campaignCode,
            userId,
        });

        await newFile.save();

        res.status(200).send({
            message: "File uploaded and stored successfully",
            file: newFile,
        });
    } catch (error) {
        console.error("Error uploading or storing file:", error);
        res.status(500).send({ message: "Internal server error during file upload or storage", error });
    }
}

exports.getCsvFilesByOperation = [
    authenticateToken1, // Add token verification middleware here
    async(req, res) => {
        const { userId } = req;
        try {
            const files = await OperationCsvFile.find({ userId });

            // if (!files || files.length === 0) {
            //     return res.status(404).send({ message: "No files found." });
            // }

            res.status(200).send({
                message: "Files retrieved successfully",
                files: files,
            });
        } catch (error) {
            console.error("Error retrieving files:", error);
            res.status(500).send({ message: "Error retrieving files", error });
        }
    },
];

exports.getCsvFilesByOperationAll = [
    authenticateToken1,
    async(req, res) => {
        try {
            const files = await OperationCsvFile.find(); // Fetch all files

            if (!files || files.length === 0) {
                return res.status(404).send({ message: 'No files found.' });
            }

            res.status(200).send({
                message: 'Files retrieved successfully',
                files: files, // Ensure 'files' is the key expected by the frontend
            });
        } catch (error) {
            console.error('Error retrieving files:', error);
            res.status(500).send({ message: 'Error retrieving files', error });
        }
    },
];

exports.getCsvFileByIdOperation = [
    verifyToken, // Ensure the user is authenticated
    async(req, res) => {
        try {
            const { id } = req.params; // Get the file ID from request parameters

            const file = await OperationCsvFile.findById(id); // Fetch the file by ID

            if (!file) {
                return res.status(404).send({ message: 'File not found.' });
            }

            // Assuming the file content is stored as binary data in 'file.content'
            res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
            res.setHeader('Content-Type', file.mimetype); // Set MIME type if available
            res.send(file.content); // Send the file content directly

        } catch (error) {
            console.error('Error retrieving file:', error);
            res.status(500).send({ message: 'Error retrieving file', error });
        }
    }
];
// create campaign

const campaignStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/"); // Directory to save uploaded files
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append date to filename
    },
});

const uploadCampaign = multer({ storage: campaignStorage });

exports.createCampaign = [
    uploadCampaign.fields([
        { name: "assets", maxCount: 10 },
        { name: "script", maxCount: 10 },
        { name: "suppression", maxCount: 10 },
        { name: "tal", maxCount: 10 },
        { name: "suppressionList", maxCount: 10 },
        { name: "abmList", maxCount: 10 },
    ]),
    async(req, res) => {
        try {
            // Create campaign document
            const campaign = new CampaignSchema({
                ...req.body,
                assets: req.files["assets"] ?
                    req.files["assets"].map((file) => ({
                        name: file.filename,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        path: file.path,
                    })) : [],
                script: req.files["script"] ?
                    req.files["script"].map((file) => ({
                        name: file.filename,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        path: file.path,
                    })) : [],
                suppression: req.files["suppression"] ?
                    req.files["suppression"].map((file) => ({
                        name: file.filename,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        path: file.path,
                    })) : [],
                tal: req.files["tal"] ?
                    req.files["tal"].map((file) => ({
                        name: file.filename,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        path: file.path,
                    })) : [],
                suppressionList: req.files["suppressionList"] ?
                    req.files["suppressionList"].map((file) => ({
                        name: file.filename,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        path: file.path,
                    })) : [],
                abmList: req.files["abmList"] ?
                    req.files["abmList"].map((file) => ({
                        name: file.filename,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        path: file.path,
                    })) : [],
            });

            // Save campaign
            const savedCampaign = await campaign.save();
            res.status(201).json(savedCampaign);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
];

// get all campaign data
exports.getAllCampaigns = async(req, res) => {
    try {
        // Retrieve all campaigns from the database
        const campaigns = await CampaignSchema.find();
        // Respond with the retrieved campaigns
        res.status(200).json(campaigns);
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        res.status(500).json({ message: "Error fetching campaigns", error });
    }
};

// Update a specific campaign by ID
exports.updateCampaignById = [
    uploadCampaign.fields([
        { name: "assets", maxCount: 10 },
        { name: "script", maxCount: 10 },
        { name: "suppression", maxCount: 10 },
        { name: "tal", maxCount: 10 },
        { name: "suppressionList", maxCount: 10 },
        { name: "abmList", maxCount: 10 },
    ]),
    async(req, res) => {
        try {
            const { id } = req.params;
            const updateData = {
                ...req.body,
                assets: req.files["assets"] ?
                    req.files["assets"].map((file) => ({
                        name: file.filename,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        path: file.path,
                    })) : undefined,
                script: req.files["script"] ?
                    req.files["script"].map((file) => ({
                        name: file.filename,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        path: file.path,
                    })) : undefined,
                suppression: req.files["suppression"] ?
                    req.files["suppression"].map((file) => ({
                        name: file.filename,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        path: file.path,
                    })) : undefined,
                tal: req.files["tal"] ?
                    req.files["tal"].map((file) => ({
                        name: file.filename,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        path: file.path,
                    })) : undefined,
                suppressionList: req.files["suppressionList"] ?
                    req.files["suppressionList"].map((file) => ({
                        name: file.filename,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        path: file.path,
                    })) : undefined,
                abmList: req.files["abmList"] ?
                    req.files["abmList"].map((file) => ({
                        name: file.filename,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        path: file.path,
                    })) : undefined,
            };

            // Remove undefined fields from updateData
            Object.keys(updateData).forEach(
                (key) => updateData[key] === undefined && delete updateData[key]
            );

            // Find and update the campaign
            const updatedCampaign = await CampaignSchema.findByIdAndUpdate(
                id,
                updateData, { new: true }
            );

            if (!updatedCampaign) {
                return res.status(404).json({ message: "Campaign not found" });
            }

            // Respond with the updated campaign
            res.status(200).json(updatedCampaign);
        } catch (error) {
            console.error("Error updating campaign:", error);
            res.status(500).json({ message: "Error updating campaign", error });
        }
    },
];

exports.getCampaignById = async(req, res) => {
    try {
        const { id } = req.params; // Extract the campaign ID from the request parameters

        // Find the campaign by ID
        const campaign = await CampaignSchema.findById(id);

        if (!campaign) {
            // If no campaign is found, respond with a 404 status and an error message
            return res.status(404).json({ message: "Campaign not found" });
        }

        // Respond with the found campaign details
        res.status(200).json(campaign);
    } catch (error) {
        console.error("Error fetching campaign details:", error);
        res.status(500).json({ message: "Error fetching campaign details", error });
    }
};


exports.downloadCampaignFile = async(req, res) => {
    const { id } = req.params;
    // Fetch the file from the database using the fileId
    const fileData = await CampaignSchema.findById(id);

    if (!fileData) {
        return res.status(404).send('File not found');
    }

    // Set appropriate headers
    res.set({
        'Content-Type': fileData.mimeType,
        'Content-Disposition': `attachment; filename="${fileData.originalName}"`,
    });

    // Send the file as response
    res.send(fileData.data); // Assuming the file data is stored in a buffer
}

exports.addTemplate = async(req, res) => {
    try {
        const newTemplate = new Template(req.body);
        await newTemplate.save();
        res.status(201).send(newTemplate);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.getTemplates = async(req, res) => {
    try {
        const templates = await Template.find(); // Fetch all templates
        res.status(200).json(templates); // Send the templates as a JSON response
    } catch (error) {
        res.status(500).send(error.message); // Handle any errors
    }
};

exports.getTemplateById = async(req, res) => {
    try {
        const templateId = req.params.id;
        const template = await Template.findById(templateId); // Fetch template by ID

        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        res.status(200).json(template); // Send the template as a JSON response
    } catch (error) {
        res.status(500).send(error.message); // Handle any errors
    }
};

// upload csv file in campaign
// *************************************************************************************************