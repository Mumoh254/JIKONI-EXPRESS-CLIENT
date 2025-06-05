import { Navigate, Outlet } from "react-router-dom";
import jwtDecode from "jwt-decode";

const AdminRoute = () => {
  const token = localStorage.getItem("adminToken"); // Corrected local storage key

  if (!token) {
    console.warn("No token found! Redirecting to login...");
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const user = jwtDecode(token);
    console.log("Decoded User:", user);

    // Check if the token is expired
    if (user.exp * 1000 < Date.now()) {
      console.warn("Token has expired! Redirecting to login...");
      localStorage.removeItem("adminToken"); // Clear expired token
      return <Navigate to="/admin/login" replace />;
    }

    if (user.role !== "admin") {
      console.warn("User is not an admin! Redirecting...");
      return <Navigate to="/admin/login" replace />;
    }

    console.log("Access granted!");
    return <Outlet />;
  } catch (error) {
    console.error("Token invalid or malformed! Redirecting...");
    localStorage.removeItem("adminToken"); // Clear invalid token
    return <Navigate to="/admin/login" replace />;
  }
};

export default AdminRoute;
