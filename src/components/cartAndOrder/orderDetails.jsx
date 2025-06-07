// OrderDetails.js
import React from 'react';
import { 
  Container, 
  Button, 
  Spinner, 
  Alert, 
  Badge, 
  ProgressBar,
  Row,
  Col,
  Table,
  Card
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { 
  FiClock, 
  FiCheckCircle, 
  FiTruck,
  FiPackage,
  FiShoppingBag,
  FiKey
} from 'react-icons/fi';

const BASE_URL = 'http://localhost:8000/apiV1/smartcity-ke';

// Jikoni Express Color Palette
const colors = {
  primary: '#FF4532', // Jikoni Red
  secondary: '#00C853', // Jikoni Green
  darkText: '#1A202C', // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for the page
  cardBackground: '#FFFFFF', // White for the form card
  borderColor: '#D1D9E6', // Light border for inputs
  errorText: '#EF4444', // Red for errors
  placeholderText: '#A0AEC0', // Muted text for placeholders
  buttonHover: '#E6392B', // Darker red on button hover
  disabledButton: '#CBD5E1', // Gray for disabled buttons
};

const OrderDetailsLoader = ({ children }) => {
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const { orderId } = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = Cookies.get('userToken');
        if (!token) return navigate('/login');

        const response = await fetch(`${BASE_URL}/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error('Order not found');
          throw new Error('Failed to fetch order');
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
  }, [orderId, navigate]);

  const statusConfig = {
    'preparing': { 
      color: 'warning', 
      progress: 25, 
      icon: <FiClock />,
      display: 'Preparing'
    },
    'assigned': { 
      color: 'info', 
      progress: 50, 
      icon: <FiPackage />,
      display: 'Rider Assigned'
    },
    'out-for-delivery': { 
      color: 'primary', 
      progress: 75, 
      icon: <FiTruck />,
      display: 'On the Way'
    },
    'delivered': { 
      color: 'success', 
      progress: 100, 
      icon: <FiCheckCircle />,
      display: 'Delivered'
    },
    'cancelled': { 
      color: 'danger', 
      progress: 0, 
      icon: <FiClock />,
      display: 'Cancelled'
    }
  };

  if (loading) return (
    <div className="text-center my-5">
      <Spinner animation="border" variant="primary" style={{ color: colors.primary }} />
      <p className="mt-2" style={{ color: colors.darkText }}>Loading order details...</p>
    </div>
  );

  if (error) return (
    <Container className="my-5">
      <Alert variant="danger">{error}</Alert>
      <Button 
        variant="outline-primary" 
        onClick={() => navigate(-1)}
        style={{ 
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          color: colors.primary
        }}
      >
        Back to Orders
      </Button>
    </Container>
  );

  return children(order, statusConfig);
};

const OrderDetails = () => {
  return (
    <OrderDetailsLoader>
      {(order, statusConfig) => (
        <Container className="my-5" style={{ backgroundColor: colors.lightBackground, padding: '2rem', borderRadius: '12px' }}>
          <Button 
            variant="link" 
            onClick={() => window.history.back()} 
            className="mb-4"
            style={{ color: colors.primary, textDecoration: 'none' }}
          >
            &larr; Back to Orders
          </Button>

          <h2 className="mb-4" style={{ color: colors.darkText, borderBottom: `2px solid ${colors.primary}`, paddingBottom: '0.5rem' }}>
            Order Details
          </h2>
          
          <Row className="mb-4">
            <Col md={8}>
              <Card className="mb-4" style={{ backgroundColor: colors.cardBackground, border: `1px solid ${colors.borderColor}` }}>
                <Card.Body>
                  <h5 className="card-title" style={{ color: colors.darkText }}>Order Status</h5>
                  <div className="d-flex align-items-center">
                    <Badge 
                      bg={statusConfig[order.status].color}
                      className="me-3"
                      style={{ 
                        padding: '0.5rem 1rem',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {statusConfig[order.status].icon}
                      {statusConfig[order.status].display}
                    </Badge>
                    <ProgressBar 
                      now={statusConfig[order.status].progress}
                      label={`${statusConfig[order.status].progress}%`}
                      variant={statusConfig[order.status].color}
                      striped
                      animated={order.status !== 'delivered' && order.status !== 'cancelled'}
                      style={{ width: '300px', height: '1.5rem' }}
                    />
                  </div>
                </Card.Body>
              </Card>

              <h5 className="mb-3" style={{ color: colors.darkText }}>Order Items</h5>
              <Table hover responsive style={{ backgroundColor: colors.cardBackground }}>
                <thead>
                  <tr>
                    <th style={{ color: colors.darkText }}>Product</th>
                    <th style={{ color: colors.darkText }}>Price</th>
                    <th style={{ color: colors.darkText }}>Quantity</th>
                    <th style={{ color: colors.darkText }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                            alt={item.product.title}
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              objectFit: 'cover', 
                              marginRight: '1rem',
                              borderRadius: '8px'
                            }}
                          />
                          <span style={{ color: colors.darkText }}>{item.product.title}</span>
                        </div>
                      </td>
                      <td style={{ color: colors.darkText }}>Ksh {item.price.toFixed(2)}</td>
                      <td style={{ color: colors.darkText }}>{item.quantity}</td>
                      <td style={{ color: colors.darkText }}>Ksh {(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>

            <Col md={4}>
              <Card className="mb-4" style={{ backgroundColor: colors.cardBackground, border: `1px solid ${colors.borderColor}` }}>
                <Card.Body>
                  <h5 className="card-title" style={{ color: colors.darkText }}>Order Summary</h5>
                  <dl className="row">
                    <dt className="col-6" style={{ color: colors.placeholderText }}>Order ID</dt>
                    <dd className="col-6 text-end" style={{ color: colors.darkText }}>{order._id}</dd>

                    <dt className="col-6" style={{ color: colors.placeholderText }}>Order Date</dt>
                    <dd className="col-6 text-end" style={{ color: colors.darkText }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </dd>

                    <dt className="col-6" style={{ color: colors.placeholderText }}>Shipping Address</dt>
                    <dd className="col-6 text-end" style={{ color: colors.darkText }}>
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.zip}
                    </dd>

                    <dt className="col-6" style={{ color: colors.placeholderText }}>Total Amount</dt>
                    <dd className="col-6 text-end fw-bold" style={{ color: colors.primary }}>
                      Ksh {order.total.toFixed(2)}
                    </dd>
                    
                    {/* OTP Section */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <>
                        <dt className="col-6 mt-3" style={{ color: colors.placeholderText }}>
                          <div className="d-flex align-items-center">
                            <FiKey className="me-2" />
                            Delivery OTP
                          </div>
                        </dt>
                        <dd className="col-6 text-end mt-3">
                          <div 
                            className="fw-bold fs-4" 
                            style={{ 
                              color: colors.secondary,
                              backgroundColor: 'rgba(0, 200, 83, 0.1)',
                              padding: '0.5rem',
                              borderRadius: '8px',
                              display: 'inline-block'
                            }}
                          >
                            {order.otpCode}
                          </div>
                          <div className="mt-1" style={{ color: colors.placeholderText, fontSize: '0.8rem' }}>
                            Show this to the rider upon delivery
                          </div>
                        </dd>
                      </>
                    )}
                  </dl>
                </Card.Body>
              </Card>
              
              {/* Rider Information */}
              {order.rider && (
                <Card style={{ backgroundColor: colors.cardBackground, border: `1px solid ${colors.borderColor}` }}>
                  <Card.Body>
                    <h5 className="card-title" style={{ color: colors.darkText }}>Rider Information</h5>
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-3">
                        <div 
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: colors.lightBackground,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.primary,
                            fontWeight: 'bold',
                            fontSize: '1.5rem'
                          }}
                        >
                          {order.rider.name.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: colors.darkText, fontWeight: 'bold' }}>{order.rider.name}</div>
                        <div style={{ color: colors.placeholderText }}>{order.rider.vehicleType} • {order.rider.licensePlate}</div>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between mt-3">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        style={{ 
                          borderColor: colors.primary,
                          color: colors.primary,
                          flex: 1,
                          marginRight: '0.5rem'
                        }}
                      >
                        Call Rider
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        style={{ 
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                          flex: 1,
                          marginLeft: '0.5rem'
                        }}
                      >
                        Track Order
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
          
          {/* Additional Order Information */}
          <Row className="mt-4">
            <Col md={8}>
              <Card style={{ backgroundColor: colors.cardBackground, border: `1px solid ${colors.borderColor}` }}>
                <Card.Body>
                  <h5 className="card-title" style={{ color: colors.darkText }}>Delivery Instructions</h5>
                  <p style={{ color: colors.darkText }}>
                    {order.deliveryInstructions || 'No special instructions provided'}
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card style={{ backgroundColor: colors.cardBackground, border: `1px solid ${colors.borderColor}` }}>
                <Card.Body>
                  <h5 className="card-title" style={{ color: colors.darkText }}>Payment Information</h5>
                  <div className="d-flex justify-content-between">
                    <span style={{ color: colors.placeholderText }}>Payment Method:</span>
                    <span style={{ color: colors.darkText, fontWeight: 'bold' }}>{order.paymentMethod || 'M-Pesa'}</span>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <span style={{ color: colors.placeholderText }}>Payment Status:</span>
                    <Badge 
                      bg={order.paymentStatus === 'paid' ? 'success' : 'danger'}
                      style={{ fontSize: '0.9rem' }}
                    >
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
    </OrderDetailsLoader>
  );
};

export default OrderDetails;