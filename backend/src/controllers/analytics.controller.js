import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";

export const getAnalytics = asyncHandler(async (req, res) => {
	const analyticsData = await getAnalyticsData();

	const endDate = new Date();
	const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

	const dailySalesData = await getDailySalesData(startDate, endDate);

	return res.status(200).json(new ApiResponse(200, {analyticsData, dailySalesData}, "Analytics data retrieved successfully"));
});




// export const getAnalyticsData = asyncHandler(async () => {
// 	const totalUsers = await User.countDocuments();
// 	const totalProducts = await Product.countDocuments();

// 	const salesData = await Order.aggregate([
// 		{
// 			$group: {
// 				_id: null, // it groups all documents together,
// 				totalSales: { $sum: 1 }, // For each order we just add 1
// 				totalRevenue: { $sum: "$totalAmount" }, // For each order we add the totalAmount
// 			},
// 		},
// 	]);

// 	const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

// 	return res.status(200).json(new ApiResponse(200, {
// 		users: totalUsers,
// 		products: totalProducts,
// 		totalSales,
// 		totalRevenue
// 	}, "Analytics data retrieved successfully"));
// });

const getAnalyticsData = async () => {
	const totalUsers = await User.countDocuments();
	const totalProducts = await Product.countDocuments();

	const salesData = await Order.aggregate([
		{
			$group: {
				_id: null, // it groups all documents together,
				totalSales: { $sum: 1 },
				totalRevenue: { $sum: "$totalAmount" },
			},
		},
	]);

	const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

	return {
		users: totalUsers,
		products: totalProducts,
		totalSales,
		totalRevenue,
	};
};


// export const getDailySalesData = asyncHandler(async (startDate, endDate) => {

// 	const dailySalesData = await Order.aggregate([
// 		{
// 			$match: {
// 				createdAt: {
// 					$gte: startDate,
// 					$lte: endDate,
// 				},
// 			},
// 		},
// 		{
// 			$group: {
// 				_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
// 				sales: { $sum: 1 },
// 				revenue: { $sum: "$totalAmount" },
// 			},
// 		},
// 		{ $sort: { _id: 1 } },
// 	]);

// 	// example of dailySalesData
// 	// [
// 	// 	{
// 	// 		_id: "2024-08-18",
// 	// 		sales: 12,
// 	// 		revenue: 1450.75
// 	// 	},
// 	// ]

// 	const dateArray = getDatesInRange(startDate, endDate);
// 	// console.log(dateArray) // ['2024-08-18', '2024-08-19', ... ]

// 	return dateArray.map((date) => {
// 		const foundData = dailySalesData.find((item) => item._id === date);

// 		return {
// 			date,
// 			sales: foundData?.sales || 0,
// 			revenue: foundData?.revenue || 0,
// 		};
// 	});
// });


const getDailySalesData = async (startDate, endDate) => {
	try {
		const dailySalesData = await Order.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					sales: { $sum: 1 },
					revenue: { $sum: "$totalAmount" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		// example of dailySalesData
		// [
		// 	{
		// 		_id: "2024-08-18",
		// 		sales: 12,
		// 		revenue: 1450.75
		// 	},
		// ]

		const dateArray = getDatesInRange(startDate, endDate);
		// console.log(dateArray) // ['2024-08-18', '2024-08-19', ... ]

		return dateArray.map((date) => {
			const foundData = dailySalesData.find((item) => item._id === date);

			return {
				date,
				sales: foundData?.sales || 0,
				revenue: foundData?.revenue || 0,
			};
		});
	} catch (error) {
		throw error;
	}
};

function getDatesInRange(startDate, endDate) {
	const dates = [];
	let currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		dates.push(currentDate.toISOString().split("T")[0]);
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}
