const express = require("express");
const router = express.Router();

const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
} = require("../../controllers/common/feature-controller");

router.post("/", addFeatureImage);
router.get("/get", getFeatureImages);
router.delete("/:id", deleteFeatureImage);
module.exports = router;
