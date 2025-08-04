const Feature = require("../../models/Feature"); // Your Mongoose model

// ✅ Add image
const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;
    console.log("Image received:", image);

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "No image provided",
      });
    }

    const saved = await Feature.create({ image }); // FIXED THIS LINE

    if (saved) {
      return res.status(201).json({ success: true, data: saved });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Failed to save image" });
    }
  } catch (error) {
    console.error("AddFeatureImage Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error", error: error.message });
  }
};

// ✅ Get all images
const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find();
    res.status(200).json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Delete image
const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("DELETE FEATURE ID:", id);

    const deleted = await Feature.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    res.status(200).json({ success: true, message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
};
