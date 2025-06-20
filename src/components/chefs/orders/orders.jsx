import React, { useEffect, useState } from "react";
import axios from "axios";



import { 
  Container, Table, Spinner, Alert, Button, Modal,
  Form, Badge, OverlayTrigger, Tooltip
} from "react-bootstrap";
import { FaInfoCircle, FaSyncAlt } from "react-icons/fa";

const BASE_URL = 'http://localhost:8000/api/v1/shopingsite';

const statusColors = {
  'Not Processed': 'secondary',
  'Processing': 'primary',
  'Shipped': 'info',
  'Delivered': 'success',
  'Cancelled': 'danger',
  'on-the-way':  'secondary'
};

const statusOptions = Object.keys(statusColors);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});

  const normalizeOrderData = (order) => ({
    _id: order._id,
    createdAt: new Date(order.createdAt).toLocaleString(),
    updatedAt: new Date(order.updatedAt).toLocaleString(),
    user: {
      name: `${order.orderedBy?.firstname || ''} ${order.orderedBy?.lastname || ''}`.trim() || 'Unknown Customer',
      email: order.orderedBy?.email || 'Unknown Email',
      _id: order.orderedBy?._id
    },
    products: order.products.map(item => ({
      title: item.product?.title || 'Unnamed Product',
      quantity: item.quantity,
      price: item.product?.price || 0,
      _id: item.product?._id,
      image: item.product?.images?.[0]?.url
    })),
    total: order.total,
    status: order.orderStatus,
    shippingAddress: order.shippingAddress
  });

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(response.data.orders.map(normalizeOrderData));
      console.log(response.data.orders)
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `${BASE_URL}/order-status/${orderId}`,
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="text-center mt-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2">Loading orders...</p>
    </div>
  );

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Management</h2>
        <Button variant="outline-primary" onClick={fetchOrders}>
          <FaSyncAlt className="me-2" />
          Refresh Orders
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {orders.length === 0 ? (
        <Alert variant="info">No orders found</Alert>
      ) : (
        <Table striped hover responsive>
          <thead className="bg-dark text-white">
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>#{order._id.slice(-6).toUpperCase()}</td>
                <td>
                  <div>{order.shippingAddress.name}</div>
                  <small className="text-muted">{order.shippingAddress.email}</small>
                </td>
                <td>KES {order.total.toFixed(2)}</td>
                <td>
                  <Form.Select 
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    disabled={updatingStatus[order._id]}
                    style={{ width: 'fit-content' }}
                  >
                    {statusOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Form.Select>
                  {updatingStatus[order._id] && (
                    <small className="text-muted ms-2">
                      <Spinner animation="border" size="sm" />
                    </small>
                  )}
                </td>
                <td>{order.updatedAt}</td>
                <td>
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetails(true);
                    }}
                  >
                    <FaInfoCircle />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details - #{selectedOrder?._id.slice(-6).toUpperCase()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="row mb-4">
                <div className="col-md-6">
                  <h5>Customer Information</h5>
                  <p>
                    <strong>Name:</strong> {selectedOrder.shippingAddress.firstName}     {selectedOrder.shippingAddress.lastName}<br /><br />
                    <strong>Email:</strong> {selectedOrder.shippingAddress.email}
                  </p>
                </div>
                <div className="col-md-6">
                  <h5>Shipping Address</h5>
                  <p>
                <strong>Adress:</strong>    {selectedOrder.shippingAddress.address}<br />
                   <strong>City:</strong> {selectedOrder.shippingAddress.city}<br />
                 <strong>Zip Code:</strong>   {selectedOrder.shippingAddress.zip}
                  </p>
                </div>
              </div>

              <h5 className="mb-3">Products</h5>
              <Table bordered>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.products.map((product, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={product.image || '/placeholder-product.jpg'} 
                            alt={product.title}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                          />
                          {product.title}
                        </div>
                      </td>
                      <td>{product.quantity}</td>
                      <td>KES {product.price.toFixed(2)}</td>
                      <td>KES {(product.price * product.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="text-end mt-4">
                <h4  >
                  Grand Total: KES {selectedOrder.total.toFixed(2)}
                </h4>
                <Badge className="p-2 fw-bold"  pill bg={statusColors[selectedOrder.status]}>
                  <h6> Current Status: {selectedOrder.status} </h6>
                </Badge>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Orders;