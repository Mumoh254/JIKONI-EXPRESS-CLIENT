import React, { useState, useEffect }  from 'react';
import {
  Container, Row, Col, Card, Button, Spinner, Alert, Badge,
  Modal, Form, Offcanvas, Stack, ListGroup, Tabs, Tab, ButtonGroup, Carousel, ProgressBar
} from 'react-bootstrap';

import {
  GeoAlt, Star, StarHalf, Cart, Scooter,
  CheckCircle, FilterLeft, Calendar, Clock as ClockIcon, StarFill, CartPlus, Person, Clock, Plus, Dash, Trash, Pencil, Bell
} from 'react-bootstrap-icons';

import { IoBarChartSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import VendorRegistrationModal from '../Liqour/vendorRegister';
import { Heart, HeartFill } from 'react-bootstrap-icons';
import { FaEye } from "react-icons/fa";
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';
import { GiKenya } from "react-icons/gi";
import DeliveryRegistration from '../Liqour/delivery';
import popSound from '../handler/playSound';

import LiquorProductsGrid from '../Liqour/liqourProdutsGrid';
import { jwtDecode } from "jwt-decode";
import moment from 'moment-timezone';
import { CartSidebar } from '../components/cartAndOrder/cart';
import OrderConfirmation from '../components/cartAndOrder/orderConfirm';
import { RiMotorbikeFill } from 'react-icons/ri';
import { FaCartPlus } from "react-icons/fa";
import { SiCodechef } from "react-icons/si"; // Corrected closing quote

const theme = {
  primary: '#1a237e',
  secondary: '#ff6f00',
  accent: '#d32f2f',
  light: '#f5f5f5',
  dark: '#121212'
};


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


const StyledCard = styled(Card)`
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .card-img-top {
    height: 200px;
    object-fit: cover;
  }
`;

const FilterButton = styled(Button)`
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  margin: 0 0.3rem;
`;

const StoriesContainer = styled.div`
  padding: 1rem 0;
  .story-item {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid ${theme.primary};
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      transform: scale(1.05);
      border-color: ${theme.accent};
    }
  }
`;

const ResponsiveCard = styled(Card)`
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .card-img-top {
    height: 200px;
    object-fit: cover;
    @media (max-width: 768px) {
      height: 150px;
    }
  }
`;

const StoryItem = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid ${theme.primary};
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    transform: scale(1.05);
    border-color: ${theme.accent};
  }
  @media (max-width: 576px) {
    width: 60px;
    height: 60px;
  }
