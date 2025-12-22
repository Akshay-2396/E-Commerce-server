const Product = require("../../models/Product");

// =======================
// ADD NEW PRODUCT
// =======================
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      adminid,
    } = req.body;

    const newlyCreatedProduct = new Product({
      image,
      title,
      description,
      category,
      brand,
      price: price === "" ? 0 : price,
      salePrice: salePrice === "" ? 0 : salePrice,
      totalStock,
      averageReview,
      adminid,
    });

    await newlyCreatedProduct.save();

    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while adding product",
    });
  }
};

// =======================
// FETCH ALL PRODUCTS (ADMIN)
// =======================
const fetchAllProducts = async (req, res) => {
  try {
    const adminid = req.query.adminid;

    const listOfProducts = await Product.find({ adminid });

    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products",
    });
  }
};

// =======================
// EDIT PRODUCT
// =======================
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update fields safely
    product.title = title ?? product.title;
    product.description = description ?? product.description;
    product.category = category ?? product.category;
    product.brand = brand ?? product.brand;
    product.price = price === "" ? product.price : price ?? product.price;
    product.salePrice =
      salePrice === "" ? product.salePrice : salePrice ?? product.salePrice;
    product.totalStock = totalStock ?? product.totalStock;
    product.image = image ?? product.image;
    product.averageReview =
      averageReview ?? product.averageReview;

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Edit product error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while editing product",
    });
  }
};

// =======================
// DELETE PRODUCT
// =======================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting product",
    });
  }
};

module.exports = {
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};