import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    products : []
}

const productSlice = createSlice({
    name : "product",
    initialState,
    reducers : {
        setProducts : (state, action) => {
            state.products = action.payload;
        },
        addProducts : (state, action) => {
            state.products.push(action.payload);
        }
    }
})

export const { setProducts, addProducts } = productSlice.actions;
export default productSlice.reducer;