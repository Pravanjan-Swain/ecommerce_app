import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: [true, "Product ID is required"],
				},
				quantity: {
					type: Number,
					required: [true, "Product quantity is required"],
					min: [1, "Product quantity must be at least 1"],
				},
				price: {
					type: Number,
					required: [true, "Product price is required"],
					min: [0, "Product price cannot be negative"],
				},
			},
		],
		totalAmount: {
			type: Number,
			required: [true, "Total amount is required"],
			min: [0, "Total amount cannot be negative"],
		},
		stripeSessionId: {
			type: String,
			unique: [true, "Stripe session ID must be unique"],
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
