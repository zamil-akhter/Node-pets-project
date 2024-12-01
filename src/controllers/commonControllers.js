const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { sendCatchError, sendSuccess } = require("../utils/responseHandler");

const generateOtp = async () => {
  let digits = "123456789";
  let OTP = "";
  let len = digits.length;
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * len)];
  }
  return OTP;
};

const sendEmail = async (otpMailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAILID,
        pass: process.env.GMAILPASSWORD,
      },
    });

    const mailOptions = otpMailOptions;

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (e) {
    console.log('Error, ', e.message);
  }
};

const sendResetLink = async (token) => {
  try {
    const resetLink = `http://localhost:8000/user/renderResetPassword/${token}`;
    const email = jwt.verify(token, process.env.SECRET_KEY);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAILID,
        pass: process.env.GMAILPASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAILID,
      to: email,
      subject: "Password Reset",
      html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <p>Dear User,</p>
              <p>We received a request to reset your password. Click the link below to reset it:</p>
              <p><a href="${resetLink}" style="color: #1a73e8;">Click here to reset your password</a></p>
              <p>Thank you,</p>
              <p>Zamil Akhter</p>
            </div>
            `,
    };

    const info = await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return "Error sending email";
      }
    });
    return info;
  } catch (error) {
    return sendCatchError(res, error);
  }
};

const ensureFolderExists = async (folderName, folderPath) => {
  try {
    await fs.access(folderPath);
  } catch (err) {
    console.log(`${folderName} folder does not exist. so creating it...`);
    await fs.mkdir(folderPath, { recursive: true });
    console.log(`${folderName} Folder created successfully at: ${folderPath}`);
  }
};

module.exports = {
  generateOtp,
  sendEmail,
  sendResetLink,
  ensureFolderExists
};
