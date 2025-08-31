import { redis } from "../lib/redis.lib.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { ApiError } from "../utils/apiError.util.js";


const generateTokens = (userId) => {
	const accessToken = jwt.sign({ _id : userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ _id : userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
	await redis.set(`ecommerce_refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
};

const setCookies = (res, accessToken, refreshToken) => {
	res.cookie("ecommerceAccessToken", accessToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 15 * 60 * 1000, // 15 minutes
	});
	res.cookie("ecommerceRefreshToken", refreshToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});
};


// Signup Controller
export const signup = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;

	let success = handleSignUpInput(name, email, password);
	if (!success) {
		throw new ApiError(400, "Invalid input data");
	}
	
	const userExists = await User.findOne({ email });

	if (userExists) {
		return res.status(400).json(new ApiResponse(400, null, "User already exists"));
	}

	const user = await User.create({ name, email, password });

	// authenticate
	const { accessToken, refreshToken } = generateTokens(user._id);
	await storeRefreshToken(user._id, refreshToken);

	setCookies(res, accessToken, refreshToken);

	const data = user.toObject();
	delete data.password; // remove password from response
	delete data.cartItems; // remove cart items from response

	res.status(201).json(new ApiResponse(201, data, "Signup successful"));
});

const handleSignUpInput = (name, email, password) => {
	if (!name || !email || !password) {
		return false;
	}
	if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
		return false;
	}
	if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
		return false;
	}
	if (password.length < 6) {
		return false;
	}

	return true;
}

// export const signup = async (req, res) => {
// 	const { email, password, name } = req.body;
// 	try {
// 		const userExists = await User.findOne({ email });

// 		if (userExists) {
// 			return res.status(400).json({ message: "User already exists" });
// 		}

// 		const user = await User.create({ name, email, password });

// 		// authenticate
// 		const { accessToken, refreshToken } = generateTokens(user._id);
// 		await storeRefreshToken(user._id, refreshToken);

// 		setCookies(res, accessToken, refreshToken);

// 		res.status(201).json({
// 			_id: user._id,
// 			name: user.name,
// 			email: user.email,
// 			role: user.role,
// 		});
// 	} catch (error) {
// 		console.log("Error in signup controller", error.message);
// 		res.status(500).json({ message: error.message });
// 	}
// };


// Login Controller

export const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	let success = handleLoginInput(email, password);
	if (!success) {
		throw new ApiError(400, "Invalid input data");
	}

	const user = await User.findOne({ email });

	if (user && (await user.comparePassword(password))) {
		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);
		setCookies(res, accessToken, refreshToken);

		const data = user.toObject();
		delete data.password; // remove password from response
		delete data.cartItems; // remove cart items from response

		res.status(200).json(new ApiResponse(200, data, "Login successful"));
	} else {
		throw new ApiError(400, "Invalid email or password");
	}
});

const handleLoginInput = (email, password) => {
	if (!email || !password) {
		return false;
	}
	if (typeof email !== "string" || typeof password !== "string") {
		return false;
	}
	if (email.trim() === "" || password.trim() === "") {
		return false;
	}
	if (password.length < 6) {
		return false;
	}
	return true;
}

// export const login = async (req, res) => {
// 	try {
// 		const { email, password } = req.body;
// 		const user = await User.findOne({ email });

// 		if (user && (await user.comparePassword(password))) {
// 			const { accessToken, refreshToken } = generateTokens(user._id);
// 			await storeRefreshToken(user._id, refreshToken);
// 			setCookies(res, accessToken, refreshToken);

// 			res.json({
// 				_id: user._id,
// 				name: user.name,
// 				email: user.email,
// 				role: user.role,
// 			});
// 		} else {
// 			res.status(400).json({ message: "Invalid email or password" });
// 		}
// 	} catch (error) {
// 		console.log("Error in login controller", error.message);
// 		res.status(500).json({ message: error.message });
// 	}
// };


// Logout Controller

export const logout = asyncHandler(async (req, res) => {
	let refreshToken = null;
	if (req.cookies && req.cookies.ecommerceRefreshToken) {
		refreshToken = req.cookies.ecommerceRefreshToken;
	}
	
	if (refreshToken) {
		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		await redis.del(`ecommerce_refresh_token:${decoded._id}`);
	}

	res.clearCookie("ecommerceAccessToken");
	res.clearCookie("ecommerceRefreshToken");
	res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

// export const logout = async (req, res) => {
// 	try {
// 		const refreshToken = req.cookies.ecommerceRefreshToken;
// 		if (refreshToken) {
// 			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
// 			await redis.del(`ecommerce_refresh_token:${decoded.userId}`);
// 		}

// 		res.clearCookie("ecommerceAccessToken");
// 		res.clearCookie("ecommerceRefreshToken");
// 		res.json({ message: "Logged out successfully" });
// 	} catch (error) {
// 		console.log("Error in logout controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };


// Refresh Token Controller
// this will refresh the access token

export const refreshToken = asyncHandler(async (req, res) => {
	let refreshToken = null;
	if (req.cookies && req.cookies.ecommerceRefreshToken) {
		refreshToken = req.cookies.ecommerceRefreshToken;
	}

	if (!refreshToken) {
		throw new ApiError(401, "No refresh token");
	}

	const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
	const storedToken = await redis.get(`ecommerce_refresh_token:${decoded._id}`);

	if (storedToken !== refreshToken) {
		throw new ApiError(401, "Invalid refresh token");
	}

	const accessToken = jwt.sign({ _id : decoded._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

	res.cookie("ecommerceAccessToken", accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 15 * 60 * 1000,
	});

	return res.status(200).json(new ApiResponse(200, null, "Token refreshed successfully"));
});

// export const refreshToken = async (req, res) => {
// 	try {
// 		const refreshToken = req.cookies.ecommerceAccessToken;

// 		if (!refreshToken) {
// 			return res.status(401).json({ message: "No refresh token provided" });
// 		}

// 		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
// 		const storedToken = await redis.get(`ecommerce_refresh_token:${decoded.userId}`);

// 		if (storedToken !== refreshToken) {
// 			return res.status(401).json({ message: "Invalid refresh token" });
// 		}

// 		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

// 		res.cookie("ecommerceAccessToken", accessToken, {
// 			httpOnly: true,
// 			secure: process.env.NODE_ENV === "production",
// 			sameSite: "strict",
// 			maxAge: 15 * 60 * 1000,
// 		});

// 		res.json({ message: "Token refreshed successfully" });
// 	} catch (error) {
// 		console.log("Error in refreshToken controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };


// Get Profile Controller

export const getProfile = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(401, "Unauthorized - No user found");
	}
	if (!req.user._id) {
		throw new ApiError(400, "Invalid user data");
	}
	
	const data = req.user;
	return new ApiResponse(200, data, "Profile fetched successfully", );
});

// export const getProfile = async (req, res) => {
// 	try {
// 		res.json(req.user);
// 	} catch (error) {
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };
