const express = require("express");
const router = express.Router();
const petController = require("../controllers/petController");
const petValidation = require("../validation/petValidation");

const validatePetRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

router.post(
  "/create",
  validatePetRequest(petValidation.validateCreateOnePet),
  petController.createPet
);

router.post(
  "/setPetLocation",
  petController.setPetLocation
);

// swagger left
router.get("/showAll", petController.showAllPets);
// swagger left
router.patch("/updateOwner", petController.updatePetOwner);
// swagger left
router.delete("/delete", petController.deletePet);




module.exports = router;
