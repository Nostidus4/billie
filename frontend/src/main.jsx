import { StrictMode} from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RouterProvider } from "react-router";
import Login from "@pages/Auth/Login";
import SignUp from "@pages/Auth/SignUp";
import Home from "@pages/DashBoard/Home";
import Income from "@pages/DashBoard/Income";
import Expense from "@pages/DashBoard/Expense";
import ScanBill from "@pages/DashBoard/ScanBill";
import UserProvider from "@context/UserContext";
import Prediction from "@pages/DashBoard/Prediction";
// Định nghĩa Root trước
// eslint-disable-next-line react-refresh/only-export-components
const Root = () => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to="/login" />
  );
};
//---------------------------
// Test github push
const testgithub = () => {
  console.log("test github");
}//aaaaa
//---------------------------

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/dashboard",
    element: <Home />,
  },
  {
    path: "/income",
    element: <Income />,
  },
  {
    path: "/expense",
    element: <Expense />,
  },
  {
    path: "/scan-bill",
    element: <ScanBill />,
  },
  {
    path: "/prediction",
    element: <Prediction />,
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>
);