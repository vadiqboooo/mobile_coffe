import { createBrowserRouter } from "react-router";
import Menu from "./pages/Menu";
import CustomizeDrink from "./pages/CustomizeDrink";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Menu,
  },
  {
    path: "/customize/:drinkId",
    Component: CustomizeDrink,
  },
  {
    path: "/cart",
    Component: Cart,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/admin",
    Component: AdminLogin,
  },
  {
    path: "/admin/dashboard",
    Component: AdminDashboard,
  },
]);