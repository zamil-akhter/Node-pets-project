const mongoose = require("mongoose");

const userEmail = new mongoose.Schema(
  {
    email: String,
    otp: Number,
    otpExpireDate: {
      type: Date,
      default: new Date(Date.now()+24*60*60*1000)
    },
  },
  { timestamps: true }
);

const emailWithOtp = mongoose.model("emailWithOtp", userEmail);
module.exports = emailWithOtp;
