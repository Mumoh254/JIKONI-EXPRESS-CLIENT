import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Spinner, Alert, Badge,
  Modal, Form, Offcanvas, Stack, ListGroup, Tabs, Tab, ButtonGroup, Carousel, ProgressBar
} from 'react-bootstrap';
import {
  GeoAlt, Star, StarHalf, Cart, Scooter,
  CheckCircle, EggFried, FilterLeft, Calendar, Clock as ClockIcon, StarFill, CartPlus, Person, Clock, Instagram, Facebook, Twitter, Plus, Dash, Trash, Pencil, Bell
} from 'react-bootstrap-icons';
import { IoBarChartSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ChefRegistrationModal from '../../modals/chefRegistration';
import { Heart, HeartFill } from 'react-bootstrap-icons';
import { FaEye } from "react-icons/fa";
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';
import { GiKenya } from "react-icons/gi";
import RiderRegistration from '../../modals/riderRegistration';
import popSound from '../../../../public/audio/cliks.mp3';
import { jwtDecode } from "jwt-decode";
import moment from 'moment-timezone';

const theme = {
  primary: '#2563eb',
  secondary: '#c3e703',
  accent: '#CC00FF',
  light: '#fff',
  dark: '#CC00FF'
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

const DELIVERY_FEE = 100;

const CartContainer = styled(Offcanvas)`
  width: 380px !important;
  box-shadow: -4px 0 20px rgba(0,0,0,0.05);
  background: #f8f9fa;
`;

const CartItem = styled(ListGroup.Item)`
  transition: all 0.2s ease;
  background: transparent !important;
  border-bottom: 1px solid #eee !important;
  
  &:hover {
    transform: translateX(4px);
    background: white !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
`;

const FoodImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const FixedFooter = styled.div`
  position: sticky;
  bottom: 0;
  background: white;
  padding: 1.5rem;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  border-radius: 12px 12px 0 0;
`;

const RemoveButton = styled(Button)`
  opacity: 0.7;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
    color: #dc3545 !important;
  }
`;

const CartSidebar = ({ show, onClose, cart, updateCart, onCheckout, orderHistory }) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + DELIVERY_FEE;
  const [activeTab, setActiveTab] = useState('cart');

  return (
    <CartContainer show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton className="border-bottom bg-white">
        <Offcanvas.Title className="d-flex align-items-center gap-2">
          <CartPlus fontSize={24} className="text-primary" />
          <span className="fw-bold">Your Food Cart</span>
          <Badge bg="secondary" pill>{cart.length}</Badge>
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column p-0">
        <Tabs
          activeKey={activeTab}
          onSelect={setActiveTab}
          id="cart-tabs"
          className="mb-3 px-3"
          variant="pills"
        >
          <Tab eventKey="cart" title="Current Order">
            <div className="flex-grow-1 overflow-auto p-3">
              {cart.length === 0 ? (
                <div className="text-center text-muted py-4">
                  Your cart is empty. Start adding delicious items!
                </div>
              ) : (
                <ListGroup variant="flush">
                  {cart.map(item => (
                    <CartItem key={item.id} className="py-3 px-4">
                      <Stack direction="horizontal" gap={3} className="align-items-start">
                        <FoodImage 
                          src={item.photoUrls?.[0] || '/placeholder-food.jpg'}
                          alt={item.title}
                          className="mt-1"
                        />
                        
                        <Stack className="flex-grow-1">
                          <h6 className="mb-1 fw-semibold mb-2 ms-3">{item.title}</h6>
                          
                          {item.isPreOrder && (
                            <div className="ms-3 mb-2">
                              <Badge bg="info" className="me-2">
                                Pre-Order
                              </Badge>
                              <small className="text-muted">
                                {item.preOrderDate} at {item.preOrderTime}
                              </small>
                            </div>
                          )}
                          
                          <Stack direction="horizontal" gap={2} className="align-items-center ms-3">
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              className="d-flex align-items-center justify-content-center p-1"
                              style={{ width: '32px' }}
                              onClick={() => updateCart(item, -1)}
                              disabled={item.quantity === 1}
                            >
                              <Dash />
                            </Button>
                            
                            <span className="text-primary fw-bold">{item.quantity}</span>
                            
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              className="d-flex align-items-center justify-content-center p-1"
                              style={{ width: '32px' }}
                              onClick={() => updateCart(item, 1)}
                            >
                              <Plus />
                            </Button>
                          </Stack>
                        </Stack>

                        <Stack className="align-items-end">
                          <div className="text-end mb-2">
                            <span className="fw-semibold text-dark">KSh {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          
                          <Button 
                            size="sm"
                            className="d-flex align-items-center border-0 bgred gap-1"
                            onClick={() => updateCart(item, -item.quantity)}
                          >
                            <Trash size={14} />
                            <span>Remove</span>
                          </Button>
                        </Stack>
                      </Stack>
                    </CartItem>
                  ))}
                </ListGroup>
              )}
            </div>

            <FixedFooter>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal:</span>
                  <span className="fw-semibold">KSh {subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Delivery Fee:</span>
                  <span className="fw-semibold">KSh {DELIVERY_FEE.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between pt-2 border-top">
                  <span className="fw-bold">Total:</span>
                  <span className="fw-bold text-primary">KSh {total.toFixed(2)}</span>
                </div>
              </div>
              <Button 
                size="lg" 
                className="w-100 fw-bold py-3 bgred border-0"
                onClick={onCheckout}
                disabled={cart.length === 0}
              >
                Proceed to Checkout →
              </Button>
            </FixedFooter>
          </Tab>
          
          <Tab eventKey="history" title="Order History">
            <div className="p-3">
              {orderHistory.length === 0 ? (
                <div className="text-center text-muted py-4">
                  You haven't placed any orders yet
                </div>
              ) : (
                <ListGroup variant="flush">
                  {orderHistory.map(order => (
                    <ListGroup.Item key={order.id} className="py-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <h6 className="mb-0 fw-bold">Order #{order.id.slice(0, 8)}</h6>
                          <small className="text-muted">
                            {new Date(order.date).toLocaleString()}
                          </small>
                        </div>
                        <Badge bg={order.status === 'delivered' ? 'success' : 'warning'}>
                          {order.status}
                        </Badge>
                      </div>
                      
                      <div className="mb-2">
                        <strong>Items:</strong> 
                        <span className="ms-2">
                          {order.items.map(i => i.title).join(', ')}
                        </span>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Total:</strong> KSh {order.total.toFixed(2)}
                        </div>
                        
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary"
                            size="sm"
                            onClick={() => console.log('Call Chef')}
                          >
                            <Person className="me-1" /> Chef
                          </Button>
                          {order.rider && (
                            <Button 
                              variant="outline-success"
                              size="sm"
                              onClick={() => console.log('Call Rider')}
                            >
                              <Scooter className="me-1" /> Rider
                            </Button>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>
          </Tab>
        </Tabs>
      </Offcanvas.Body>
    </CartContainer>
  );
};

const OrderConfirmation = ({ cart, location, onConfirm, onBack }) => {
  const [locationError, setLocationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + DELIVERY_FEE;

  const handleConfirmOrder = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onConfirm();
    }, 1500);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white border-0 py-4">
              <h2 className="text-center mb-0">Confirm Your Order</h2>
            </Card.Header>
            
            <Card.Body>
              <div className="mb-4">
                <h5 className="mb-3">Delivery Location</h5>
                {location ? (
                  <div className="d-flex align-items-center bg-light p-3 rounded">
                    <GeoAlt size={24} className="text-primary me-3" />
                    <div>
                      <p className="mb-0 fw-bold">{location.address}</p>
                      <small className="text-muted">
                        Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                      </small>
                    </div>
                  </div>
                ) : (
                  <Alert variant="warning" className="d-flex align-items-center">
                    <ClockIcon size={20} className="me-2" />
                    <span>Fetching your location...</span>
                  </Alert>
                )}
                {locationError && (
                  <Alert variant="danger" className="mt-2">
                    {locationError}
                  </Alert>
                )}
              </div>
              
              <div className="mb-4">
                <h5 className="mb-3">Order Summary</h5>
                <ListGroup variant="flush">
                  {cart.map(item => (
                    <ListGroup.Item key={item.id} className="d-flex justify-content-between">
                      <div>
                        {item.title} 
                        {item.isPreOrder && (
                          <Badge bg="info" className="ms-2">
                            Pre-Order
                          </Badge>
                        )}
                        <span className="text-muted d-block">x {item.quantity}</span>
                      </div>
                      <div>
                        KSh {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </ListGroup.Item>
                  ))}
                  
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Subtotal</span>
                    <span>KSh {subtotal.toFixed(2)}</span>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Delivery Fee</span>
                    <span>KSh {DELIVERY_FEE.toFixed(2)}</span>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total</span>
                    <span className="text-primary">KSh {total.toFixed(2)}</span>
                  </ListGroup.Item>
                </ListGroup>
              </div>
              
              <div className="mb-4">
                <h5 className="mb-3">Payment Method</h5>
                <Form.Select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mb-3"
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="cash">Cash on Delivery</option>
                </Form.Select>
                
                {paymentMethod === 'mpesa' && (
                  <Form.Group className="mb-3">
                    <Form.Label>M-Pesa Phone Number</Form.Label>
                    <Form.Control 
                      type="tel"
                      placeholder="07XX XXX XXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </Form.Group>
                )}
              </div>
            </Card.Body>
            
            <Card.Footer className="bg-white border-0 py-3">
              <div className="d-grid gap-3">
                <Button 
                  variant="primary"
                  size="lg"
                  onClick={handleConfirmOrder}
                  disabled={isLoading || !location}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing Order...
                    </>
                  ) : 'Confirm Order'}
                </Button>
                
                <Button 
                  variant="outline-secondary"
                  size="lg"
                  onClick={onBack}
                >
                  Back to Cart
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const FoodPlatform = () => {
  const [state, setState] = useState({
    foods: [],
    orders: [],
    cart: [],
    showCart: false,
    loading: true,
    error: null,
    showChefReg: false,
    showRiderReg: false,
    showFoodPost: false,
    showAnalytics: false,
    showBikers: false,
    showEditFood: null,
    isChefMode: localStorage.getItem('isChef') === 'true',
    isRiderMode: localStorage.getItem('isRider') === 'true',
    filters: { area: 'all', specialty: 'all', mealType: 'all' },
    showOrderConfirmation: false,
    userLocation: null,
    locationError: null
  });
  
  const navigate = useNavigate();
  const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";
  const [userId, setUserId] = useState(null);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [preOrderForm, setPreOrderForm] = useState({
    date: '',
    time: '',
    instructions: '',
    servings: 1
  });
  const [orderHistory, setOrderHistory] = useState([]);

  const isChefOpen = (openingHours) => {
    if (!openingHours) return false;
    const [start, end] = openingHours.split(' - ');
    const now = moment.tz('Africa/Nairobi');
    const startTime = moment.tz(start, ['hA', 'ha', 'H:mm'], 'Africa/Nairobi');
    const endTime = moment.tz(end, ['hA', 'ha', 'H:mm'], 'Africa/Nairobi');
    return now.isBetween(startTime, endTime);
  };

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

    // Request Notification Permission
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        new Notification("Notifications Enabled");
      }
    });
    
    // Fetch foods
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/get/foods`);
        const data = await response.json();
        
        const areas = [...new Set(data.map(food => food.area))];
        const specialties = [...new Set(data.map(food => food.chef?.speciality))];

        setState(s => ({
          ...s,
          foods: data,
          areas: ['all', ...areas],
          specialties: ['all', ...specialties],
          loading: false
        }));
      } catch (err) {
        setState(s => ({ ...s, error: err.message, loading: false }));
      }
    };
    fetchData();
    
    // Fetch order history (mock data)
    const mockOrderHistory = [
      {
        id: 'order-12345',
        date: Date.now() - 2 * 24 * 60 * 60 * 1000,
        items: [
          { id: 'food1', title: 'Chicken Biryani', price: 450, quantity: 1 },
          { id: 'food2', title: 'Naan Bread', price: 80, quantity: 2 }
        ],
        total: 610,
        status: 'delivered',
        rider: { name: 'John Rider' }
      },
      {
        id: 'order-67890',
        date: Date.now() - 5 * 24 * 60 * 60 * 1000,
        items: [
          { id: 'food3', title: 'Vegetable Curry', price: 350, quantity: 1 }
        ],
        total: 350,
        status: 'delivered',
        rider: { name: 'Sarah Rider' }
      }
    ];
    setOrderHistory(mockOrderHistory);
  }, []);

  const filteredFoods = state.foods.filter(food => {
    const matchesArea = state.filters.area === 'all' || food.area === state.filters.area;
    const matchesSpecialty = state.filters.specialty === 'all' || food.chef?.speciality === state.filters.specialty;
    const matchesMealType = state.filters.mealType === 'all' || food.mealType === state.filters.mealType;
    return matchesArea && matchesSpecialty && matchesMealType;
  });

  const handleLike = async (foodId) => {
    if (!userId) return;
    try {
      const response = await fetch(`${BASE_URL}/food/${foodId}/like`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (response.ok) {
        // Update UI
      }
    } catch (error) {
      console.error("Error liking food:", error);
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

  const handlePreOrder = (food) => {
    setSelectedFood(food);
    setShowPreOrderModal(true);
    setPreOrderForm({
      date: '',
      time: '',
      instructions: '',
      servings: 1
    });
  };

  const handleSubmitPreOrder = () => {
    const preOrderItem = {
      ...selectedFood,
      isPreOrder: true,
      preOrderDate: preOrderForm.date,
      preOrderTime: preOrderForm.time,
      instructions: preOrderForm.instructions,
      quantity: preOrderForm.servings
    };
    
    updateCart(preOrderItem, preOrderForm.servings);
    setShowPreOrderModal(false);
  };

  const handleCheckout = () => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocode to get address (mock)
          const mockAddress = "123 Main St, Nairobi, Kenya";
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
      // Clear cart and go back to food platform
      setState(prev => ({
        ...prev,
        cart: [],
        showOrderConfirmation: false
      }));
    });
  };

  const registerChef = async (formData) => {
    try {
      playSound();
      const res = await fetch(`${BASE_URL}/chef`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('chefId', data.chef.id);
        localStorage.setItem('isChef', 'true');
        setState(s => ({ ...s, isChefMode: true, showChefReg: false }));
      }
    } catch (err) {
      console.error('Chef registration error:', err);
    }
  };

  const handleRiderRegistration = async (formData) => {
    try {
      playSound();
      const res = await fetch(`${BASE_URL}/rider`, {
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
        localStorage.setItem('riderId', data.rider.id);
        localStorage.setItem('isRider', 'true');
        setState(s => ({ ...s, showRiderReg: false, isRiderMode: true }));
      }
    } catch (err) {
      console.error('Registration error:', err);
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
      {/* Header */}
      <header className="header bg-white shadow-sm sticky-top">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center py-2 py-md-2">
            <div className="d-flex align-items-center gap-2 gap-md-3">
              <GiKenya className="text-primary header-icon" />
              <h1 className="m-0 brand-title">
                <span className="text-primary">Jikoni</span>
                <span className="text-danger px-1">Express</span>
              </h1>
            </div>
            <div className="d-flex gap-2 gap-md-3 align-items-center">
              {!state.isChefMode && !state.isRiderMode && (
                <div className="d-flex gap-1 gap-md-2">
                  <Button 
                    variant="outline-primary"
                    className="rounded-pill px-3 px-md-4 py-1 d-flex align-items-center"
                    onClick={() => setState(s => ({ ...s, showChefReg: true }))}
                  >
                    <Person className="me-1 me-md-2" />
                    <span className="d-none d-md-inline">Chef</span>
                  </Button>
                  <Button 
                    variant="outline-success"
                    className="rounded-pill px-3 px-md-4 py-1 d-flex align-items-center"
                    onClick={() => setState(s => ({ ...s, showRiderReg: true }))}
                  >
                    <Scooter className="me-1 me-md-2" />
                    <span className="d-none d-md-inline">Rider</span>
                  </Button>
                </div>
              )}
              {state.isChefMode && (
                <Button 
                  variant="danger"
                  className="rounded-pill px-3 px-md-4 py-1"
                  onClick={() => {
                    localStorage.removeItem('chefId');
                    setState(s => ({ ...s, isChefMode: false }));
                  }}
                >
                  <span className="d-none d-md-inline">Exit Chef Mode</span>
                  <span className="d-md-none">Exit</span>
                </Button>
              )}
              <Button 
                variant="warning"
                className="rounded-pill px-2 px-md-2 py-1 position-relative"
                onClick={() => setState(s => ({ ...s, showCart: true }))} 
                style={{ minWidth: 'auto' }}
              >
                <Cart className="me-1 me-md-2" />
                <span className="d-none d-md-inline">Cart</span>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
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
        <div className="stories-fixed-section bg-white shadow-sm">
       <div className="stories-fixed-section bg-white shadow-sm">

  
  <h4 className="mb-3 fw-bold mt-3" style={{ color: '#FF4532' }}>🍴 Jikoni Express Stories</h4>

  <div className="stories-container">
    <div className="stories-scroll">
      {/* Add Story Button */}
      <div 
        className="story-item" 
        onClick={() => registerAsChef()}
        style={{ marginRight: '1.5rem' }}
      >
        <div className="story-image-wrapper position-relative">
          <div className="story-gradient-border add-story-border">
            <img
              src="/images/story.png"
              alt="Add Story"
              className="story-img"
            />
            <div className="add-story-plus">
              <Plus size={28} className="text-white" />
            </div>
          </div>
          <div
            className="story-details"
            onClick={(e) => {
              e.stopPropagation();
              const chefId = localStorage.getItem('chefId');
              if (chefId) {
                postFood();
              } else {
                alert('Please register as a chef first to add a story.');
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="chef-name">Add Story</span>
          </div>
        </div>
      </div>

      {filteredFoods.map(food => (
        <div 
          key={food.id}
          className="story-item"
          onClick={() => navigate(`/chef/${food.chefId}`)}
          style={{ marginRight: '1rem' }}
        >
          <div className="story-image-wrapper position-relative">
            <div className="story-gradient-border">
              <img
                src={food.photoUrls?.[0] || '/placeholder-food.jpg'}
                alt={food.title}
                className="story-img"
              />
            </div>
            <div className="story-details">
              <span className="chef-name">{food.chef.user.Name}</span>
         <Badge pill className="location-badge overflow-hidden p-0">
  <GeoAlt size={14} className="me-1 ms-1 text-white" />

  <marquee
    behavior="scroll"
    direction="left"
    scrollAmount="3"
    className="marquee-badge w-100"
  >
    <span className="area-text text-white fw-bold me-2">
      {food.area}
    </span>
    
    <span className="discount-text fw-bold">
      | {food.discount ? `${food.discount}% OFF` : '0% OFF'}
    </span>
  </marquee>
</Badge>


            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  <style jsx>{`

.location-badge {
  background-color: #FF4532 !important;
  color: white !important;
  font-size: 0.65rem;
  border: none;
  max-width: 120px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: start;
  overflow: hidden;
  white-space: nowrap;
  padding-left: 4px;
}

.marquee-badge {
  display: block;
  white-space: nowrap;
  font-size: 0.65rem;
  line-height: 1;
}

.area-text {
  color: white;
}

.discount-text {
  color: #FFEB3B; /* Bright Yellow for strong contrast */
  font-weight: 800;
  margin-left: 3px;
}


    /* Discount Marquee Styles */
    .discount-marquee {
      background: linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa);
      color: white;
      overflow: hidden;
      position: relative;
      border-radius: 8px;
    }
    
    .marquee-content {
      display: inline-block;
      white-space: nowrap;
      animation: marquee 25s linear infinite;
      padding: 5px 0;
    }
    
    @keyframes marquee {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    
    .discount-badge {
      display: inline-flex;
      align-items: center;
      font-weight: 600;
      font-size: 0.9rem;
      padding: 0.25rem 0.75rem;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      backdrop-filter: blur(4px);
    }
    
    /* Existing Story Styles */
    .stories-container {
      position: relative;
      padding: 0 0rem;
    }

    .add-story-plus {
      position: absolute;
      bottom: 15px;
      right: 1px;
      background: #FF4532;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
    }

    .stories-scroll {
      display: flex;
      overflow-x: auto;
      gap: 0rem;
      padding: 1rem 0 1.5rem;
      -webkit-overflow-scrolling: touch;
    }

    .stories-scroll::-webkit-scrollbar {
      height: 3px;
      background-color: #f5f5f5;
    }

    .stories-scroll::-webkit-scrollbar-thumb {
      background: linear-gradient(45deg, #27ae60, #2ecc71);
      border-radius: 4px;
    }

    .story-item {
      flex: 0 0 auto;
      position: relative;
      width: 100px;
      cursor: pointer;
      transition: transform 0.2s ease;
      margin: 0 0.5rem;
    }

    .story-item:hover {
      transform: translateY(-5px);
    }

    .story-gradient-border {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      padding: 3px;
      background: linear-gradient(45deg, #FF4532 0%, #FF4532 100%);
      margin: 0 auto;
      box-shadow: 0 4px 15px rgba(39, 174, 96, 0.2);
    }

    .story-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      border: 2px solid white;
    }

    .story-details {
      text-align: center;
      margin-top: 8px;
      padding: 0 0.5rem;
    }

    .chef-name {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #2d3436;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .location-badge {
      position: absolute;
      top: -17px;
      right: 5px;
      background: #FF4532 !important;
      color: white !important;
      font-size: 0.65rem;
      padding: 4px 8px;
      border: none;
      max-width: 80px;
      display: flex;
      align-items: center;
    }


    

    .area-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
      max-width: 60px;
    }

    @media (max-width: 768px) {
      .discount-badge {
        font-size: 0.8rem;
        padding: 0.2rem 0.6rem;
      }
      
      .story-item {
        width: 80px;
        margin-right: 1rem;
      }
      
      .story-gradient-border {
        width: 72px;
        height: 72px;
      }
      
      .chef-name {
        font-size: 0.75rem;
      }
      
      .location-badge {
        font-size: 0.6rem;
        padding: 3px 6px;
        max-width: 70px;
      }
    }
  `}</style>
</div>

        </div>

        <div className="food-platform">
          {/* Pre-Order Modal */}
          <Modal show={showPreOrderModal} onHide={() => setShowPreOrderModal(false)} centered>
            <Modal.Header closeButton className="border-0 pb-0 bg-white">
              <Modal.Title className="fw-bold text-dark">Pre-Order Your Meal</Modal.Title>
            </Modal.Header>
            
            <Modal.Body className="bg-white py-4">
              {selectedFood && (
                <div className="d-flex align-items-center mb-4">
                  <div className="me-3" style={{ 
                    width: '80px', 
                    height: '80px', 
                    overflow: 'hidden',
                    borderRadius: '12px' 
                  }}>
                    <img 
                      src={selectedFood.photoUrls[0]} 
                      alt={selectedFood.title}
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold text-dark">{selectedFood.title}</h5>
                    <div className="d-flex align-items-center">
                      <Badge pill style={{
                        background: 'linear-gradient(45deg, #FF6B6B, #FF4532)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.4em 0.8em'
                      }}>
                        {selectedFood.mealType}
                      </Badge>
                      <span className="fw-bold text-danger ms-2">KES {selectedFood.price}</span>
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
                          onChange={(e) => setPreOrderForm({...preOrderForm, date: e.target.value})}
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
                          onChange={(e) => setPreOrderForm({...preOrderForm, time: e.target.value})}
                          className="border-0 py-2 px-3"
                          style={{ outline: 'none', boxShadow: 'none' }}
                        />
                      </div>
                      <small className="text-muted mt-1 d-block">Choose convenient time</small>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="servings">
                      <Form.Label className="fw-medium mb-2">Number of Servings</Form.Label>
                      <Form.Select 
                        aria-label="Number of Servings"
                        value={preOrderForm.servings}
                        onChange={(e) => setPreOrderForm({...preOrderForm, servings: parseInt(e.target.value)})}
                        className="py-2 px-3 border rounded-3"
                        style={{ 
                          height: 'calc(2.5rem + 10px)',
                          boxShadow: 'none'
                        }}
                      >
                        {[1,2,3,4,5,6,7,8].map(num => (
                          <option key={num} value={num}>{num} serving{num > 1 ? 's' : ''}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="totalPrice">
                      <Form.Label className="fw-medium mb-2">Total Price</Form.Label>
                      <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded-3 py-2">
                        <h4 className="mb-0 fw-bold text-danger">
                          {selectedFood ? `KES ${(selectedFood.price * preOrderForm.servings).toFixed(2)}` : ''}
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
                        placeholder="Any dietary restrictions or special requests..."
                        value={preOrderForm.instructions}
                        onChange={(e) => setPreOrderForm({...preOrderForm, instructions: e.target.value})}
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
                  background: '#FF4532',
                  border: 'none'
                }}
                onClick={handleSubmitPreOrder}
                disabled={!preOrderForm.date || !preOrderForm.time}
              >
                Confirm Pre-Order
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Food Grid */}
          <Row className="g-4 py-3">
            {state.foods.map(food => (
              <Col key={food.id} xs={12} md={6} lg={4} xl={4}>
                <Card className="h-100 shadow-sm border-0 overflow-hidden food-card" style={{ 
                  borderRadius: '16px', 
                  transition: 'all 0.3s ease'
                }}>
                  <div className="position-relative" style={{ overflow: 'hidden' }}>
                    <Carousel 
                      interval={null} 
                      indicators={food.photoUrls?.length > 1}
                      controls={false}
                    >
                      {food.photoUrls?.map((img, i) => (
                        <Carousel.Item key={i}>
                          <div className="ratio ratio-4x3">
                            <img
                              src={img}
                              alt={`${food.title} - Photo ${i+1}`}
                              className="card-img-top object-fit-cover"
                              style={{ transition: 'transform 0.5s ease' }}
                            />
                          </div>
                        </Carousel.Item>
                      ))}
                    </Carousel>
                    
                    <div className="position-absolute top-0 end-0 m-3">
                      <Badge className="price-tag fw-bold px-3 py-2">
                        KES {food.price}
                      </Badge>
                    </div>
                  </div>

                  <Card.Body className="d-flex flex-column pt-3 pb-0">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge pill style={{ 
                        background: 'rgba(255, 107, 107, 0.15)', 
                        color: '#FF6B6B',
                        fontSize: '0.9rem'
                      }}>
                        {food.mealType}
                      </Badge>
                      <small className="text-muted d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
                        <Clock className="me-1 text-primary" size={16} />
                        {formatDistanceToNow(new Date(food.createdAt), { addSuffix: true })}
                      </small>
                    </div>

                    <h5 className="mb-2 fw-bold food-title" style={{ fontSize: '1.3rem' }}>
                      {food.title}
                    </h5>

                    <div className="chef-profile bg-white p-3 rounded-3 mt-auto" style={{ 
                      border: '1px solid rgba(0,0,0,0.05)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className="chef-avatar"
                            onClick={() => {
                              playSound();
                              navigate(`/chef/${food.chef?.id}`);
                            }}
                            style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              border: '2px solid #FF6B6B',
                              cursor: 'pointer',
                              flexShrink: 0,
                              transition: 'transform 0.3s ease'
                            }}
                          >
                            <img
                              src={food.chef?.profilePicture || '/images/chef.png'}
                              alt={food.chef?.user?.Name}
                              className="w-100 h-100 object-fit-cover"
                            />
                          </div>

                          <div className="chef-info">
                            <h6 className="mb-0 fw-bold text-truncate" style={{ maxWidth: '130px' }}>
                              {food.chef?.user?.Name}
                            </h6>
                            <div className="d-flex align-items-center gap-2 mt-1">
                              <div className="d-flex align-items-center">
                                <StarFill className="text-warning" size={14} />
                                <small className="fw-medium ms-1">{food.chef?.rating || 'New'}</small>
                              </div>
                              <span className="text-muted fs-xs">•</span>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                          <div className="engagement-metric">
                            <div className="d-flex align-items-center justify-content-center gap-1 text-danger">
                              <Button 
                                variant="link" 
                                className="p-0"
                                onClick={() => handleLike(food.id)}
                              >
                                {food.likes > 0 ? <HeartFill size={20} /> : <Heart size={20} />}
                              </Button>
                              <span className="small fw-bold">{food.likes || 0}</span>
                            </div>
                            <div className="text-center mt-1">
                              <small className="text-muted fw-medium">Likes</small>
                            </div>
                          </div>
                          
                          <div className="engagement-metric">
                            <div className="d-flex align-items-center justify-content-center gap-1 text-success">
                              <FaEye size={20} />
                              <span className="small fw-bold">{food.views || 0}</span>
                            </div>
                            <div className="text-center mt-1">
                              <small className="text-muted fw-medium">Views</small>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                        <div className="d-flex align-items-center gap-2">
                          <Clock size={16} className="text-primary" />
                          <small className="fw-medium">
                            {food.chef?.openingHours || '8am - 6pm'}
                          </small>
                        </div>
                        <Badge
                          bg={isChefOpen(food.chef?.openingHours || '8am - 2pm') ? 'success' : 'secondary'}
                          className={`p-2 fw-medium text-${isChefOpen(food.chef?.openingHours || '8am - 2pm') ? 'light' : 'dark'}`}
                        >
                          {isChefOpen(food.chef?.openingHours || '8am - 2pm') ? 'Available' : 'Closed'}
                        </Badge>
                      </div>
                    </div>

                    <div className="d-flex gap-3 mt-4 mb-4">
                      <Button 
                        className="flex-grow-1 py-2 fw-bold"
                        style={{ 
                          borderRadius: '12px', 
                          border: '2px solid #2ECC71', 
                          color: '#2ECC71',
                          backgroundColor: 'transparent'
                        }}
                        onClick={() => handlePreOrder(food)}
                      >
                        Pre-Order
                      </Button>

                      <Button 
                        variant="primary" 
                        className="flex-grow-1 py-2 fw-bold"
                        style={{ 
                          borderRadius: '12px',
                          background: '#FF4532',
                          border: 'none'
                        }}
                        onClick={() => updateCart(food, 1)}
                      >
                        <CartPlus className="me-2" size={20} />
                        Add to Cart
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Registration Modals */}
      <ChefRegistrationModal 
        show={state.showChefReg}
        onClose={() => setState(s => ({ ...s, showChefReg: false }))}
        onSubmit={registerChef}
      />

      <RiderRegistration
        show={state.showRiderReg}
        onClose={() => setState(s => ({ ...s, showRiderReg: false }))}
        onSubmit={handleRiderRegistration}
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

export default FoodPlatform;