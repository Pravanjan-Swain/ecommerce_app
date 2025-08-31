import { useSelector, useDispatch } from "react-redux";
import { setCoupon, setIsCouponApplied, setCart, addToCart, setTotal, setSubTotal } from "../redux/cartSlice.js";
import axios from "../lib/axios.js";
import toast from "react-hot-toast";
import { set } from "mongoose";

export const useGetMyCoupon = () => {
    const dispatch = useDispatch();

    const getMyCoupon = async (setLoading) => {
        setLoading(true);
        try {
            const response = await axios.get("/coupons");
            const couponResponse = response.data;

            if (!couponResponse.success) {
                dispatch(setCoupon(null));
                toast.error(couponResponse.message);
                return;
            }

            dispatch(setCoupon(couponResponse.data));
        } catch (error) {
            console.error("Failed to fetch coupon:", error);
            dispatch(setCoupon(null));
            toast.error(error.response?.data?.message || error.message || "Failed to fetch coupon. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return getMyCoupon;
}

export const useApplyCoupon = () => {
    const dispatch = useDispatch();
    const applyCoupon = async (couponCode, setLoading) => {
        setLoading(true);
        try {
            const response = await axios.post("/coupons/validate", { couponCode });
            const couponResponse = response.data;

            if (!couponResponse.success) {
                dispatch(setCoupon(null));
                dispatch(setIsCouponApplied(false));
                toast.error(couponResponse.message);
                return;
            }

            dispatch(setCoupon(couponResponse.data));
            dispatch(setIsCouponApplied(true));

            toast.success("Coupon applied successfully!");
        } catch (error) {
            console.error("Failed to apply coupon:", error);
            dispatch(setCoupon(null));
            dispatch(setIsCouponApplied(false));
            toast.error(error.response?.data?.message || error.message ||"Failed to apply coupon. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return applyCoupon;
};

export const useRomoveCoupon = () => {
    const dispatch = useDispatch();

    const removeCoupon = async (setLoading) => {
        setLoading(true);
        try {
            dispatch(setCoupon(null));
            dispatch(setIsCouponApplied(false));

            toast.success("Coupon removed successfully!");
        } catch (error) {
            console.error("Failed to remove coupon:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to remove coupon. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return removeCoupon;
};

export const useGetCartItems = () => {
    const dispatch = useDispatch();

    const getCartItems = async (setLoading) => {
        setLoading(true);
        try {
            const response = await axios.get("/cart");
            const cartResponse = response.data;

            if (!cartResponse.success) {
                dispatch(setCart([]));
                toast.error(cartResponse.message);
                return;
            }

            dispatch(setCart(cartResponse.data));
            useCalculateTotals();
        } catch (error) {
            console.error("Failed to fetch cart items:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch cart items. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return getCartItems;
}

export const useClearCart = () => {
    const dispatch = useDispatch();

    const clearCart = async (setLoading) => {
        setLoading(true);
        try {
            dispatch(setCart([]));
            dispatch(setCoupon(null));
            dispatch(setIsCouponApplied(false));
            dispatch(setTotal(0));
            dispatch(setSubTotal(0));

            toast.success("Cart cleared successfully!");
        } catch (error) {
            console.error("Failed to clear cart:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to clear cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return clearCart;
}

export const useAddToCart = () => {
    const dispatch = useDispatch();
    const addToCart = async (product, setLoading) => {
        setLoading(true);
        try {
            const response = await axios.post("/cart", { productId : product._id });
            const cartResponse = response.data;

            if (!cartResponse.success) {
                toast.error(cartResponse.message);
                return;
            }

            dispatch(setCart(cartResponse.data));
            toast.success("Product added to cart successfully!");
        } catch (error) {
            console.error("Failed to add product to cart:", error);
            toast.error("Failed to add product to cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return addToCart;
}

export const useRemoveFromCart = () => {
    const dispatch = useDispatch();
    const removeFromCart = async (productId, setLoading) => {
        setLoading(true);
        try {
            const response = await axios.delete('\cart', { productId });
            const cartResponse = response.data;

            if (!cartResponse.success) {
                toast.error(cartResponse.message);
                return;
            }

            dispatch(setCart(cartResponse.data));
            toast.success("Product removed from cart successfully!");
        }
        catch(error) {
            console.error("Failed to remove product from cart:", error);
            toast.error("Failed to remove product from cart. Please try again.");
        }
        finally{
            setLoading(false);
        }
    }

    return removeFromCart;
}

export const useUpdateQuantity = () => {
    const updateQuantity = async (productId, quantity) => {
        try{
            if(quantity === 0) {
                const response = await axios.delete('/cart', { productId });
                const cartResponse = response.data;

                if (!cartResponse.success) {
                    toast.error(cartResponse.message);
                    return;
                }

                dispatch(setCart(cartResponse.data));
                toast.success("Product removed from cart successfully!");
            }
            else {
                const response = await axios.put(`/cart/${productId}`, { quantity });
                const cartResponse = response.data;

                if (!cartResponse.success) {
                    toast.error(cartResponse.message);
                    return;
                }

                dispatch(setCart(cartResponse.data));
                toast.success("Product quantity updated successfully!");
            }
        }
        catch(error){
            console.error("Failed to update quantity:", error);
            toast.error("Failed to update quantity. Please try again.");
        }
    }

    return updateQuantity;
};

const useCalculateTotals = () => {
    const dispatch = useDispatch();
    const { cart, coupon } = useSelector((state) => state.cart);
    const subTotal = cart.reduce((sum, item) => sum+item.price*item.quantity, 0);
    const total = subTotal;

    if(coupon) {
        const discount = subTotal * (coupon.discountPercentage / 100);
        total = subTotal - discount;
    }
    
    dispatch(setSubTotal(subTotal));
    dispatch(setTotal(total));
}

