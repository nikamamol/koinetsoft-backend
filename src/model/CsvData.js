const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalname: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    content: { type: Buffer }, // Optional: Store file content as binary
    campaignName: { type: String, required: true }, // Add campaign name
    campaignCode: { type: String, required: true }, // Add campaign code
    status: [{
        userType: { type: String, required: true }, // e.g., "Quality", "Email Marketing"
        checked: { type: Boolean, required: true, default: false } // Whether the user has checked the file
    }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Add userId to associate files with users
}, { timestamps: true }); // Enable timestamps

const CompanySchema = mongoose.model("csvfileuploadbyra", CampaignSchema);

module.exports = CompanySchema;