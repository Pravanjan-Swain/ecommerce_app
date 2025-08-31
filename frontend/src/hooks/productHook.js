import axios from "../lib/axios.js";
import { useSelector, useDispatch } from "react-redux";
import { setProducts, addProducts } from "../redux/productSlice.js";
import toast from "react-hot-toast";


export const useCreateProduct = () => {
    const dispatch = useDispatch();
    const createProduct = async (productData, setLoading) => {
        setLoading(true);
        try {
            const response = await axios.post("/products", productData);
            const productResponse = response.data;

            if (!productResponse.success) {
                toast.error(productResponse.message);
                return;
            }

            dispatch(addProducts(productResponse.data));
            toast.success("Product created successfully!");
        } catch (error) {
            console.error("Product creation failed:", error);
            toast.error("Failed to create product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return createProduct;
}


export const useFetchAllProducts = () => {
    const dispatch = useDispatch();
    const fetchAllProducts = async (setLoading) => {
        setLoading(true);
        try {
            const response = await axios.get("/products");
            const productsResponse = response.data;

            if (!productsResponse.success) {
                toast.error(productsResponse.message);
                return;
            }

            dispatch(setProducts(productsResponse.data));
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to fetch products. Please try again.");
            dispatch(setProducts([]));
        } finally {
            setLoading(false);
        }
    };

    return fetchAllProducts;
}

export const useFetchProductByCategory = () => {
    const dispatch = useDispatch();
    const fetchProductByCategory = async (category, setLoading) => {
        setLoading(true);
        try {
            const response = await axios.get(`/products/category/${category}`);
            const productsResponse = response.data;

            if (!productsResponse.success) {
                toast.error(productsResponse.message);
                return;
            }

            dispatch(setProducts(productsResponse.data));
            toast.success("Products fetched successfully!");
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to fetch products. Please try again.");
            dispatch(setProducts([]));
        } finally {
            setLoading(false);
        }
    }
    
    return fetchProductByCategory;
}

export const useDeleteProduct = () => {
    const dispatch = useDispatch();
    const deleteProduct = async (productId, setLoading) => {
        setLoading(true);
        try {
            const response = await axios.delete(`/products/${productId}`);
            const productResponse = response.data;

            if (!productResponse.success) {
                toast.error(productResponse.message);
                return;
            }

            dispatch(setProducts(productResponse.data));
            toast.success("Product deleted successfully!");
        } catch (error) {
            console.error("Product deletion failed:", error);
            toast.error("Failed to delete product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return deleteProduct;
}

export const useToggleFeaturedProduct = () => {
    const dispatch = useDispatch();
    const toggleFeaturedProduct = async (productId, setLoading) => {
        setLoading(true);
        try {
            const response = await axios.patch(`/products/${productId}`);
            const productResponse = response.data;

            if (!productResponse.success) {
                toast.error(productResponse.message);
                return;
            }

            dispatch(setProducts(productResponse.data));

            toast.success("Product updated successfully!");
        } catch (error) {
            console.error("Product update failed:", error);
            toast.error("Failed to update product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return toggleFeaturedProduct;
}

export const useFetchFeaturedProducts = () => {
    const dispatch = useDispatch();
    const fetchFeaturedProducts = async (setLoading) => {
        setLoading(true);
        try {
            const response = await axios.get("/products/featured");
            const productsResponse = response.data;

            if (!productsResponse.success) {
                toast.error(productsResponse.message);
                return;
            }

            dispatch(setProducts(productsResponse.data));
        } catch (error) {
            console.error("Failed to fetch featured products:", error);
            toast.error("Failed to fetch featured products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return fetchFeaturedProducts;
}