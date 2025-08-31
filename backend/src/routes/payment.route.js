import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { checkoutSuccess, createCheckoutSession } from "../controllers/payment.controller.js";

const router = express.Router();

router.route("/create-checkout-session").post(protectRoute, createCheckoutSession);
router.route("/checkout-success").post(protectRoute, checkoutSuccess);

export default router;
