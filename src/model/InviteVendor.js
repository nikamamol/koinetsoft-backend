const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  company_name: {
    type: String,
    required: true
  },
  company_type: {
    type: String,
    required: true
  },
  vendor_profile: {
    type: String,
    required: true
  },
  agency_id: {
    type: Number,
    required: true
  },
  country: {
    type: Number,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  primary_first_name: {
    type: String,
    required: true
  },
  primary_last_name: {
    type: String,
    required: true
  },
  primary_phone_no: {
    type: String,
    required: true
  },
  primary_email: {
    type: String,
    required: true
  },
  primary_designation: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  secondary_first_name: {
    type: String
  },
  secondary_last_name: {
    type: String
  },
  secondary_phone_no: {
    type: String
  },
  secondary_email: {
    type: String
  },
  secondary_designation: {
    type: String
  }
});

const Vendor = mongoose.model('InviteAgency', VendorSchema);

module.exports = Vendor;
