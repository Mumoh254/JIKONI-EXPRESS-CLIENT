import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Container, 
  Table, 
  Spinner, 
  Alert, 
  Badge,
  Button,
  ProgressBar 
} from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FiBox, FiClock, FiCheckCircle } from 'react-icons/fi';
import OrderDetails from './orderDetails';
import jwtDecode from 'jwt-decode';

const BASE_URL = 'http://localhost:8000/api/v1/shopingsite';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const statusConfig = {
    pending: {
      color: 'warning',
      progress: 25,
      icon: <FiClock className="text-warning" />
    },
    processing: {
      color: 'info',
      progress: 50,
      icon: <FiClock className="text-info" />
    },
    shipped: {
      color: 'primary',
      progress: 75,
      icon: <FiBox className="text-primary" />
    },
    delivered: {
      color: 'success',
      progress: 100,
      icon: <FiCheckCircle className="text-success" />
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = Cookies.get('userToken');
        if (!token) return navigate('/login');

        const decoded = jwtDecode(token);
        const endpoint = `${BASE_URL}/user-orders`;

        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const calculateTotalItems = (products) => {
    return products.reduce((acc, item) => acc + (item.quantity || 1), 0);
  };

  if (loading) return (
    <div className="text-center my-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2">Loading your orders...</p>
    </div>
  );

  if (error) return (
    <Container className="my-5">
      <Alert variant="danger">{error}</Alert>
      <Button variant="outline-primary" onClick={() => navigate(-1)}>
        Go Back
      </Button>
    </Container>
  );

  return (
    <Container className="my-5">
      <h2 className="mb-4">Your Orders</h2>

      {orders.length === 0 ? (
        <Alert variant="info">
          You haven't placed any orders yet.
          <Button variant="link" onClick={() => navigate('/')}>
            Start Shopping
          </Button>
        </Alert>
      ) : (
        <Table hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Items</th>
              <th>Total</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const currentStatus = statusConfig[order.status] || statusConfig.pending;

              return (
                <tr key={order._id}>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Badge bg={currentStatus.color}>
                      {currentStatus.icon} {order.status}
                    </Badge>
                  </td>
                  <td>
                    <ProgressBar
                      now={currentStatus.progress}
                      label={`${currentStatus.progress}%`}
                      variant={currentStatus.color}
                      striped
                      animated={order.status !== 'delivered'}
                    />
                  </td>
                  <td>{calculateTotalItems(order.products)} items</td>
                  <td>Ksh {(order.total || 0).toFixed(2)}</td>
                  <td>
                    <Button
                      as={Link}
                      to={`/order/${order._id}`}
                      variant="outline-primary"
                      size="sm"
                    >
                      View Order
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

// ✅ Corrected OrderDetailsLoader to fetch a single user order
export const OrderDetailsLoader = ({ children }) => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = Cookies.get('userToken');
        if (!token) return navigate('/login');

        const endpoint = `${BASE_URL}/user/orders/${id}`;

        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch order');
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!order) return <Alert variant="warning">Order not found</Alert>;

  return children(order);
};

OrderHistory.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      products: PropTypes.arrayOf(
        PropTypes.shape({
          product: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
          }),
          quantity: PropTypes.number,
        })
      ).isRequired,
      total: PropTypes.number.isRequired,
    })
  ),
};

export default OrderHistory;
