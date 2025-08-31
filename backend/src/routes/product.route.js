import express from "express";
import {
	createProduct,
	deleteProduct,
	getAllProducts,
	getFeaturedProducts,
	getProductsByCategory,
	getRecommendedProducts,
	toggleFeaturedProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(protectRoute, adminRoute, getAllProducts);
router.route("/featured").get(getFeaturedProducts);
router.route("/category/:category").get(getProductsByCategory);
router.route("/recommendations").get(getRecommendedProducts);
router.route("/").post(protectRoute, adminRoute, createProduct);
router.route("/:id").patch(protectRoute, adminRoute, toggleFeaturedProduct);
router.route("/:id").delete(protectRoute, adminRoute, deleteProduct);

export default router;
