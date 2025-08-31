import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();


// Middleware
app.use(express.json({
    limit: "16kb"
}));
app.use(express.urlencoded({ 
    extended: true,
    limit: "16kb"
}));
app.use(express.static("public"));
app.use(cookieParser());

app.use(cors({
  origin: `${process.env.CLIENT_URL}`,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));


// Import all the routes
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import { errorHandler } from "./utils/errorHandler.util.js";

// Use the routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

// Error handling middleware
app.use(errorHandler);

export { app };