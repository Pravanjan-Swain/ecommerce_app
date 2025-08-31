import { ApiError } from "./apiError.util.js";
import { ApiResponse } from "./apiResponse.util.js";

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)) // requestHandler is literally function call
            .catch((err) => {
                if (err instanceof ApiError) {
                    return res
                        .status(err.statusCode)
                        .json(new ApiResponse(err.statusCode, err.data, err.message));
                }

                return next(err);
            });
    }
}

export { asyncHandler };