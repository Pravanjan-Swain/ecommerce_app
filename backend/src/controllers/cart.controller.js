import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { ApiError } from "../utils/apiError.util.js";


// TODO : check how it is working with user
// Get Cart Products Controller
export const getCartProducts = asyncHandler(async (req, res) => {

	const userId = req.user._id;

	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found");
	}
	
	await user.populate("cartItems.product");

	if (!user.cartItems || user.cartItems.length === 0) {
  		return res.status(200).json(new ApiResponse(200, [], "Cart is empty"));
	}

	const cartItems = user.cartItems.filter(item => item.product).map(item => ({
		...item.product.toJSON(), quantity: item.quantity,
	}));
	
	return res.status(200).json(new ApiResponse(200, cartItems, "Cart products fetched successfully"));
});

// export const getCartProducts = async (req, res) => {
// 	try {
// 		const products = await Product.find({ _id: { $in: req.user.cartItems } });

// 		// add quantity for each product
// 		const cartItems = products.map((product) => {
// 			const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
// 			return { ...product.toJSON(), quantity: item.quantity };
// 		});

// 		res.json(cartItems);
// 	} catch (error) {
// 		console.log("Error in getCartProducts controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };

export const addToCart = asyncHandler(async (req, res) => {
	const { productId } = req.body;
	const userId = req.user._id;

	if (!mongoose.Types.ObjectId.isValid(productId)) {
		throw new ApiError(400, "Invalid product ID");
	}

	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const product = await Product.findById(productId);
	if (!product) {
		throw new ApiError(404, "Product not found");
	}

	const existingItem = user.cartItems.find((item) => item.product.equals(productId));
	if (existingItem) {
		existingItem.quantity += 1;
	} else {
		user.cartItems.push({ product : productId});
	}

	await user.save();

	await user.populate("cartItems.product");

	return res.status(200).json(new ApiResponse(200, user.cartItems, "Product added to cart successfully"));
});

// export const addToCart = async (req, res) => {
// 	try {
// 		const { productId } = req.body;
// 		const user = req.user;

// 		const existingItem = user.cartItems.find((item) => item.product.equals(productId));
// 		if (existingItem) {
// 			existingItem.quantity += 1;
// 		} else {
// 			user.cartItems.push({ product : productId});
// 		}

// 		await user.save();
// 		res.json(user.cartItems);
// 	} catch (error) {
// 		console.log("Error in addToCart controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };


export const removeAllFromCart = asyncHandler(async (req, res) => {
	const { productId } = req.body;
	const userId = req.user._id;

	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found");
	}

	if (!user.cartItems || user.cartItems.length === 0) {
    	return res.status(200).json(new ApiResponse(200, [], "Cart is already empty"));
  	}

	if (productId) { 
		if (!mongoose.Types.ObjectId.isValid(productId)) {
			throw new ApiError(400, "Invalid productId");
		}

		const initialLength = user.cartItems.length;

		user.cartItems = user.cartItems.filter((item) => !item.product.equals(productId));

		if (initialLength === user.cartItems.length) {
			throw new ApiError(404, "Product not found in cart");
		}

	} else { // if no productId is provided, remove all items from cart
		user.cartItems = [];
	}

	await user.save();

	await user.populate("cartItems.product");
	
	return res.status(200).json(new ApiResponse(200, user.cartItems, "Cart updated successfully"));
});

// export const removeAllFromCart = async (req, res) => {
// 	try {
// 		const { productId } = req.body;
// 		const user = req.user;
// 		if (!productId) {
// 			user.cartItems = [];
// 		} else {
// 			user.cartItems = user.cartItems.filter((item) => item.product !== productId);
// 		}
// 		await user.save();
// 		res.json(user.cartItems);
// 	} catch (error) {
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };


export const updateQuantity = asyncHandler(async (req, res) => {
	
	const { id: productId } = req.params;
	const { quantity } = req.body;

	const userId = req.user._id;
	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found");
	}

	if (!mongoose.Types.ObjectId.isValid(productId)) {
		throw new ApiError(400, "Invalid product ID");
	}

	if (quantity === undefined || !Number.isInteger(quantity) || quantity < 0) {
  		throw new ApiError(400, "Quantity must be a non-negative integer");
	}

	const existingItem = user.cartItems.find((item) => item.product.equals(productId));

	if (!existingItem) {
    	throw new ApiError(404, "Product not found in cart");
  	}

	if (quantity === 0) {
		user.cartItems = user.cartItems.filter((item) => !item.product.equals(productId));
	}
	else {
		existingItem.quantity = quantity;
	}

	await user.save();

	await user.populate("cartItems.product");
	return res.status(200).json(new ApiResponse(200, user.cartItems, "Cart updated successfully"));
});

// export const updateQuantity = async (req, res) => {
// 	try {
// 		const { id: productId } = req.params;
// 		const { quantity } = req.body;
// 		const user = req.user;
// 		const existingItem = user.cartItems.find((item) => item.id === productId);

// 		if (existingItem) {
// 			if (quantity === 0) {
// 				user.cartItems = user.cartItems.filter((item) => item.id !== productId);
// 				await user.save();
// 				return res.json(user.cartItems);
// 			}

// 			existingItem.quantity = quantity;
// 			await user.save();
// 			res.json(user.cartItems);
// 		} else {
// 			res.status(404).json({ message: "Product not found" });
// 		}
// 	} catch (error) {
// 		console.log("Error in updateQuantity controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };
