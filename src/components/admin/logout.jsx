import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import Swal from "sweetalert2";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to end your admin session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout",
    });

    if (!isConfirmed) return;

    try {
      //  pre-logout message
      Swal.fire({
        icon: "info",
        title: "Logging out...",
        text: "Please wait...",
        timer: 1200,
        showConfirmButton: false,
      });

      // Remove stored admin token

      localStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminToken");

      // Clear  cookies

      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      //log  out  sucess  message 
      await Swal.fire({
        icon: "success",
        title: "Session Ended",
        text: "You have been logged out successfully.",
        showConfirmButton: false,
        timer: 1500,
      });

      // Redirect user to admin login page

      navigate("/admin/login", { replace: true, state: { logoutSuccess: true } });

    } catch (error) {
      console.error("Logout Error:", error);
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: "An error occurred while logging out.",
      });
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <button className="px-4 py-4 btn text-bg-info text-white border-0">
        !!! Attempting To Log - Out ..
      </button>
      <br />
      <div className="d-flex gap-3">

        {/* End Admin Session btn */}


        <button 
          onClick={handleLogout} 
          className="btn btn-danger px-5 py-3 fs-4 fw-bold d-flex align-items-center"
        >
          <FaSignOutAlt className="me-2" size={28} />
          End Admin Session
        </button>

        {/* Go  to Dashboard   btn */}
        <button 
          onClick={() => navigate("/admin/dashboard")} 
          className="btn btn-secondary px-5 py-3 fs-4 fw-bold"
        >
          Go Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default LogoutButton;
