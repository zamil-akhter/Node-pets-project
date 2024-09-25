const userSchema = require("../models/userSchema");
const userAlbumSchema = require("../models/userAlbumSchema");
const emailOtpSchema = require("../models/emailOtpSchema");
const userLocationSchema = require("../models/userLocationSchema");
const petSchema = require("../models/petSchema");
const mongoose = require("mongoose");
const {
  sendSuccess,
  sendSuccessWithData,
  sendError,
  sendUnauthorizeError,
  sendCatchError,
} = require("../utils/responseHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenManager = require("../auth/tokenManager");
const commonController = require("./commonControllers");

const sendOtpOnMail = async (req, res) => {
  try {
    const { email } = req.params;

    const otp = await commonController.generateOtp();
    const info = await commonController.sendOtpOnEmail(email, otp);
    const checkEmailExists = await emailOtpSchema.findOne({ email: email });
    // const time = moment().add(5,'minutes').format('x');

    if (checkEmailExists) {
      await emailOtpSchema.findOneAndUpdate(
        { email: email },
        {
          otp: otp,
          otpExpireDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }
      );
    } else {
      await emailOtpSchema.create({
        email,
        otp,
      });
    }
    return sendSuccess(res, "Otp sent successfully");
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const signUp = async (req, res) => {
  try {
    const { fullName, email, emailotp, phoneNumber, gender, password } =
      req.body;

    const isOtpMatch = await emailOtpSchema.findOne({
      email: email,
      otp: emailotp,
    });

    if (!isOtpMatch) {
      return sendError(res, "Otp is incorrect");
    }

    const currentDate = new Date();
    if (isOtpMatch.otpExpireDate < currentDate) {
      return sendError(res, "Otp expired");
    }

    const checkEmailExists = await userSchema.findOne({ email: email });
    if (checkEmailExists) {
      return sendError(res, "Account already exists with this email");
    }

    await userSchema.create({
      email,
      fullName,
      phoneNumber,
      gender,
      password: await bcrypt.hash(password, 10),
    });
    return sendSuccess(res, "User Created");
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await userSchema.findOne({ email });
    if (!user) {
      return sendError(res, "User with this email does not exist");
    }

    const token = jwt.sign(email, process.env.SECRET_KEY);
    await commonController.sendResetLink(token);
    return sendSuccess(res, "Password reset mail has been sent");
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const renderResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    res.render("resetPassword", { token });
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const handleResetPassword = async (req, res) => {
  try {
    let { token, password, repeatPassword } = req.body;

    const email = jwt.verify(token, process.env.SECRET_KEY);
    password = password.trim();
    repeatPassword = repeatPassword.trim();

    if (password !== repeatPassword) {
      return sendError(res, "Password and Repeat-password not matching");
    }

    const user = await userSchema.findOneAndUpdate(
      { email: email },
      { password: await bcrypt.hash(password, 10) }
    );

    if (!user) {
      return sendUnauthorizeError(res, "Invalid emailId");
    }
    return sendSuccess(res, "Password updated successfully");
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await userSchema.findOne({ email: email });
    if (!existingUser) {
      return sendUnauthorizeError(res, "Email does not exists");
    }

    const oldPassword = existingUser.password;
    const passwordMatch = await bcrypt.compare(password, oldPassword);
    if (!passwordMatch) {
      return sendError(res, "Password is incorrect");
    }

    const payload = {
      _id: existingUser._id,
      email,
      fullName: existingUser.fullName,
      phoneNumber: existingUser.phoneNumber,
    };
    const userToken = tokenManager.generateToken(payload);

    return sendSuccessWithData(res, "Login successfull", userToken);
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await userSchema.findOne({ _id: userId });
    if (!user) {
      return sendUnauthorizeError(res, "Userid is not correct");
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      return sendError(res, "Old password is Incorrect");
    }

    const data = await userSchema.findByIdAndUpdate(
      { _id: userId },
      { password: await bcrypt.hash(newPassword, 10) }
    );
    return sendSuccess(res, "Password successfully changed");
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const showProfile = async (req, res) => {
  try {
    const email = req.user.email;

    const userProfile = await userSchema.findOne({ email }).lean(); // .lean() is to get a plain JS object
    if (!userProfile) {
      return sendError(res, "User not found");
    }

    const { password, _id, __v, createdAt, updatedAt, ...refData } =
      userProfile;

    return sendSuccessWithData(res, "Profile Details", refData);
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const deleteAccount = async (req, res) => {
  try {
    const email = req.user.email;

    const user = await userSchema.findOneAndDelete({ email: email });
    if (user) {
      await emailOtpSchema.findOneAndDelete({ email: email });
      await userAlbumSchema.findOneAndDelete({ email: email });
    } else {
      return sendUnauthorizeError(res, "User does not exists");
    }
    return sendSuccess(res, "User deleted successfully");
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const storeImagesInDB = async (req, res) => {
  try {
    const profilePicCloudLink = req.profilePicCloudLink;
    const galleryCloudLink = req.galleryCloudLink;
    const userId = req.user._id;

    if (!userId) {
      return sendError(res, "Email is required");
    }

    await userAlbumSchema.findOneAndUpdate(
      { userId: userId },
      {
        profilePicture: profilePicCloudLink,
        gallery: galleryCloudLink,
      },
      { upsert: true }
    );

    const refData = {
      profilePicture: profilePicCloudLink,
      gallaries: galleryCloudLink,
    };
    sendSuccessWithData(res, "Profile & galleries have been Uploaded", refData);
  } catch (e) {
    sendCatchError(res, e);
  }
};

const addLacationByLatLong = async (req, res) => {
  try {
    const { lat, long } = req.query;
    const userId = req.user._id;

    if (!lat || !long) {
      return sendError(res, "Latitude and longitude are required");
    }

    const newUserLocation = await userLocationSchema.findOneAndUpdate(
      { userId:userId },
      {
        userId:userId,
        location: {
          type: "Point",
          coordinates: [parseFloat(lat), parseFloat(long)],
        },
      },
      { upsert: true }
    );
    sendSuccess(res, "User location added successfully");
  } catch (e) {
    sendCatchError(res, e);
  }
};

const findNearbyUsers = async (req, res) => {
  try {
    const maxDistance = req.query.maxDistance;

    let userId = req.user._id;
    const userLocationData = await userLocationSchema.findOne({ userId });
    const lat = userLocationData.location.coordinates[0];
    const long = userLocationData.location.coordinates[1];

    userId = new mongoose.Types.ObjectId(userId);
    const users = await userLocationSchema.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lat), parseFloat(long)],
          },
          distanceField: "distance",
          maxDistance: parseFloat(maxDistance),
          spherical: true,
        },
      },
      {
        $match: {
          userId: {
            $ne : userId
          }
        }  
      }
    ]);

    return sendSuccessWithData(res, "Nearest users", users);
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const findNearbyPets = async (req, res) => {
  try {
    const userId = req.user._id;

    const userLocationDetails = await userLocationSchema.findOne({ userId });
    const lat = userLocationDetails.location.coordinates[0];
    const long = userLocationDetails.location.coordinates[1];

    const ownerId = new mongoose.Types.ObjectId(userId);
    const nearbyPets = await petSchema.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lat), parseFloat(long)],
          },
          distanceField: "totalDistance",
          query: { ownerId },
          spherical: true,
        },
      },
    ]);

    sendSuccessWithData(res, "Nearby pets", nearbyPets);
  } catch (e) {
    sendCatchError(res, e);
  }
};