`;

const parseTime = (timeStr, today) => {
  let time = moment.tz(`${today} ${timeStr}`, 'YYYY-MM-DD HH:mm', 'Africa/Nairobi');
  if (!time.isValid()) {
    time = moment.tz(`${today} ${timeStr}`, 'YYYY-MM-DD h:mma', 'Africa/Nairobi');
  }
  return time;
};

const isVendorOpen = (openingHours) => {
  if (!openingHours) return false;

  const [start, end] = openingHours.split(' - ');
  const now = moment.tz('Africa/Nairobi');
  const today = now.format('YYYY-MM-DD');

  const startTime = parseTime(start.trim().toLowerCase(), today);
  let endTime = parseTime(end.trim().toLowerCase(), today);

  if (endTime.isBefore(startTime)) {
    endTime = endTime.add(1, 'day');
  }

  return now.isSameOrAfter(startTime) && now.isBefore(endTime);
};

const getTimeUntilClosing = (openingHours) => {
  if (!openingHours) return null;

  const [start, end] = openingHours.split(' - ');
  const now = moment.tz('Africa/Nairobi');
  const today = now.format('YYYY-MM-DD');

  const parseTime = (timeStr, day) => {
    let time = moment.tz(`${day} ${timeStr}`, 'YYYY-MM-DD HH:mm', 'Africa/Nairobi');
    if (!time.isValid()) {
      time = moment.tz(`${day} ${timeStr}`, 'YYYY-MM-DD h:mma', 'Africa/Nairobi');
    }
    return time;
  };

  const startTime = parseTime(start.trim().toLowerCase(), today);
  let endTime = parseTime(end.trim().toLowerCase(), today);

  if (endTime.isBefore(startTime)) {
    endTime = endTime.add(1, 'day');
  }

  const duration = moment.duration(endTime.diff(now));

  if (duration.asMilliseconds() <= 0) {
    return null;
  }

  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();

  return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
};

const Liqour = () => {
  const [state, setState] = useState({
    products: [],
    orders: [],
    cart: [],
    showCart: false,
    showVendorReg: false, // Corrected to showVendorReg for consistency
    loading: true,
    error: null,
    showDeliveryReg: false,
    showProductPost: false,
    showAnalytics: false,
    showBikers: false,
    showEditProduct: null,
    isVendorMode: localStorage.getItem('isVendor') === 'true',
    isDeliveryMode: localStorage.getItem('isDelivery') === 'true',
    filters: { area: 'all', category: 'all', type: 'all' },
    showOrderConfirmation: false,
    userLocation: null,
    locationError: null
  });

  const navigate = useNavigate();
  const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";
  const [userId, setUserId] = useState(null);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [preOrderForm, setPreOrderForm] = useState({
    date: '',
    time: '',
    instructions: '',
    quantity: 1
  });
  const [orderHistory, setOrderHistory] = useState([]);

  const playSound = () => {
    new Audio(popSound).play();
  };

  useEffect(() => {
    const getUserIdFromToken = () => {
      const token = localStorage.getItem("token");
      if (!token) return null;
      try {
        const decoded = jwtDecode(token);
        return decoded?.id || decoded?.userId || decoded?._id || null;
      } catch (error) {
        console.error("Invalid token:", error);
        return null;
      }
    };

    const id = getUserIdFromToken();
    setUserId(id);

    // Request Notification permission
    if ("Notification" in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          console.log("Notifications enabled for Jikoni Express.");
        } else {
          console.warn("Notification permission denied or dismissed.");
        }
      });
    }

    // Fetch products
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/get/foods`);
        const data = await response.json();

        const areas = [...new Set(data.map(product => product.area))];
        const categories = [...new Set(data.map(product => product.category))];

        setState(s => ({
          ...s,
          products: data,
          areas: ['all', ...areas],
          categories: ['all', ...categories],
          loading: false
        }));
      } catch (err) {
        setState(s => ({ ...s, error: err.message, loading: false }));
      }
    };
    fetchData();

    // Mock order history
    const mockOrderHistory = [
      {
        id: 'order-12345',
        date: Date.now() - 2 * 24 * 60 * 60 * 1000,
        items: [
          { id: 'prod1', title: 'Premium Whiskey', price: 4500, quantity: 1 },
          { id: 'prod2', title: 'Cocktail Set', price: 1800, quantity: 2 }
        ],
        total: 8100,
        status: 'delivered',
        rider: { name: 'John Rider' }
      },
      {
        id: 'order-67890',
        date: Date.now() - 5 * 24 * 60 * 60 * 1000,
        items: [
          { id: 'prod3', title: 'Vodka Bottle', price: 3500, quantity: 1 }
        ],
        total: 3500,
        status: 'delivered',
        rider: { name: 'Sarah Rider' }
      }
    ];
    setOrderHistory(mockOrderHistory);
  }, []); // Empty dependency array means this runs once on mount

  const filteredProducts = state.products.filter(product => {
    const matchesArea = state.filters.area === 'all' || product.area === state.filters.area;
    const matchesCategory = state.filters.category === 'all' || product.category === state.filters.category;
    return matchesArea && matchesCategory;
  });

  const handleLike = async (productId) => {
    if (!userId) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Please log in to like products.',
        confirmButtonText: 'OK'
      });
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/product/${productId}/like`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (response.ok) {
        // Update UI logic for like count/status if needed
        console.log('Product liked/unliked:', data);
      } else {
        console.error('Failed to like product:', data.message);
      }
    } catch (error) {
      console.error("Error liking product:", error);
    }
  };

  const updateCart = (item, quantityChange) => {
    playSound();
    setState(prev => {
      const existingItem = prev.cart.find(i => i.id === item.id);
      let newCart = [...prev.cart];

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityChange;
        if (newQuantity <= 0) {
          newCart = newCart.filter(i => i.id !== item.id);
        } else {
          newCart = newCart.map(i =>
            i.id === item.id ? { ...i, quantity: newQuantity } : i
          );
        }
      } else if (quantityChange > 0) {
        newCart.push({
          ...item,
          quantity: 1,
          price: Number(item.price)
        });
      }

      return { ...prev, cart: newCart };
    });
  };

  const handlePreOrder = (product) => {
    setSelectedProduct(product);
    setShowPreOrderModal(true);
    setPreOrderForm({
      date: '',
      time: '',
      instructions: '',
      quantity: 1
    });
  };

  const handleSubmitPreOrder = () => {
    const preOrderItem = {
      ...selectedProduct,
      isPreOrder: true,
      preOrderDate: preOrderForm.date,
      preOrderTime: preOrderForm.time,
      instructions: preOrderForm.instructions,
      quantity: preOrderForm.quantity
    };

    updateCart(preOrderItem, preOrderForm.quantity);
    setShowPreOrderModal(false);
  };

  const handleCheckout = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mockAddress = "123 Main St, Nairobi, Kenya"; // You might get this via reverse geocoding
          setState(prev => ({
            ...prev,
            showCart: false,
            showOrderConfirmation: true,
            userLocation: {
              lat: latitude,
              lng: longitude,
              address: mockAddress
            }
          }));
        },
        (error) => {
          setState(prev => ({
            ...prev,
            showOrderConfirmation: true,
            locationError: "Failed to get your location: " + error.message
          }));
        }
      );
    } else {
      setState(prev => ({
        ...prev,
        showOrderConfirmation: true,
        locationError: "Geolocation is not supported by your browser"
      }));
    }
  };

  const handleConfirmOrder = () => {
    Swal.fire({
      title: 'Order Confirmed!',
      text: 'Your order has been placed successfully',
      icon: 'success',
      confirmButtonText: 'Continue Shopping'
    }).then(() => {
      setState(prev => ({
        ...prev,
        cart: [],
        showOrderConfirmation: false
      }));
    });
  };

  const registerVendor = async (formData) => {
    try {
      playSound();
      const res = await fetch(`${BASE_URL}/vendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('vendorId', data.vendor.id);
        localStorage.setItem('isVendor', 'true');
        setState(s => ({ ...s, isVendorMode: true, showVendorReg: false }));
        // Use navigate from react-router-dom to redirect
        navigate('/vendor/dashboard'); // Force redirect to vendor dashboard
        Swal.fire('Success', 'Vendor registered successfully!', 'success');
      } else {
        Swal.fire('Error', data.message || 'Vendor registration failed.', 'error');
      }
      return data; // Return data for the modal to handle success/failure
    } catch (err) {
      console.error('Vendor registration error:', err);
      Swal.fire('Error', 'An unexpected error occurred during registration.', 'error');
      return { message: 'An unexpected error occurred during registration.' }; // Return error structure
    }
  };

  const handleDeliveryRegistration = async (formData) => {
    try {
      playSound();
      const res = await fetch(`${BASE_URL}/delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          nationalId: formData.nationalId,
          city: formData.city,
          area: formData.area,
          neighborhood: formData.neighborhood,
          vehicleType: formData.vehicleType,
          registrationPlate: formData.registrationPlate,
          workHours: formData.workHours,
          serviceArea: formData.serviceArea,
          agreedToTerms: formData.agreedToTerms,
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('deliveryId', data.delivery.id);
        localStorage.setItem('isDelivery', 'true');
        setState(s => ({ ...s, showDeliveryReg: false, isDeliveryMode: true }));
        Swal.fire('Success', 'Delivery partner registered successfully!', 'success');
      } else {
        Swal.fire('Error', data.message || 'Delivery registration failed.', 'error');
      }
    } catch (err) {
      console.error('Registration error:', err);
      Swal.fire('Error', 'An unexpected error occurred during registration.', 'error');
    }
  };

  if (state.showOrderConfirmation) {
    return (
      <OrderConfirmation
        cart={state.cart}
        location={state.userLocation}
        onConfirm={handleConfirmOrder}
        onBack={() => setState(prev => ({ ...prev, showOrderConfirmation: false, showCart: true }))}
      />
    );
  }

  return (
    <Container fluid className="px-0" style={{ backgroundColor: theme.light }}>
      <header className="header bg-white shadow-sm sticky-top">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center py-2 py-md-3">

            {/* Logo */}
            <div className="d-flex align-items-center gap-2 gap-md-3">
              <GiKenya className="text-primary header-icon gradient-icon" />
              <h1 className="m-0 brand-title display-6 fw-bold">
                <span className="jikoni-red">Jikoni</span>
                <span className="jikoni-green px-1">Express</span>
              </h1>
            </div>

            {/* Right-side buttons */}
            <div className="d-flex gap-2 gap-md-3 align-items-center">


              {/* Vendor Button */}
              <Button
                variant="primary"
                className="px-3 px-md-4 py-1 d-flex align-items-center"
                style={{ backgroundColor: colors.primary, border: 'none' }}
                onClick={() => setState(s => ({ ...s, showVendorReg: true }))} 
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="lucide lucide-wine-icon lucide-wine">
                  <path d="M8 22h8" />
                  <path d="M7 10h10" />
                  <path d="M12 15v7" />
                  <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
                </svg>
                <span className="d-none d-md-inline ms-2">Vendor</span>
              </Button>

              {/* Cart */}
              <Button
                className="px-3 me-2 mt-1 px-md-2 py-1 position-relative d-flex align-items-center text-white border-0"
                style={{ backgroundColor: '#FFC107' }} // Warning Yellow
                onClick={() => setState(s => ({ ...s, showCart: true }))}
              >
                <FaCartPlus className="me-2" />
                <span className="d-none d-md-inline">Cart</span>
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-white"
                  style={{ backgroundColor: '#00C853' }} // Jikoni Green
                >
                  {state.cart.reduce((sum, i) => sum + i.quantity, 0)}
                  <span className="visually-hidden">items in cart</span>
                </span>
              </Button>

            </div>
          </div>
        </div>
      </header>


      <div className="py-4 container-xl">
        {/* Stories Section */}
        <div className="liquor-stories-container">
          <div className="stories-header">
            <h2 className="section-title">Premium Spirits Collection</h2>
            <p className="section-subtitle">Discover exclusive liquors from top Kenyan distributors</p>
          </div>

          <div className="stories-scroll-container">
            <div className="stories-scroll">
              {/* Add Story Button */}


              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="story-item"
                  onClick={() => navigate(`/vendor/${product.vendorId}`)}
                >
                  <div className="story-image-wrapper">
                    <div className="story-gradient-border">
                      <div className="product-image-container">
                        <img
                          src={product.photoUrls?.[0] || '/placeholder-liquor.jpg'}
                          alt={product.title}
                          className="story-img"
                        />
                      </div>
                      {product.discount > 0 && (
                        <div className="discount-badge">
                          {product.discount}% OFF
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="story-details">
                    <span className="vendor-name">{product.brand || product.title}</span>
                    <div className="vendor-info">
                      <span className="distributor-name">{product.vendor?.user?.Name || 'Premium Distributor'}</span>
                      <div className="location-info">
                        <GeoAlt size={14} className="location-icon" />
                        <span className="location-text">{product.area || 'Nairobi'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>


          </div>
        </div>

        <div className="liquor-platform">
          {/* Pre-Order Modal */}
          <Modal show={showPreOrderModal} onHide={() => setShowPreOrderModal(false)} centered>
            <Modal.Header closeButton className="border-0 pb-0 bg-white">
              <Modal.Title className="fw-bold text-dark">Pre-Order Your Spirits</Modal.Title>
            </Modal.Header>

            <Modal.Body className="bg-white py-4">
              {selectedProduct && (
                <div className="d-flex align-items-center mb-4">
                  <div className="me-3" style={{
                    width: '80px',
                    height: '80px',
                    overflow: 'hidden',
                    borderRadius: '12px'
                  }}>
                    <img
                      src={selectedProduct.photoUrls[0]}
                      alt={selectedProduct.title}
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold text-dark">{selectedProduct.title}</h5>
                    <div className="d-flex align-items-center">
                      <Badge pill style={{
                        background: 'linear-gradient(45deg, #1a237e, #283593)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.4em 0.8em'
                      }}>
                        {selectedProduct.category || 'Spirit'}
                      </Badge>
                      <span className="fw-bold text-danger ms-2">KES {selectedProduct.price}</span>
                    </div>
                  </div>
                </div>
              )}

              <Form>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId="preOrderDate">
                      <Form.Label className="fw-medium mb-2">Delivery Date</Form.Label>
                      <div className="input-group border rounded-3 overflow-hidden">
                        <span className="input-group-text bg-white border-0">
                          <Calendar size={18} className="text-muted" />
                        </span>
                        <Form.Control
                          type="date"
                          aria-label="Delivery Date"
                          value={preOrderForm.date}
                          onChange={(e) => setPreOrderForm({ ...preOrderForm, date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="border-0 py-2 px-3"
                          style={{ outline: 'none', boxShadow: 'none' }}
                        />
                      </div>
                      <small className="text-muted mt-1 d-block">Select delivery date</small>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="preOrderTime">
                      <Form.Label className="fw-medium mb-2">Delivery Time</Form.Label>
                      <div className="input-group border rounded-3 overflow-hidden">
                        <span className="input-group-text bg-white border-0">
                          <Clock size={18} className="text-muted" />
                        </span>
                        <Form.Control
                          type="time"
                          aria-label="Delivery Time"
                          value={preOrderForm.time}
                          onChange={(e) => setPreOrderForm({ ...preOrderForm, time: e.target.value })}
                          className="border-0 py-2 px-3"
                          style={{ outline: 'none', boxShadow: 'none' }}
                        />
                      </div>
                      <small className="text-muted mt-1 d-block">Choose convenient time</small>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="quantity">
                      <Form.Label className="fw-medium mb-2">Quantity</Form.Label>
                      <Form.Select
                        aria-label="Number of Bottles"
                        value={preOrderForm.quantity}
                        onChange={(e) => setPreOrderForm({ ...preOrderForm, quantity: parseInt(e.target.value) })}
                        className="py-2 px-3 border rounded-3"
                        style={{
                          height: 'calc(2.5rem + 10px)',
                          boxShadow: 'none'
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>{num} bottle{num > 1 ? 's' : ''}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="totalPrice">
                      <Form.Label className="fw-medium mb-2">Total Price</Form.Label>
                      <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded-3 py-2">
                        <h4 className="mb-0 fw-bold text-danger">
                          {selectedProduct ? `KES ${(selectedProduct.price * preOrderForm.quantity).toFixed(2)}` : ''}
                        </h4>
                      </div>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group controlId="specialInstructions">
                      <Form.Label className="fw-medium mb-2">Special Instructions</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Any special requests or delivery notes..."
                        value={preOrderForm.instructions}
                        onChange={(e) => setPreOrderForm({ ...preOrderForm, instructions: e.target.value })}
                        className="border rounded-3 p-3"
                        style={{ boxShadow: 'none' }}
                      />
                      <small className="text-muted mt-1 d-block">We'll accommodate your requests</small>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Modal.Body>

            <Modal.Footer className="bg-white border-0 pt-0">
              <Button
                variant="outline-secondary"
                className="fw-medium px-4 py-2"
                onClick={() => setShowPreOrderModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="px-4 py-2 fw-bold text-white"
                style={{
                  background: '#ff6f00',
                  border: 'none'
                }}
                onClick={handleSubmitPreOrder}
                disabled={!preOrderForm.date || !preOrderForm.time}
              >
                Confirm Pre-Order
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Liquor Products Grid */}
          <Row className="g-1 ">
            <LiquorProductsGrid />
          </Row>
        </div>
      </div>

      {/* Registration Modals */}
      <VendorRegistrationModal
        show={state.showVendorReg}
        onClose={() => setState(s => ({ ...s, showVendorReg: false }))}
        onSubmit={registerVendor}
      />

      <DeliveryRegistration
        show={state.showDeliveryReg}
        onClose={() => setState(s => ({ ...s, showDeliveryReg: false }))}
        onSubmit={handleDeliveryRegistration}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        show={state.showCart}
        onClose={() => setState(s => ({ ...s, showCart: false }))}
        cart={state.cart}
        updateCart={updateCart}
        onCheckout={handleCheckout}
        orderHistory={orderHistory}
      />
    </Container>
  );
};

export default Liqour;
