import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Spinner, Alert, Badge,
  Modal, Form, Offcanvas,  Stack  , ListGroup, Tabs, Tab , ButtonGroup, Carousel, ProgressBar
} from 'react-bootstrap';
import {
  GeoAlt,  Star, StarHalf   ,Cart,  Scooter,
  CheckCircle, EggFried, FilterLeft,  Calendar,   Clock as ClockIcon   ,  StarFill, CartPlus, Person, Clock,  Instagram, Facebook, Twitter , Plus,  Dash, Trash, Pencil, Bell
} from 'react-bootstrap-icons';

import { useNavigate } from 'react-router-dom'; 
  import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import  ChefRegistrationModal   from  '../../modals/chefRegistration'

import { Heart, HeartFill } from 'react-bootstrap-icons';
import { FaEye } from "react-icons/fa";

import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';
import { GiKenya } from "react-icons/gi";

import   RiderRegistration    from   '../../modals/riderRegistration'

import popSound from '../../../../public/audio/cliks.mp3';

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

import { jwtDecode } from "jwt-decode"; // ✅ fixed



const FoodPlatform = (   food ) => {



  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [likedFoods, setLikedFoods] = useState({});
  

  const formatDistanceToNow = (date) => {
    // Simplified version - use date-fns in real implementation
    const hoursAgo = Math.floor((new Date() - date) / (1000 * 60 * 60));
    return `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''}`;
  };

  // Pre-order form state
  const [preOrderForm, setPreOrderForm] = useState({
    date: '',
    time: '',
    instructions: '',
    servings: 1
  });

  const handlePreOrder = (food) => {
    setSelectedFood(food);
    setShowPreOrderModal(true);
    // Reset form when opening modal
    setPreOrderForm({
      date: '',
      time: '',
      instructions: '',
      servings: 1
    });
  };

  const handleSubmitPreOrder = () => {
    console.log("Pre-order submitted:", {
      food: selectedFood,
      ...preOrderForm
    });
    setShowPreOrderModal(false);
  };


  




  // View increment effect
  useEffect(() => {
    const incrementViews = async () => {
      try {
        await fetch(`${BASE_URL}/food/${food.id}/view`, { method: 'PUT' });
      } catch (error) {
        console.error('Error incrementing views:', error);
      }
    };
    incrementViews();
  }, [food.id]);



  

  const playSound = () => {
    new Audio(popSound).play();
  };
  


  
  const colors = {
    primary: '#c3e703', // Vibrant lime green
    secondary: '#96d1c7', // Soft teal
    accent: '#ff6b6b',   // Coral pink
    dark: '#2d3436',     // Charcoal
    light: '#f5f6fa'     // Off-white
  };


  const navigate = useNavigate(); // Hook for navigation


  
  const [state, setState] = useState({
    foods: [],
    orders: [],
    riders: [],
    cart: [],
     showCart: false,
    cart: [],  // 
    
    loadingOrders: true,
    loading: true,
    error: null,
    showChefReg: false,
    showRiderReg: false,
    showCart: false,
    showFoodPost: false,
    showAnalytics: false,
    showBikers: false,
    showEditFood: null,
    isChefMode: localStorage.getItem('isChef') === 'true',
    isRiderMode: localStorage.getItem('isRider') === 'true',
    filters: { area: 'all', specialty: 'all', mealType: 'all' }
  });

 const  BASE_URL   =   "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke"
// 
  const [showRiderReg, setShowRiderReg] = useState(false);
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);

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
    console.log("User ID:", id);

    // Request Notification Permission
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        new Notification("Notifications Enabled");
      }
    });
  }, []);

  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };
  
  const loadData = async () => {
    try {
      const [foodsRes, ordersRes, ridersRes] = await Promise.all([
        fetch('${BASE_URL}/get/foods'),
        fetch('/api/orders'),
        fetch(`${BASE_URL}/riders`)
      ]);

   
      const foods = await foodsRes.json();
      const orders = await ordersRes.json();
      const riders = await ridersRes.json();

      const chefId = localStorage.getItem('chefId');
      const riderId = localStorage.getItem('riderId');

      setState(s => ({
        ...s,
        foods: chefId ? foods.filter(f => f.chef?.id === chefId) : foods,
        orders: orders.filter(o => {
          if(chefId) return o.chefId === chefId;
          if(riderId) return o.riderId === riderId;
          return o.userId === userId;
        }),
        riders,
        loading: false
      }));
    } catch (err) {
      setState(s => ({ ...s, error: err.message, loading: false }));
    }
  };

  useEffect(() => { loadData(); }, []);


  useEffect(() => {
    
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
  }, []);


  const handleLike = async (foodId) => {
  if (!userId) {
    console.warn("User ID is not available.");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/food/${foodId}/like`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),  // <- Ensure this line is correct
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      // Update your UI here
    } else {
      console.error("Failed to like food");
    }
  } catch (error) {
    console.error("Error liking food:", error);
  }
};


  const filteredFoods = state.foods.filter(food => {
    const matchesArea = state.filters.area === 'all' || food.area === state.filters.area;
    const matchesSpecialty = state.filters.specialty === 'all' || food.chef?.speciality === state.filters.specialty;
    const matchesMealType = state.filters.mealType === 'all' || food.mealType === state.filters.mealType;
    return matchesArea && matchesSpecialty && matchesMealType;
  });


  // Chef Food Management
  const createFood = async (foodData) => {
    try {
      playSound()
      const res = await fetch(`${BASE_URL}/food`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...foodData,
          chefId: localStorage.getItem('chefId')
        })
      });
      
      if(res.ok) {
        loadData();
        showNotification('New Food Added', `${foodData.title} now available!`);
      }
    } catch(err) {
      console.error('Create error:', err);
    }
  };


  const FilterSection = () => (
    <div className="mb-4 p-3 bg-white rounded shadow-sm">
      <Row className="g-3">
        <Col md={3}>
          <Form.Control
            placeholder="🔍 Search dishes..."
            value={state.filters.searchQuery}
            onChange={(e) => setState(s => ({ 
              ...s, 
              filters: { ...s.filters, searchQuery: e.target.value } 
            }))}
          />
        </Col>
        <Col md={3}>
          <Form.Select 
            value={state.filters.area}
            onChange={(e) => setState(s => ({ 
              ...s, 
              filters: { ...s.filters, area: e.target.value } 
            }))}
          >
            {state.areas?.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select 
            value={state.filters.specialty}
            onChange={(e) => setState(s => ({ 
              ...s, 
              filters: { ...s.filters, specialty: e.target.value } 
            }))}
          >
            {state.specialties?.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select 
            value={state.filters.mealType}
            onChange={(e) => setState(s => ({ 
              ...s, 
              filters: { ...s.filters, mealType: e.target.value } 
            }))}
          >
            <option value="all">All Meals</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </Form.Select>
        </Col>
      </Row>
    </div>
  );

  const updateFood = async (foodData) => {
    try {
      playSound()
      const res = await fetch(`${BASE_URL}/food/${foodData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData)
      });
      
      if(res.ok) {
        loadData();
        showNotification('Food Updated', `${foodData.title} updated successfully`);
      }
    } catch(err) {
      console.error('Update error:', err);
    }
  };

  const deleteFood = async (foodId) => {
    try {
      playSound()
      await fetch(`${BASE_URL}/food/${foodId}`, {
        method: 'DELETE'
      });
      loadData();
      showNotification('Food Removed', 'Item removed from your listings');
    } catch(err) {
      console.error('Delete error:', err);
    }
  };

  // Orders Management
  const updateOrderStatus = async (orderId, status) => {
    try {
      playSound()
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadData();
      showNotification('Order Updated', `Status changed to ${status}`);
    } catch(err) {
      console.error('Order update error:', err);
    }
  };



  // Add this cart management logic
