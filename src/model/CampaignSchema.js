const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  clientSelect: {
    type: String,
    required: false
  },
  campaignName: {
    type: String,
    required: false
  },
  campaignCode: {
    type: String,
    required: false
  },
  startDate: {
    type: Date,
    required: false
  },
  endDate: {
    type: Date,
    required: false
  },
  campaignType: {
    type: String,
    required: false
  },
  campaignNature: {
    type: String,
    required: false
  },
  target: {
    type: Number,
    required: false
  },
  leadPerDay: {
    type: Number,
    required: false
  },
  voiceLogRequired: {
    type: String,
    required: false
  },
  billingDay: {
    type: Number,
    required: false
  },
  cpl: {
    type: Number,
    required: false
  },
  template: {
    type: String,
    required: false
  },
  supervisor: {
    type: String,
    required: false
  },
  supervisorTarget: {
    type: Number,
    required: false
  },
  name: {
    type: String,
    required: false
  },
  originalName: {
    type: String,
    required: false
  },
  mimeType: {
    type: String,
    required: false
  },
  size: {
    type: Number,
    required: false
  },
  path: {
    type: String,
    required: false
  },
  revenue: {
    type: [String], // Changed to an array of strings
    default: [],
    required: false
  },
  companySize: {
    type: Number,
    required: false
  },
  jobTitle: {
    type: String,
    required: false
  },
  geo: {
    type: String,
    required: false
  },
  industry: {
    type: String,
    required: false
  },
  note: {
    type: String,
    required: false
  },
  suppressionList: {
    type: String, // This can be a URL or file path
    required: false
  },
  abmList: {
    type: String, // This can be a URL or file path
    required: false
  },
  contactsPerCampaign: {
    type: Boolean,
    default: false,
    required: false
  },
  abmCpc: {
    type: String,
    enum: ['Company', 'Domain', 'State', 'Zipcode'],
    default: 'Company', // Provide a default value if appropriate
    required: false
  },
  nonAbmCpc: {
    type: String,
    enum: ['Company', 'Domain', 'Zipcode'],
    default: 'Company', // Provide a default value if appropriate
    required: false
  },
  noOfContacts: {
    type: Number,
    required: false
  },
  industryFilter: {
    type: [String], // Array of strings to handle multiple selections
    default: [],
    required: false
  },
  functionFilter: {
    type: [String], // Array of strings to handle multiple selections
    default: [],
    required: false
  },
  seniorityLevel: {
    type: [String], // Array of strings for multiple seniority levels
    default: [],
    required: false
  },
  employeeSize: {
    type: [String], // Array of strings to handle multiple selections
    default: [],
    required: false
  },
  companyFilter: {
    type: [String], // Array of strings to handle multiple selections
    default: [],
    required: false
  },
  jobTitleFilter: {
    type: [String], // Array of strings to handle multiple selections
    default: [],
    required: false
  },
  revenueFilter: {
    type: [String], // Array of strings to handle multiple revenue options
    default: [],
    required: false
  },
  countryFilter: {
    type: [String], // Array of strings to handle multiple selections
    default: [],
    required: false
  },
  cityFilter: {
    type: [String], // Array of strings to handle multiple selections
    default: [],
    required: false
  },
  zipCodeFilter: {
    type: [String], // Array of strings to handle multiple selections
    default: [],
    required: false
  }
});

module.exports = mongoose.model('Campaign', campaignSchema);