const showAllUser = async (req, res) => {
  try {
    const { name, page, limit } = req.query;
    const users = await userSchema.aggregate([{ $limit: 2 }]);
    return sendSuccessWithData(res, "user fetched", users);
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const getUsersPets = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("userid--------------------->", userId);

    const user = await userSchema.findById(userId);
    console.log("---------------->", user);

    if (!user) {
      return sendUnauthorizeError(res, "User not found");
    }
    const data = await userSchema.aggregate([
      {
        $match: {
          _id: user._id,
        },
      },
      {
        $lookup: {
          from: "pets",
          localField: "_id",
          foreignField: "ownerId",
          as: "pets",
        },
      },
      {
        $project: {
          fullName: 1,
          "pets.petName": 1,
          _id: 0,
        },
      },
    ]);
    return sendSuccessWithData(res, "data has been fetched", data);
  } catch (e) {
    return sendCatchError(res, e);
  }
};

module.exports = {
  signUp,
  sendOtpOnMail,
  forgetPassword,
  renderResetPassword,
  handleResetPassword,
  logIn,
  showAllUser,
  changePassword,
  storeImagesInDB,
  showProfile,
  deleteAccount,
  getUsersPets,
  addLacationByLatLong,
  findNearbyUsers,
  findNearbyPets,
};