const updateCart = (item, quantityChange) => {
  playSound()
  setState(prev => {
    const existingItem = prev.cart.find(i => i.id === item.id);
    let newCart = [...prev.cart];
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantityChange;
      if (newQuantity <= 0) {
        // Remove item if quantity reaches 0
        newCart = newCart.filter(i => i.id !== item.id);
      } else {
        // Update quantity
        newCart = newCart.map(i => 
          i.id === item.id ? { ...i, quantity: newQuantity } : i
        );
      }
    } else if (quantityChange > 0) {
      // Add new item to cart
      newCart.push({ 
        ...item,
        quantity: 1,
        price: Number(item.price)
      });
    }
    
    return { ...prev, cart: newCart };
  });
};

// Add these calculation functions
const calculateSubtotal = () => 
  state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

const calculateTotal = () => 
  calculateSubtotal() + DELIVERY_FEE;

  // Registration Handlers
  const registerChef = async (formData) => {
    try {
      playSound()
      const res = await fetch(`${BASE_URL}/chef`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      });

      const data = await res.json();
      if(res.ok) {
        localStorage.setItem('chefId', data.chef.id);
        localStorage.setItem('isChef', 'true');
        setState(s => ({ ...s, isChefMode: true, showChefReg: false }));
        showNotification('Chef Mode Activated', 'Welcome to your chef dashboard!');
      }
    } catch(err) {
      console.error('Chef registration error:', err);
    }
  };




