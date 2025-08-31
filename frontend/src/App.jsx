import Layout from "./Layout/Layout.jsx";
import { createBrowserRouter } from "react-router";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage.jsx";
import PurchaseCancelPage from "./pages/PurchaseCancelPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index : true,
        element: <HomePage />,
      },
      {
        path: "signup",
        element: <SignUpPage />
      },
      {
        path:"login",
        element: <LoginPage />
      },
      {
        path: "secret-dashboard",
        element: <AdminPage />
      },
      {
        path: "category/:category",
        element: <CategoryPage />
      },
      {
        path: "cart",
        element: <CartPage />
      },
      {
        path: "purchase-success",
        element: <PurchaseSuccessPage />
      },
      {
        path: "purchase-cancel",
        element: <PurchaseCancelPage />
      }
    ]
  }
]);

export default router;