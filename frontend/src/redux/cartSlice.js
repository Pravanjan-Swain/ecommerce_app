import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cart : [],
    coupon : null,
    total : 0,
    subTotal : 0,
    isCouponApplied : false
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCoupon : (state, action) => {
            state.coupon = action.payload
        },
        setIsCouponApplied : (state, action) => {
            state.isCouponApplied = action.payload
        },
        setCart : (state, action) => {
            state.cart = action.payload
        },
        addToCart : (state, action) => {
            state.cart.push(action.payload)
        },
        setTotal : (state, action) => {
            state.total = action.payload
        },
        setSubTotal : (state, action) => {
            state.subTotal = action.payload
        }
    }
});

export const { setCoupon, setIsCouponApplied, setCart, addToCart, setTotal, setSubTotal } = cartSlice.actions;

export default cartSlice.reducer;