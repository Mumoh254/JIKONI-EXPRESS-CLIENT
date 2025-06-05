import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { FaTrash, FaUser, FaEye, FaBars, FaTimes, FaShoppingCart } from "react-icons/fa";
import Swal from "sweetalert2";
import { Container, Row, Col, ListGroup, Table, Badge, Spinner } from "react-bootstrap";

const  BASE_URLS =   'http://localhost:8000/api/v1/shopingsite'
const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUserOrders, setSelectedUserOrders] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get token from cookies
        const token = localStorage.getItem("adminToken");
  
        if (!token) {
          Cookies.remove("authToken");
          console.log("No token found, redirecting to login");
          navigate("/admin", { replace: true });
          return;
        }
  
        const response = await axios.get(
          `${BASE_URLS}/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (!Array.isArray(response.data?.data)) {
          throw new Error("Invalid response format");
        }
  
        setUsers(response.data.data);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, [navigate]);
  

  // Delete user handler
  const handleDelete = async (userId) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: "This will permanently remove the user and all associated data!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        const token = Cookies.get("authToken");
        await axios.delete(
          `${BASE_URLS}/deleteuser/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(users.filter(user => user._id !== userId));
        Swal.fire("Deleted!", "User has been removed.", "success");
      } catch (error) {
        Swal.fire("Error!", error.response?.data?.message || "Delete failed", "error");
      }
    }
  };

  // Fetch and show user details with orders
  const handleShowDetails = async (userId) => {
    try {
      setOrdersLoading(true);
      const token = Cookies.get("authToken");
      const userResponse = await axios.get(
        `${BASE_URLS}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const ordersResponse = await axios.get(
        `${BASE_URLS}/users/${userId}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user = userResponse.data.data;
      const orders = ordersResponse.data.orders || [];

      Swal.fire({
        title: `${user.name}'s Details`,
        html: `
          <div class="text-start">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> <span class="badge ${user.role === 'admin' ? 'bg-success' : 'bg-primary'}">${user.role}</span></p>
            <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
            <hr>
            <h5>Orders (${orders.length})</h5>
            ${orders.length > 0 ? 
              `<div class="user-orders">
                ${orders.map(order => `
                  <div class="order-item mb-2 p-2 border rounded">
                    <div><strong>Order ID:</strong> #${order._id.slice(-6)}</div>
                    <div><strong>Total:</strong> $${order.totalPrice?.toFixed(2)}</div>
                    <div><strong>Status:</strong> <span class="badge ${getStatusBadge(order.status)}">${order.status}</span></div>
                    <div><small>${new Date(order.createdAt).toLocaleDateString()}</small></div>
                  </div>
                `).join('')}
              </div>` : 
              '<p>No orders found</p>'}
          </div>
        `,
        width: '600px',
        showConfirmButton: false,
        willOpen: () => setOrdersLoading(false),
        willClose: () => setSelectedUserOrders(null),
      });
    } catch (error) {
      Swal.fire("Error!", error.response?.data?.message || "Failed to load details", "error");
    } finally {
      setOrdersLoading(false);
    }
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: "bg-secondary",
      Processing: "bg-primary",
      Shipped: "bg-info",
      Delivered: "bg-success",
      Cancelled: "bg-danger",
    };
    return statusMap[status] || "bg-warning";
  };

  return (


    <div className="main-content w-100 " style={{ overflowX: 'auto' , margin: "0" }}>
      <h3 className="mb-4  bg-light border-bottom">User Management</h3>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : error ? (
        <div className="alert alert-danger m-3">{error}</div>
      ) : users.length > 0 ? (
        <div className="table-container p-3">
          <Table striped bordered hover responsive className="m-0">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th style={{ width: '100px' }}>Avatar</th>
                <th>Name</th>
                <th>Email</th>
                <th style={{ width: '120px' }}>Role</th>
                <th style={{ width: '150px' }}>Joined</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt="Avatar"
                        className="user-avatar img-thumbnail"
                        style={{ width: '50px', height: '50px' }}
                      />
                    ) : (
                      <div className="d-flex justify-content-center">
                        <FaUser className="text-secondary" size={24} />
                      </div>
                    )}
                  </td>
                  <td className="text-nowrap">{user.name || "N/A"}</td>
                  <td className="text-truncate" style={{ maxWidth: '200px' }}>{user.email}</td>
                  <td>
                    <Badge 
                      bg={user.role === "admin" ? "success" : "primary"}
                      className="w-100 d-block"
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="text-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      <button 
                        className="btn btn-info btn-sm px-3"
                        onClick={() => handleShowDetails(user._id)}
                        disabled={ordersLoading}
                      >
                        {ordersLoading ? <Spinner size="sm" /> : <FaEye />}
                      </button>
                      <button 
                        className="btn btn-danger btn-sm px-3"
                        onClick={() => handleDelete(user._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="alert alert-info m-3">No users found</div>
      )}
    </div>

  );
};

export default Users;