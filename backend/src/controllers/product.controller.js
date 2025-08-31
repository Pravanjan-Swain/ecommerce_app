import { redis } from "../lib/redis.lib.js";
import cloudinary from "../lib/cloudinary.lib.js";
import Product from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { ApiError } from "../utils/apiError.util.js";

export const getAllProducts = asyncHandler(async (req, res) => {

	const products = await Product.find({}); // find all products

	if(!products || products.length === 0) {
		throw new ApiError(404, "No products found");
	}

	return res.status(200).json(new ApiResponse(200, products, "Products fetched successfully"));
	
});

// export const getAllProducts = async (req, res) => {
// 	try {
// 		const products = await Product.find({}); // find all products
// 		res.json({ products });
// 	} catch (error) {
// 		console.log("Error in getAllProducts controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };


export const getFeaturedProducts = asyncHandler(async (req, res) => {
		
	let featuredProducts = await redis.get("ecommerce_featured_products");

	if (featuredProducts) {
		const parsedProducts = JSON.parse(featuredProducts);
		return res.status(200).json(new ApiResponse(200, parsedProducts, "Featured products fetched from cache"));
	}

	// if not in redis, fetch from mongodb
	// .lean() is gonna return a plain javascript object instead of a mongodb document
	// which is good for performance
	featuredProducts = await Product.find({ isFeatured : true }).lean();
 
	if (!featuredProducts || featuredProducts.length === 0) {
		throw new ApiError(404, "No featured products found");
	}

	// store in redis for future quick access
	await redis.set("ecommerce_featured_products", JSON.stringify(featuredProducts), "EX", 864000);;

	return res.status(200).json(new ApiResponse(200, featuredProducts, "Featured products fetched successfully"));
});

// export const getFeaturedProducts = async (req, res) => {
// 	try {
// 		let featuredProducts = await redis.get("ecommerce_featured_products");
// 		if (featuredProducts) {
// 			return res.json(JSON.parse(featuredProducts));
// 		}

// 		// if not in redis, fetch from mongodb
// 		// .lean() is gonna return a plain javascript object instead of a mongodb document
// 		// which is good for performance
// 		featuredProducts = await Product.find({ isFeatured: true }).lean();

// 		if (!featuredProducts) {
// 			return res.status(404).json({ message: "No featured products found" });
// 		}

// 		// store in redis for future quick access

// 		await redis.set("ecommerce_featured_products", JSON.stringify(featuredProducts));

// 		res.json(featuredProducts);
// 	} catch (error) {
// 		console.log("Error in getFeaturedProducts controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };

