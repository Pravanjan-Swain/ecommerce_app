import Coupon from "../models/coupon.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { ApiError } from "../utils/apiError.util.js";

export const getCoupon = asyncHandler(async (req, res) => {

	const userId = req.user?._id;
	if (!userId) {
		throw new ApiError(401, "Unauthorized: User ID missing");
	}

	const coupon = await Coupon.findOne({ userId, isActive: true });
	if (!coupon) {
		throw new ApiError(404, "No active coupon found for this user");
	}

	return res.status(200).json(new ApiResponse(200, coupon, "Coupon retrieved successfully")); // Send full coupon object
});


export const validateCoupon = asyncHandler(async (req, res) => {

	const { code } = req.body; // Expecting coupon code in the request body

	if (!code) {
		throw new ApiError(400, "Coupon code is required");
	}

	const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true });

	if (!coupon) {
		throw new ApiError(404, "Coupon not found or inactive for this user");
	}

	if (new Date(coupon.expirationDate) < new Date()) { // To avoid timezone issues
		coupon.isActive = false;
		await coupon.save();
		throw new ApiError(410, "Coupon expired");
	}

	return res.status(200).json(new ApiResponse(200, coupon, "Coupon is valid")); // returning the coupon object
});

// export const validateCoupon = async (req, res) => {
// 	try {
// 		const { code } = req.body;
// 		const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true });

// 		if (!coupon) {
// 			return res.status(404).json({ message: "Coupon not found" });
// 		}

// 		if (coupon.expirationDate < new Date()) {
// 			coupon.isActive = false;
// 			await coupon.save();
// 			return res.status(404).json({ message: "Coupon expired" });
// 		}

// 		res.json({
// 			message: "Coupon is valid",
// 			code: coupon.code,
// 			discountPercentage: coupon.discountPercentage,
// 		});
// 	} catch (error) {
// 		console.log("Error in validateCoupon controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };
