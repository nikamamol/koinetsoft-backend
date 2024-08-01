const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  clientSelect: {
    type: String,
    required: true
  },
  campaignName: {
    type: String,
    required: true
  },
  campaignCode: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  campaignType: {
    type: String,
    required: true
  },
  campaignNature: {
    type: String,
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  leadPerDay: {
    type: Number,
    required: true
  },
  voiceLogRequired: {
    type: String,
    required: true
  },
  billingDay: {
    type: Number,
    required: true
  },
  cpl: {
    type: Number,
    required: true
  },
  template: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  revenue: {
    type: Number,
    required: true
  },
  companySize: {
    type: Number,
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  geo: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  note: {
    type: String,
    required: true
  },
  suppressionList: {
    type: String // This can be a URL or file path
  },
  abmList: {
    type: String // This can be a URL or file path
  },
  contactsPerCampaign: {
    type: Boolean,
    default: false
  },
  abmCpc: {
    type: String,
    enum: ['Company', 'Domain', 'State', 'Zipcode'],
    default: 'Company' // Provide a default value if appropriate
  },
  nonAbmCpc: {
    type: String,
    enum: ['Company', 'Domain', 'Zipcode'],
    default: 'Company' // Provide a default value if appropriate
  },
  noOfContacts: {
    type: Number
  },
  industryFilter: {
    type: [String], // Array of strings to handle multiple selections
    default: []
  },
  functionFilter: {
    type: [String], // Array of strings to handle multiple selections
    required: true
  },
  seniorityLevel: {
    type: [String], // Array of strings for multiple seniority levels
    default: []
  },
  employeeSize: {
    type: [String], // Array of strings to handle multiple selections
    default: []
  },
  companyFilter: {
    type: [String], // Array of strings to handle multiple selections
    default: []
  },
  jobTitleFilter: {
    type: [String], // Array of strings to handle multiple selections
    default: []
  },
  revenue: {
    type: [String], // Array of strings to handle multiple revenue options
    default: []
  },
  countryFilter: {
    type: [String], // Array of strings to handle multiple selections
    default: []
  },
  cityFilter: {
    type: [String], // Array of strings to handle multiple selections
    default: []
  },
  zipCodeFilter: {
    type: [String], // Array of strings to handle multiple selections
    default: []
  }
});

module.exports = mongoose.model('Campaign', campaignSchema);
