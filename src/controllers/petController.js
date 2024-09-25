const { skipMiddlewareFunction } = require("mongoose");
const petSchema = require("../models/petSchema");
const {
  sendSuccess,
  sendSuccessWithData,
  sendError,
  sendUnauthorizeError,
  sendCatchError,
} = require("../utils/responseHandler");

const createPet = async (req, res) => {
  try {
    const { petName, gender, ownerId } = req.body;
    const location = req.body?.location ?? null;
    const data = { petName, gender, ownerId, location };
    await petSchema.create(data);
    return sendSuccess(res, "A Pet is created");
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const showAllPets = async (req, res) => {
  try {
    const page = Number(req.query?.page) || 1;
    const limit = Number(req.query?.limit) || 10;
    
    const skip = (page - 1) * limit;
    const pets = await petSchema.aggregate([
      { $skip: skip },
      { $limit : limit}
    ]);
    return sendSuccessWithData(res, "Pets are fetched", pets);
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const updatePetOwner = async (req, res) => {
  try {
    const { petId, userId } = req.query;

    const pet = await petSchema.findByIdAndUpdate(
      { _id: petId },
      { ownerId: userId }
    );

    if (!pet) {
      return sendUnauthorizeError(res, "Pet not found");
    }
    return sendSuccessWithData(res, "Owner Changed", pet);
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const deletePet = async (req, res) => {
  try {
    const petId = req.query.petId;

    const pet = await petSchema.findByIdAndDelete(petId);
    if (!pet) {
      return sendUnauthorizeError(res, "Pet not found");
    }
    return sendSuccess(res, "Pet deleted Successfully");
  } catch (e) {
    return sendCatchError(res, e);
  }
};

const setPetLocation = async (req, res) => {
  try {
    const { lat, long, _id } = req.query;

    if (!_id) {
      return sendError(res, "pet's id is required");
    }

    if (!lat || !long) {
      return sendError(res, "Latitude and longitude are required");
    }

    const updatedPet = await petSchema.findByIdAndUpdate(
      { _id },
      {
        location: {
          type: "Point",
          coordinates: [parseFloat(lat), parseFloat(long)],
        },
      }
    );

    if (!updatedPet) {
      return sendUnauthorizeError(res, "pet id is invalid");
    }
    sendSuccess(res, "Pet's location added successfully");
  } catch (e) {
    sendCatchError(res, e);
  }
};

module.exports = {
  createPet,
  showAllPets,
  updatePetOwner,
  deletePet,
  setPetLocation,
};
