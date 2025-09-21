import AppLayout from "@/components/layouts/appLayout";
import AuthLayout from "@/components/layouts/authLayout";
import LoginPage from "@/features/auth/components/loginPage";
import FoodsPage from "@/features/foods/components/foodPage";
import TablesPage from "@/features/tables/components/tablesPage";
import { createBrowserRouter } from "react-router-dom";
import Page404 from "./404";
import OrderPage from "@/features/orders/components/orderPage";
import OrderDetailPage from "@/features/orders/components/orderDetail";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <TablesPage />,
      },
      {
        path: "/foods",
        element: <FoodsPage />,
      },
      {
        path: "/orders",
        element: <OrderPage />,
      },
      {
        path: "/orders/:orderId",
        element: <OrderDetailPage />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Page404 />,
  },
]);

export default router;
