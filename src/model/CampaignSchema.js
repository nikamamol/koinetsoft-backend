const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
    clientSelect: String,
    campaignName: String,
    campaignCode: String,
    startDate: Date,
    endDate: Date,
    campaignType: String,
    campaignNature: String,
    target: Number,
    leadPerDay: Number,
    voiceLogRequired: String,
    billingDay: Number,
    cpl: Number,
    template: String,
    supervisor: String,
    supervisorTarget: Number,
    name: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
    revenue: String,
    companySize: Number,
    jobTitle: String,
    geo: String,
    industry: String,
    note: String,
    abmCpc: String,
    nonAbmCpc: String,
    noOfContacts: Number,
    deliveryType: String,
    deliveryDays: String,
    assets: [{
        name: { type: String },
        originalname: { type: String },
        mimetype: { type: String },
        size: { type: Number },
        path: { type: String },
        content: { type: Buffer },
    }],
    script: [{
        name: { type: String },
        originalname: { type: String },
        mimetype: { type: String },
        size: { type: Number },
        path: { type: String },
        content: { type: Buffer },
    }],
    suppression: [{
        filename: { type: String },
        originalname: { type: String },
        mimetype: { type: String },
        size: { type: Number },
        path: { type: String },
        content: { type: Buffer },
    }],
    tal: [{
        name: { type: String },
        originalname: { type: String },
        mimetype: { type: String },
        size: { type: Number },
        path: { type: String },
        content: { type: Buffer },
    }],
    suppressionList: [{
        name: { type: String },
        originalname: { type: String },
        mimetype: { type: String },
        size: { type: Number },
        path: { type: String },
        content: { type: Buffer },
    }],
    abmList: [{
        name: { type: String },
        originalname: { type: String },
        mimetype: { type: String },
        size: { type: Number },
        path: { type: String },
        content: { type: Buffer },
    }],
    campaignStatus: {
        type: String,
        enum: [
            "Active",
            // "Paused",
            "Completed",
            // "Cancelled",
            "New",
            "Expired",
            // "Ongoing",
            // "Closed",
            // "Upcoming",
        ],
        default: "New",
    },
});

module.exports = mongoose.model("Campaign", campaignSchema);