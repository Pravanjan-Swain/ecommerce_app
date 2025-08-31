import { configureStore } from '@reduxjs/toolkit';
import authReducer from "./authSlice.js";
import cartReducer from "./cartSlice.js";
import productReducer from "./productSlice.js";

export const store = configureStore({
  reducer: {
    auth : authReducer,
    cart : cartReducer,
    product : productReducer
  }
});