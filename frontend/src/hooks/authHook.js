import axios from "../lib/axios.js";
import toast from react-hot-toast;
import { useSelector, useDispatch } from "react-redux";
import { setAuthUser } from "../redux/authSlice.js";

// Signup Hook
export const useSignUp = () => {
    const dispatch = useDispatch();

    const signup = async ({name, email, password, confirmPassword}, setLoading) => {
        const success = handleSignupInputErrors({ name, email, password, confirmPassword });
        if(!success) return;

        setLoading(true);

        try {
            const response = await axios.post("/auth/signup", {
                name, 
                email, 
                password
            })

            const signUpResponse = response.data();

            if(!signUpResponse.success) {
                toast.error(signUpResponse.message);
                return;
            }

            dispatch(setAuthUser(signUpResponse.data));

            toast.success("Signup successful! Please login to continue.");
        }
        catch (error) {
            console.error("Signup failed:", error);
            toast.error(error.response?.data?.message ||error.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return signup;
}

const handleSignupInputErrors = ({ name, email, password, confirmPassword }) => {
    name = name.trim();
    email = email.trim();
    password = password.trim();
    confirmPassword = confirmPassword.trim();

    if(!name || !email || !password || !confirmPassword) {
        toast.error("All fields are required");
        return false;
    }

    if(password !== confirmPassword) {
        toast.error("Passwords do not match");
        return false;
    }

    return true;
}

// Login Hook
export const useLogin = () => {
    const dispatch = useDispatch();

    const login = async ({ email, password }, setLoading) => {
        
        const success = handleLoginInputErrors({ email, password });
        
        if(!success) return;

        setLoading(true);

        try {
            const response = await axios.post("/auth/login", {
                email, 
                password
            });

            const loginResponse = response.data;

            if(!loginResponse.success) {
                toast.error(loginResponse.message);
                return;
            }

            // Assuming you have a Redux action to set the user
            dispatch(setAuthUser(loginResponse.data));

            toast.success("Login successful!");
        }
        catch (error) {
            console.error("Login failed:", error);
            toast.error(error.response?.data?.message || error.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return login;
}

const handleLoginInputErrors = ({ email, password }) => {
    email = email.trim();
    password = password.trim();

    if(!email || !password) {
        toast.error("Email and password are required");
        return false;
    }

    return true;
}

// Logout Hook
export const useLogout = () => {

    const dispatch = useDispatch();

    const logout = async (setLoading) => {
        try {
            const response = await axios.post("/auth/logout");
            const logoutResponse = response.data;

            if(!logoutResponse.success) {
                toast.error(logoutResponse.message);
                return;
            }

            dispatch(setAuthUser(null));

            toast.success("Logout successful!");
        }
        catch (error) {
            console.error("Logout failed:", error);
            toast.error(error.response?.data?.message || error.message || "Logout failed. Please try again.");
        }
        finally {
            setLoading(false);
        }
    }

    return logout;
}

// Check Auth Hook
export const useCheckAuth = () => {
    const dispatch = useDispatch();

    const checkAuth = async () => {
        try {
            const response = await axios.get("/auth/profile");
            const authResponse = response.data;

            if(!authResponse.success) {
                toast.error(authResponse.message);
                dispatch(setAuthUser(null));
                return;
            }

            dispatch(setAuthUser(authResponse.data));
            toast.success("Authentication check successful!");
        }
        catch (error) {
            console.error("Authentication check failed:", error);
            dispatch(setAuthUser(null));
            toast.error(error.response?.data?.message || error.message || "Authentication check failed. Please try again.");
            return;
        }
    }

    return checkAuth;
}

// Refresh Token Hook
export const useRefreshToken = () => {
    const dispatch = useDispatch();

    const refreshToken = async () => {
        try {
            const response = await axios.post("/auth/refresh-token");
            const refreshTokenResponse = response.data;

            if(!refreshTokenResponse.success) {
                dispatch(setAuthUser(null));
                toast.error(refreshTokenResponse.message);
                return;
            }
        }
        catch (error) {
            console.error("Refresh token failed:", error);
            dispatch(setAuthUser(null));
            toast.error("Refresh token failed. Please try again.");
            return;
        }
    }
}