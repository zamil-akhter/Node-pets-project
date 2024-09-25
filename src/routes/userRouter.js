const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const userValidation = require("../validation/userValidation");
const uploadPic = require("../utils/profilePictureUpload");

const validateUserRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

router.post("/sendOtpOnMail/:email", userController.sendOtpOnMail);

router.post(
  "/signUp",
  validateUserRequest(userValidation.validateSignUp),
  userController.signUp
);

router.post(
  "/forgetPassword/:email",
  userController.forgetPassword
);

router.get("/renderResetPassword/:token", userController.renderResetPassword);

router.post(
  "/handleResetPassword",
  validateUserRequest(userValidation.validateForgetPassword),
  userController.handleResetPassword
);

router.post(
  "/logIn",
  validateUserRequest(userValidation.validateLogIn),
  userController.logIn
);

router.patch(
  "/changePassword",
  validateUserRequest(userValidation.validateChangePassword),
  authMiddleware.verifyToken,
  userController.changePassword
);

router.get("/showProfile", authMiddleware.verifyToken, userController.showProfile);

router.delete(
  "/deleteAccount",
  authMiddleware.verifyToken,
  userController.deleteAccount
);

router.post(
  "/uploadProfilePicture",
  authMiddleware.verifyToken,
  uploadPic.uploadOnLocal,
  uploadPic.uploadOnCloudinary,
  userController.storeImagesInDB
);

router.post(
  "/addLocation",
  authMiddleware.verifyToken,
  userController.addLacationByLatLong
);

router.post(
  "/findNearbyUsers",
  authMiddleware.verifyToken,
  userController.findNearbyUsers
);

router.get(
  "/findNearbyPets",
  authMiddleware.verifyToken,
  userController.findNearbyPets
);

// API
router.get("/", userController.showAllUser);

// API
router.get("/:id", userController.getUsersPets);

module.exports = router;

// User APIs:
// PUT /users/profile: Update the profile of the logged-in user.

// Pet APIs:
// POST /pets: Add a new pet.
// GET /pets: Get a list of pets (with filters like owner, gender, etc.).
// GET /pets/:id: Get details of a specific pet.
// PUT /pets/:id: Update a specific pet's details.
// DELETE /pets/:id: Delete a specific pet.

// Adoption Request APIs (for Pet Adoption Platform):
// POST /adoptions: Create a new adoption request.
// GET /adoptions: Get a list of adoption requests (with filters like user, pet, status, etc.).
// PUT /adoptions/:id: Update the status of an adoption request (approve/reject).
// DELETE /adoptions/:id: Cancel an adoption request.

// Appointment APIs (for Pet Care and Appointment Management System):

// POST /appointments: Book a new appointment.
// GET /appointments: Get a list of appointments (with filters like user, pet, date, etc.).
// PUT /appointments/:id: Reschedule or update an appointment.
// DELETE /appointments/:id: Cancel an appointment.

// Social Network APIs (for Pet Social Network):

// POST /posts: Create a new post.
// GET /posts: Get a list of posts (with filters like user, pet, date, etc.).
// PUT /posts/:id: Update a specific post.
// DELETE /posts/:id: Delete a specific post.
// POST /friends: Send a friend request.
// PUT /friends/:id: Accept or decline a friend request.
// DELETE /friends/:id: Remove a friend.
