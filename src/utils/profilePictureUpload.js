const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");
const path = require("path");
const file = require("fs");
const {
  sendSuccess,
  sendSuccessWithData,
  sendError,
  sendUnauthorizeError,
  sendCatchError,
} = require("../utils/responseHandler");

const uploadOnLocal = async (req, res, next) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      file.fieldname === "images"
        ? cb(null, path.join(__dirname, "../public/images"))
        : cb(null, path.join(__dirname, "../public/gallery"));
    },
    filename: function (req, file, cb) {
      return cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedImageExt = ["image/jpeg", "image/jpg", "image/png"];

    if (
      file.fieldname === "images" &&
      allowedImageExt.includes(file.mimetype)
    ) {
      cb(null, true);
    } else if (file.fieldname === "gallery") {
      cb(null, true);
    } else {
      cb(new Error("Only jpg, jpeg or png are allowed", false));
    }
  };

  const maxSize = 3; //  MB
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: maxSize * 1024 * 1024 },
  }).fields([
    { name: "images", maxCount: 1 },
    { name: "gallery", maxCount: 2 },
  ]);

  upload(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return sendError(res, `File size should be less than ${maxSize}MB`);
      } else {
        return sendCatchError(res, err);
      }
    }
    next();
  });
  req.maxSize = maxSize;
};

const uploadOnCloudinary = async (req, res, next) => {
  try {
    if (!req.files) {
      return sendError(res, "Can't find file to upload on cloud");
    }

    const profilePicPath = req.files.images[0].path;
    const profilePicCloudLink = await cloudinary.uploader.upload(
      profilePicPath
    );
    req.profilePicCloudLink = profilePicCloudLink.secure_url;

    const gallery = req.files.gallery;
    const galleryPath = gallery.map((item) => item.path);
    const galleryCloudLink = [];
    for (i of galleryPath) {
      const result = await cloudinary.uploader.upload(i);
      galleryCloudLink.push(result.secure_url);
    }
    req.galleryCloudLink = galleryCloudLink;

    // file.unlinkSync(filePath);
    next();
  } catch (error) {
    return sendCatchError(res, error);
  }
};

module.exports = {
  uploadOnLocal,
  uploadOnCloudinary,
};
