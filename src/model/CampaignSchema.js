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
  revenue: [String],
  companySize: Number,
  jobTitle: String,
  geo: String,
  industry: String,
  note: String,
  abmCpc:String,
  nonAbmCpc:String,
  noOfContacts:Number,
  suppressionList: [Object],
  abmList: [Object],
  // Additional fields here...
  assets: [
    {
      name: String,
      originalName: String,
      mimeType: String,
      size: Number,
      path: String,
    },
  ],
  script: [
    {
      name: String,
      originalName: String,
      mimeType: String,
      size: Number,
      path: String,
    },
  ],
  suppression: [
    {
      name: String,
      originalName: String,
      mimeType: String,
      size: Number,
      path: String,
    },
  ],
  campaignStatus: {
    type: String,
    enum: ["Active", "Paused", "Completed", "Cancelled","Ongoing","Closed"], // Add all the desired statuses here
    default: "Active", 
  },
  tal: [
    {
      name: String,
      originalName: String,
      mimeType: String,
      size: Number,
      path: String,
    },
  ],
  suppressionList: [
    {
      name: String,
      originalName: String,
      mimeType: String,
      size: Number,
      path: String,
    },
  ],
  abmList: [
    {
      name: String,
      originalName: String,
      mimeType: String,
      size: Number,
      path: String,
    },
  ],
});

module.exports = mongoose.model("Campaign", campaignSchema);
