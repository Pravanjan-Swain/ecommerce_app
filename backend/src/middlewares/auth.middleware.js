import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";

export const protectRoute = asyncHandler(async (req, res, next) => {
	let accessToken = null;

	if (req.cookies && req.cookies.ecommerceAccessToken) {
		accessToken = req.cookies.ecommerceAccessToken;
	}

	if (!accessToken) {
		throw new ApiError(401, "Unauthorized - No access token provided");
	}
	
	try {
		const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
		const user = await User.findById(decoded._id).select("-password -cartItems");

		if(!user) {
			throw new ApiError(401, "User not found");
		}

		req.user = user;

		next();
	}
	catch (error) {
		if (error.name === "TokenExpiredError") {
			throw new ApiError(401, "Unauthorized - Access token expired");
		}

		throw new ApiError(401, "Unauthorized - Invalid access token");
	}
})

// export const protectRoute = async (req, res, next) => {
// 	try {
// 		const accessToken = req.cookies.ecommerceAccessToken;

// 		if (!accessToken) {
// 			return res.status(401).json({ message: "Unauthorized - No access token provided" });
// 		}

// 		try {
// 			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
// 			const user = await User.findById(decoded.userId).select("-password");

// 			if (!user) {
// 				return res.status(401).json({ message: "User not found" });
// 			}

// 			req.user = user;

// 			next();
// 		} catch (error) {
// 			if (error.name === "TokenExpiredError") {
// 				return res.status(401).json({ message: "Unauthorized - Access token expired" });
// 			}
// 			throw error;
// 		}
// 	} catch (error) {
// 		console.log("Error in protectRoute middleware", error.message);
// 		return res.status(401).json({ message: "Unauthorized - Invalid access token" });
// 	}
// };

export const adminRoute = asyncHandler(async(req, res, next) => {
	if (req.user && req.user.role === "admin") {
		next();
	} else {
		throw new ApiError(403, "Forbidden - Admin access required");
	}
});