export const createProduct = asyncHandler(async (req, res) => {
	
	const { name, description, price, image, category } = req.body;

	const success = handleCreateProductInputErrors( name, description, price, image, category );
	
	if(!success) {
		throw new ApiError(400, "Invalid input");
	}

	let cloudinaryResponse = null;

	if (image) {
		try {
			cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
		}
		catch (error) {
			throw new ApiError(400, "Image upload failed");
		}
	}

	const product = await Product.create({
		name,
		description,
		price,
		image: cloudinaryResponse?.secure_url || "",
		category,
	});

	if (!product) {
		throw new ApiError(400, "Product creation failed");
	}

	return res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

function handleCreateProductInputErrors (name, description, price, image, category) {
	if(!name || !description || !price || !category) {
		return false;
	}
	if(typeof name !== "string" || typeof description !== "string" || typeof price !== "number" || typeof category !== "string") {
		return false;
	}
	if(name.trim() === "" || description.trim() === "" || category.trim() === "") {
		return false;
	}
	if(price < 0) {
		return false;
	}

	return true;
}


// export const createProduct = async (req, res) => {
// 	try {
// 		const { name, description, price, image, category } = req.body;

// 		let cloudinaryResponse = null;

// 		if (image) {
// 			cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
// 		}

// 		const product = await Product.create({
// 			name,
// 			description,
// 			price,
// 			image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
// 			category,
// 		});

// 		res.status(201).json(product);
// 	} catch (error) {
// 		console.log("Error in createProduct controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };

export const deleteProduct = asyncHandler(async (req, res) => {
	
	const productId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(productId)) {
		throw new ApiError(400, "Invalid product ID");
	}

	const product = await Product.findById(productId);

	// TODO : Check if product is featured then it cannot be deleted....
	if (!product) {
		throw new ApiError(404, "Product not found");
	}

	if(product.isFeatured) {
		throw new ApiError(400, "Cannot delete featured product");
	}

	if(product.image) {
		const publicId = product.image.split("/").pop().split(".")[0];
		try {
			await cloudinary.uploader.destroy(`products/${publicId}`);
			console.log("deleted image from cloduinary");
		} catch (error) {
			console.log("error deleting image from cloduinary", error);
		}
	}

	await Product.findByIdAndDelete(productId);

	return res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
});

// export const deleteProduct = async (req, res) => {
// 	try {
// 		const product = await Product.findById(req.params.id);

// 		// TODO : Check if product is featured then it cannot be deleted....
// 		if (!product) {
// 			return res.status(404).json({ message: "Product not found" });
// 		}

// 		if (product.image) {
// 			const publicId = product.image.split("/").pop().split(".")[0];
// 			try {
// 				await cloudinary.uploader.destroy(`products/${publicId}`);
// 				console.log("deleted image from cloduinary");
// 			} catch (error) {
// 				console.log("error deleting image from cloduinary", error);
// 			}
// 		}

// 		await Product.findByIdAndDelete(req.params.id);

// 		res.json({ message: "Product deleted successfully" });
// 	} catch (error) {
// 		console.log("Error in deleteProduct controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };


export const getRecommendedProducts = asyncHandler(async (req, res) => {
	const products = await Product.aggregate([
		{
			$sample: { size: 4 },
		},
		{
			$project: {
				_id: 1,
				name: 1,
				description: 1,
				image: 1,
				price: 1,
			},
		},
	]);

	if (!products || products.length === 0) {
		throw new ApiError(404, "No recommended products found");
	}

	return res.status(200).json(new ApiResponse(200, products, "Recommended products fetched successfully"));
});

// export const getRecommendedProducts = async (req, res) => {
// 	try {
// 		const products = await Product.aggregate([
// 			{
// 				$sample: { size: 4 },
// 			},
// 			{
// 				$project: {
// 					_id: 1,
// 					name: 1,
// 					description: 1,
// 					image: 1,
// 					price: 1,
// 				},
// 			},
// 		]);

// 		res.json(products);
// 	} catch (error) {
// 		console.log("Error in getRecommendedProducts controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };

export const getProductsByCategory = asyncHandler(async (req, res) => {
	
	const { category } = req.params;

	if (!category) {
		throw new ApiError(400, "Category is required");
	}

	const products = await Product.find({ category }).lean();

	if(!products || products.length === 0) {
		throw new ApiError(404, "No products found in this category");
	}

	return res.status(200).json(new ApiResponse(200, products, "Products fetched by category successfully"));
});

// export const getProductsByCategory = async (req, res) => {
// 	const { category } = req.params;
// 	try {
// 		const products = await Product.find({ category });
// 		res.json({ products });
// 	} catch (error) {
// 		console.log("Error in getProductsByCategory controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };


export const toggleFeaturedProduct = asyncHandler(async (req, res) => {
	
	const productId = req.params.id;
	
	if (!mongoose.Types.ObjectId.isValid(productId)) {
    	throw new ApiError(400, "Invalid product ID");
	}

	const product = await Product.findById(productId);

	if (product) {
		product.isFeatured = !product.isFeatured;
		const updatedProduct = await product.save();
		await updateFeaturedProductsCache();
		return res.status(200).json(new ApiResponse(200, updatedProduct, "Product featured status toggled successfully"));
	} else {
		throw new ApiError(404, "Product not found");
	}
});

// export const toggleFeaturedProduct = async (req, res) => {
// 	try {
// 		const product = await Product.findById(req.params.id);
// 		if (product) {
// 			product.isFeatured = !product.isFeatured;
// 			const updatedProduct = await product.save();
// 			await updateFeaturedProductsCache();
// 			res.json(updatedProduct);
// 		} else {
// 			res.status(404).json({ message: "Product not found" });
// 		}
// 	} catch (error) {
// 		console.log("Error in toggleFeaturedProduct controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };

async function updateFeaturedProductsCache() {
	try {
		// The lean() method  is used to return plain JavaScript objects instead of full Mongoose documents. This can significantly improve performance

		const featuredProducts = await Product.find({ isFeatured: true }).lean();
		await redis.set("ecommerce_featured_products", JSON.stringify(featuredProducts), "EX", 864000);
	} catch (error) {
		console.log("error in update cache function");
		throw new ApiError(500, error.message);
	}
}
