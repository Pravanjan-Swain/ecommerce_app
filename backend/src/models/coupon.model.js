import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: [true, "Coupon code is required"],
			unique: [true, "Coupon code must be unique"],
		},
		discountPercentage: {
			type: Number,
			required: [true, "Discount percentage is required"],
			min: [0, "Discount percentage cannot be negative"],
			max: [100, "Discount percentage cannot exceed 100"],
		},
		expirationDate: {
			type: Date,
			required: [true, "Expiration date is required"],
		},
		isActive: {
			type: Boolean,
			default: [true, 'Coupon isActive must be a boolean'],
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
			unique: [true, "Coupon can only be used by one user"],
		},
	},
	{
		timestamps: true,
	}
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
