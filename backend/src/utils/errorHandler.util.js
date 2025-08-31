import { ApiResponse } from "./apiResponse.util.js";

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json(new ApiResponse(statusCode, null, err.message));
}