const MySwal = withReactContent(Swal);

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end', // top-right corner
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});
const handleRiderRegistration = async (formData) => {
  try {
    playSound()
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
      setShowRiderReg(false);

      Toast.fire({
        icon: 'success',
        title: 'Rider Registered Successfully'
      });
    } else {
      Toast.fire({
        icon: 'error',
        title: data.message || 'Registration failed'
      });
    }

  } catch (err) {
    console.error('Registration error:', err);
    Toast.fire({
      icon: 'error',
      title: 'Something went wrong. Try again!'
    });
  }
};


  


const RiderRegistrationModal = ({ show, onClose, onSubmit, userId }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Rider Registration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            onSubmit({
              nationalId: formData.get('nationalId'),
              city: formData.get('city'),
              area: formData.get('area'),
              neighborhood: formData.get('neighborhood'),
              vehicleType: formData.get('vehicle'),
              registrationPlate: formData.get('registrationPlate'),
              workHours: formData.get('workHours'),
              serviceArea: formData.get('serviceArea'),
              agreedToTerms: formData.get('agreedToTerms') === 'on',
              userId: userId // Pass the userId from props
            });
          }}
        >
          {/* Form fields remain the same */}
          <Form.Group className="mb-3">
            <Form.Label>National ID</Form.Label>
            <Form.Control name="nationalId" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control name="city" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Area</Form.Label>
            <Form.Control name="area" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Neighborhood</Form.Label>
            <Form.Control name="neighborhood" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Vehicle Type</Form.Label>
            <Form.Select name="vehicle" required>
              <option value="Bicycle">Bicycle</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Car">Car</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>License Plate</Form.Label>
            <Form.Control name="registrationPlate" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Work Hours</Form.Label>
            <Form.Control name="workHours" placeholder="9am - 5pm" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Service Area</Form.Label>
            <Form.Control name="serviceArea" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="I agree to the terms and conditions"
              name="agreedToTerms"
              required
            />
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100">
            Register as Rider
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};


  return (
    <Container fluid className=" px-0" style={{ backgroundColor: theme.light }}>
      {/* Header */}
     <header className="header bg-white shadow-sm sticky-top">
  <div className="container">
    <div className="d-flex justify-content-between align-items-center py-2 py-md-2">
      {/* Branding */}
      <div className="d-flex align-items-center gap-2 gap-md-3">
        <GiKenya className="text-primary header-icon" />
        <h1 className="m-0 brand-title">
          <span className="text-primary">Jikoni</span>
          <span className="text-danger px-1">Express</span>
        </h1>
      </div>

      {/* Actions */}
      <div className="d-flex gap-2 gap-md-3 align-items-center">
        {/* Role Buttons */}
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

        {/* Exit Button */}
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

        {/* Cart Button */}
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

  <style jsx>{`
    .header {
      border-bottom: 2px solid rgba(0,0,0,0.1);
      z-index: 1000;
      transition: all 0.3s ease;
    }
    
    .brand-title {
      font-family: 'Pacifico', cursive;
      font-size: 1.75rem;
      letter-spacing: -1px;
      transition: font-size 0.3s ease;
    }
    
    .header-icon {
      font-size: 2rem !important;
      transition: font-size 0.3s ease;
    }
    
    .btn-outline-primary:hover,
    .btn-outline-success:hover {
      transform: translateY(-1px);
    }
    
    .btn-warning:hover {
      transform: scale(1.05) translateY(-1px);
    }
    
    .badge {
      font-size: 0.65rem;
      padding: 0.35em 0.6em;
      transition: all 0.3s ease;
    }
    
    @media (max-width: 768px) {
      .brand-title {
        font-size: 1.4rem;
      }
      
      .header-icon {
        font-size: 1.75rem !important;
      }
      
      .btn {
        font-size: 0.8rem;
      }
    }
    
    @media (max-width: 576px) {
      .brand-title {
        font-size: 1.25rem;
      }
      
      .header-icon {
        font-size: 1.5rem !important;
      }
      
      .btn {
        padding: 0.25rem 0.5rem;
      }
      
      .badge {
        font-size: 0.55rem;
        padding: 0.25em 0.5em;
      }
    }
  `}</style>
</header>

      {/* Main Content */}
      {state.isChefMode ? (
        <div className="py-2">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Chef Dashboard</h2>
            <div className="d-flex gap-2">
              <Button variant="success" onClick={() => setState(s => ({ ...s, showFoodPost: true }))}>
                + Post New Food
              </Button>
              <Button variant="info" onClick={() => setState(s => ({ ...s, showAnalytics: true }))}>
                Analytics
              </Button>
              <Button variant="warning" onClick={() => setState(s => ({ ...s, showBikers: true }))}>
                Available Riders
              </Button>
            </div>
          </div>

          <div className="table-responsive">
  <table className="table table-hover align-middle">
    <thead className="table-light">
      <tr>
        <th style={{ width: '100px' }}>Item</th>
        <th>Details</th>
        <th className="d-none d-md-table-cell">Description</th>
        <th>Price</th>
        <th className="d-none d-sm-table-cell">Type</th>
        <th className="d-none d-lg-table-cell">Posted</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {state.foods.map(food => (
        <tr key={food.id}>
          {/* Image Gallery */}
          <td>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img 
                src={food.photoUrls[0]} 
                alt={food.title}
                className="img-fluid"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: '#f8f9fa'
                }}
              />
              {food.photoUrls.length > 1 && (
                <span className="badge bg-dark position-absolute bottom-0 end-0 m-1">
                  +{food.photoUrls.length -1}
                </span>
              )}
            </div>
          </td>

          {/* Title and Mobile Details */}
          <td>
            <div className="d-flex flex-column">
              <strong className="mb-1">{food.title}</strong>
              <div className="d-flex d-md-none gap-1 flex-wrap">
                <span className="badge bg-primary">KES {food.price}</span>
                <span className="badge bg-info">{food.mealType}</span>
                <small className="text-muted">
                  {formatDistanceToNow(new Date(food.createdAt), { addSuffix: true })}
                </small>
              </div>
            </div>
          </td>

          {/* Description (Hidden on mobile) */}
          <td className="d-none d-md-table-cell">
            <p className="text-muted small mb-0 line-clamp-2">
              {food.description}
            </p>
          </td>

          {/* Price (Hidden on mobile - shown in title column) */}
          <td className="d-none d-md-table-cell">
            <span className="badge bg-primary">KES {food.price}</span>
          </td>

          {/* Meal Type (Hidden on mobile - shown in title column) */}
          <td className="d-none d-sm-table-cell">
            <span className="badge bg-info">{food.mealType}</span>
          </td>

          {/* Posted Date (Hidden on mobile) */}
          <td className="d-none d-lg-table-cell">
            <small className="text-muted">
              {formatDistanceToNow(new Date(food.createdAt), { addSuffix: true })}
            </small>
          </td>

          {/* Actions */}
          <td>
          <div className="d-flex gap-2 align-items-center">
  {/* Edit Button */}
  <button
    type="button"
    className="btn blue btn-sm hover-effect"
    onClick={() => setState(prev => ({ ...prev, showEditFood: food }))}
  >
    <i className="bi bi-pencil me-1"></i> Edit
  </button>

  {/* Delete Button */}
  <button
    type="button"
    className="btn red btn-sm hover-effect text-white"
    onClick={() => deleteFood(food.id)}
  >
    <i className="bi bi-trash me-1  "></i> Delete
  </button>
</div>

          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


    <Form
  onSubmit={async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    // Show loading toast
    Toast.fire({
      icon: 'info',
      title: 'Submitting...',
      timer: 5000,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch("http://localhost:8000/apiV1/smartcity-ke/create/food", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        Toast.fire({
          icon: 'success',
          title: 'Food successfully created'
        });
        // Optionally, reset the form
        e.target.reset();
      } else {
        Toast.fire({
          icon: 'error',
          title: data.message || 'Something went wrong'
        });
      }

    } catch (error) {
      console.error(error);
      Toast.fire({
        icon: 'error',
        title: 'Network error. Please try again'
      });
    }
  }}
  encType="multipart/form-data"
>

  <Form.Group>
    <Form.Label>Title</Form.Label>
    <Form.Control name="title" required />
  </Form.Group>


  <Form.Group>
    <Form.Label>Description</Form.Label>
    <Form.Control name="description" as="textarea" required />
  </Form.Group>


  <Form.Group>
    <Form.Label>Price</Form.Label>
    <Form.Control name="price" type="number" required />
  </Form.Group>

  <Form.Group>
    <Form.Label>Meal Type</Form.Label>
    <Form.Control name="mealType" required />
  </Form.Group>
<Form.Group>
  <Form.Label>Upload Food Images</Form.Label>
<Form.Control name="images" type="file" multiple required />

</Form.Group>


  <Form.Group>
    <Form.Label>Area</Form.Label>
    <Form.Control name="area" required />
  </Form.Group>

  <Form.Group>
    <Form.Label>Chef ID</Form.Label>
    <Form.Control name="chefId" required />
  </Form.Group>

  <Button type="submit">Create</Button>
</Form>



          {/* Edit Food Modal */}
          <Modal show={!!state.showEditFood} onHide={() => setState(s => ({ ...s, showEditFood: null }))}>
            <Modal.Header closeButton>
              <Modal.Title>Edit {state.showEditFood?.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                updateFood({
                  id: state.showEditFood.id,
                  ...Object.fromEntries(formData.entries())
                });
              }}>
                {/* Form fields */}
              </Form>
            </Modal.Body>
          </Modal>



          {/* Analytics Sidebar */}
          <Offcanvas show={state.showAnalytics} onHide={() => setState(s => ({ ...s, showAnalytics: false }))} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Chef Analytics</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="mb-4">
          <h5>Total Earnings</h5>
          <h2 className="text-success">KES {state.orders.reduce((sum, o) => sum + o.total, 0)}</h2>
        </div>
        <div className="mb-4">
          <h5>Completed Orders</h5>
          <h3>{state.orders.filter(o => o.status === 'delivered').length}</h3>
        </div>
        <div>
          <h5>Order Status Distribution</h5>
          <ProgressBar className="mb-2">
            <ProgressBar variant="success" now={
              (state.orders.filter(o => o.status === 'delivered').length / state.orders.length) * 100
            } />
            <ProgressBar variant="warning" now={
              (state.orders.filter(o => o.status === 'preparing').length / state.orders.length) * 100
            } />
          </ProgressBar>
        </div>
      </Offcanvas.Body>
    </Offcanvas>


          {/* Riders Sidebar */}

      <Offcanvas show={state.showBikers} onHide={() => setState(s => ({ ...s, showBikers: false }))} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Available Riders</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <ListGroup>
          {state.riders.map(rider => (
            <ListGroup.Item key={rider.id}>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>{rider.name}</h6>
                  <small>{rider.vehicle} ({rider.plate})</small>
                </div>
                <Button size="sm" variant="outline-primary">
                  Assign Order
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Offcanvas.Body>
    </Offcanvas>
  </div>
) : (
         // User Marketplace
       <div className="py-4 container-xl">
  {/* Stories Section */}
  <div className="stories-fixed-section bg-white shadow-sm ">
    <h4 className="mb-3 fw-bold " style={{ color: '#FF4532' }}>🍴 Jikoni Express Stories</h4>

    <div className="stories-container">
      <div className="stories-scroll ">
        {/* Add Story Button - Strict Addition */}
        <div 
          className="story-item" 
          onClick={() => registerAsChef()}
          style={{ marginRight: '1.5rem' }}
        >
          <div className="story-image-wrapper   position-relative">
            <div className="story-gradient-border add-story-border">
              <img
                src="/images/story.png"
                alt="Add Story"
                className="story-img  "
              />
              <div className="add-story-plus">
                <Plus size={28} className="text-white" />
              </div>
            </div>
         <div
  className="story-details"
  onClick={() => {
    const chefId = localStorage.getItem('chefId');
    if (chefId) {
      // Call your functionality for posting food
      postFood();
    } else {
      // Show alert or modal to register as chef
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
                <Badge pill className="location-badge">
                  <GeoAlt size={10} className="me-1 p-1" />
                  <span className="area-name">{food.area}</span>
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

  <style jsx>{`
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




    <div className="food-platform" style={{ backgroundColor: colors.light }}>
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
                  <span className="badge me-2" style={{
                    background: 'linear-gradient(45deg, #FF6B6B, #FF4532)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.4em 0.8em'
                  }}>
                    {selectedFood.mealType}
                  </span>
                  <span className="fw-bold text-danger">KES {selectedFood.price}</span>
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
            className="fw-medium px-4 py-2 "
            onClick={() => setShowPreOrderModal(false)}
          >
            Cancel
          </Button>
          <Button 
            className="px-4 py-2 fw-bold text-white "
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
              {/* Image Section */}
              <div className="position-relative" style={{ overflow: 'hidden' }}>
                <Carousel 
                  interval={null} 
                  indicators={food.photoUrls.length > 1}
                  controls={false}
                >
                  {food.photoUrls.map((img, i) => (
                    <Carousel.Item key={i}>
                      <div className="ratio ratio-4x3">
                        <img
                          src={img}
                          alt={`${food.title} - Photo ${i+1}`}
                          className="card-img-top object-fit-cover"
                          style={{ 
                            transition: 'transform 0.5s ease'
                          }}
                        />
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
                
                {/* Floating Price Tag */}
                <div className="position-absolute top-0 end-0 m-3">
                  <Badge className="price-tag fw-bold px-3 py-2">
                    KES {food.price}
                  </Badge>
                </div>
              </div>

              {/* Card Body */}
              <Card.Body className="d-flex flex-column pt-3 pb-0">
                {/* Food Metadata */}
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

                {/* Food Title */}
                <h5 className="mb-2 fw-bold food-title" style={{ fontSize: '1.3rem' }}>
                  {food.title}
                </h5>



                {/* Chef Profile */}
                <div className="chef-profile bg-white p-3 rounded-3 mt-auto" style={{ 
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    {/* Chef Info */}
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="chef-avatar"
                        onClick={() => {
                          playSound();
                          navigate(`/chef/${food.chef.id}`);
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
                          src={food.chef.profilePicture || '/images/chef.png'}
                          alt={food.chef.user.Name}
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>

                      <div className="chef-info">
                        <h6 className="mb-0 fw-bold text-truncate" style={{ maxWidth: '130px' }}>
                          {food.chef.user.Name}
                        </h6>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <div className="d-flex align-items-center">
                            <StarFill className="text-warning" size={14} />
                            <small className="fw-medium ms-1">{food.chef.rating || 'New'}</small>
                          </div>
                          <span className="text-muted fs-xs">•</span>
                       
                        </div>
                      </div>
                    </div>

                    {/* Engagement Metrics */}
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

                  {/* Opening Hours */}
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <div className="d-flex align-items-center gap-2">
                      <Clock size={16} className="text-primary" />
                      <small className="fw-medium">
                        {food.chef.openingHours || '8am - 6pm'}
                      </small>
                    </div>
                    <Badge bg="light" className="text-success p-2 fw-medium">
                      Available
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
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
                      background:  ' #FF4532',
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

      {/* Global Styles */}
      <style jsx global>{`
        .price-tag {
          background: #FF4532 !important;
          color: white !important;
          font-size: 1.1rem;
          box-shadow: 0 4px 12px rgba(255, 69, 50, 0.3);
     
        }

        .carousel-indicators {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          justify-content: center;
          padding: 0;
          margin: 0;
          list-style: none;
          z-index: 10;
        }
        
        .carousel-indicators button {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.5);
          border: none;
          margin: 0 5px;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .carousel-indicators .active {
          background-color: white;
          width: 25px;
          border-radius: 5px;
        }

        .food-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
        }
        
        .chef-avatar:hover {
          transform: scale(1.05);
        }

        .engagement-metric {
          min-width: 60px;
          text-align: center;
          background: rgba(0,0,0,0.02);
          border-radius: 8px;
          padding: 5px 8px;
        }

        @media (max-width: 767.98px) {
          .food-title {
            font-size: 1.25rem;
          }
          .chef-info {
            max-width: 130px;
          }
          .engagement-metric {
            min-width: 50px;
            padding: 4px 6px;
          }
        }

        @media (min-width: 768px) and (max-width: 1199.98px) {
          .food-title {
            font-size: 1.3rem;
          }
        }

        @media (min-width: 1200px) {
          .food-card {
            max-width: 380px;
            margin: 0 auto;
          }
          .food-title {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>


</div>
)}


      {/* Registration Modals */}
      <ChefRegistrationModal 
        show={state.showChefReg}
        onClose={() => setState(s => ({ ...s, showChefReg: false }))}
        onSubmit={registerChef}
      />

      <RiderRegistrationModal
        show={state.showRiderReg}
        onClose={() => setState(s => ({ ...s, showRiderReg: false }))}
        onSubmit={handleRiderRegistration}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        show={state.showCart}
        onClose={() => setState(s => ({ ...s, showCart: false }))}
        cart={state.cart}
      />
    </Container>
  );
};








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
const CartSidebar = ({ show, onClose, cart, updateCart, onCheckout }) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + DELIVERY_FEE;
  

  return (
    <CartContainer show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton className="border-bottom bg-white">
        <Offcanvas.Title className="d-flex align-items-center gap-2">
          <CartPlus fontSize={24} className="text-primary" />
          <span className="fw-bold ">Your Food Cart</span>
          <Badge bg="secondary"   pill>{cart.length}</Badge>
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column p-0">
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
                      src={item.photoUrls || '/placeholder-food.jpg'}
                      alt={item.title}
                      className="mt-1"
                    />
                    
                    <Stack className="flex-grow-1">
                      <h6 className="mb-1 fw-semibold mb-2 ms-3 ">{item.title}</h6>
                      
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
                        <span   >Remove</span>
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
      </Offcanvas.Body>
    </CartContainer>
  );
};

export   default    FoodPlatform;
