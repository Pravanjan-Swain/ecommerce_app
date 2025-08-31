class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode; // HTTP status code for the response
        this.data = data; // The data to be returned in the response
        this.success = statusCode < 400; // Indicates that the operation was successful
        this.message = message; // A message describing the result of the operation
    }
}

export { ApiResponse };