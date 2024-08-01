const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  content: { type: Buffer }, // Optional: Store file content as a binary
});

const CompanySchema = mongoose.model("csvfileuploadbyra", CampaignSchema);

module.exports = CompanySchema;
