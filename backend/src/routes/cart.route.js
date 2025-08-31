import express from "express";
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from "../controllers/cart.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(protectRoute, getCartProducts);
router.route("/").post(protectRoute, addToCart);
router.route("/").delete(protectRoute, removeAllFromCart);
router.route("/:id").put(protectRoute, updateQuantity);

export default router;
