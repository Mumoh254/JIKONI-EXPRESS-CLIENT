import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Carousel, Badge, InputGroup    ,   Button, Spinner, Tabs, Tab, Modal, Form } from 'react-bootstrap';
import { StarHalf, CartPlus, GeoAlt, Clock,  EggFried   , People, Envelope, PersonBadge  ,    CheckCircleFill  ,  StarFill , PinMapFill  ,   AwardFill , ClockHistory ,   HeartFill ,  PersonLinesFill   ,  EyeFill,CashCoin } from 'react-bootstrap-icons';
import { format, formatDistanceToNow } from 'date-fns';
import { GiKenya } from "react-icons/gi";
import { BsCart } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa'; // Font Awesome User icon
import { BsScooter } from "react-icons/bs";
import {CartSidebar, PreOrderModal} from  '../../../components/cartAndOrder/cart'
import  OrderConfirmation   from '../../../components/cartAndOrder/orderConfirm'
import {
  updateCart,
  handlePreOrder,
  handleSubmitPreOrder,
handleCheckout,
  handleConfirmOrder
} from '../../cart&Orser/cart';




const ChefProfile = ({ addToCart }) => {

  const  BASE_URL   =   "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke"
  
  const { id: chefId } = useParams();
  const [chef, setChef] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireDetails, setHireDetails] = useState({
    eventType: '',
    date: '',
    time: '',
    people: 1,
    notes: ''
  });
  const [requestStatus, setRequestStatus] = useState(null);
    const [showBioModal, setShowBioModal] = useState(false); // New state for bio modal

const [mpesaPhone, setMpesaPhone] = useState('');
const [paymentProcessing, setPaymentProcessing] = useState(false);
const [paymentComplete, setPaymentComplete] = useState(false);


const initiateMpesaPayment = async () => {
  setPaymentProcessing(true);
  
  try {
    // In a real app, this would call your backend API
    // that initiates the M-Pesa STK push
    const response = await axios.post('/api/mpesa/payment', {
      phone: mpesaPhone,
      amount: 100,
      reference: `CHEF-${chef.id}-${Date.now()}`
    });
    
    // Simulate payment confirmation delay
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentComplete(true);
    }, 3000);
  } catch (error) {
    setPaymentProcessing(false);
    alert('Payment failed. Please try again.');
  }
};


    
      const [state, setState] = useState({
        foods: [],
        orders: [],
        riders: [],
        cart: [],
     

        
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




      
        const updateCart = (item, quantityChange) => {
        
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
      const onClose = () => setShowModal(false);
        const handlePreOrder = (food) => {
          setSelectedFood(food);
          setShowPreOrderModal(true);
          setPreOrderForm({
            date: '',
            time: '',
            instructions: '',
            servings: 1
          });
          onClose()
        };
       
        const handleSubmit = () => {
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
      

  // Color scheme
  const colors = {
    primary: '#2ecc71',
    primaryDark: '#2ecc71',
    danger: '#ef4444',
    dangerDark: '#dc2626',
    purple: '#2d3436',
    purpleDark: '#8b5cf6'
  };


  const newColors = {
  primary: '#4CAF50', // A fresh green
  primaryDark: '#388E3C', // A darker shade of green
  secondary: '#607D8B', // A cool gray
  text: '#333333', // Dark text
  background: '#F5F5F5' // Light background
};

const modalColors = {
  primary: '#4CAF50', // A fresh green
  primaryDark: '#388E3C', // A darker shade of green
  text: '#333333', // Dark text
  background: '#F5F5F5', // Light background for modal body
  headerBackground: '#E0E0E0' // Slightly darker background for header
};

  

// Add these calculation functions
const calculateSubtotal = () => 
  state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    const fetchChefData = async () => {
      try {
        const [chefRes, foodsRes] = await Promise.all([
          fetch(`${BASE_URL}/chef/${chefId}`),
          fetch(`${BASE_URL}/foods?chefId=${chefId}`)
        ]);

        const chefData = await chefRes.json();
        const foodsData = await foodsRes.json();

        setChef(chefData?.data || null);
        setFoods(foodsData?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChefData();
  }, [chefId]);

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    setRequestStatus('loading');
    
    try {
      const response = await fetch('http://localhost:8000/apiV1/smartcity-ke/hire-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chefId,
          ...hireDetails,
          requestDate: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Request failed');
      
      setRequestStatus('success');
      setTimeout(() => setShowHireModal(false), 2000);
    } catch (error) {
      console.error('Hire request error:', error);
      setRequestStatus('error');
    }
  };

  const filteredFoods = foods.filter(food => 
    selectedMealType === 'all' || food.mealType?.toLowerCase() === selectedMealType
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" style={{ color: colors.primary }} />
      </div>
    );
  }

  if (!chef) return <div className="text-center py-5">Chef not found</div>;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>



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
              <FaUser  className="me-1 me-md-2" />
              <span className="d-none d-md-inline">Chef</span>
            </Button>
            <Button 
              variant="outline-success"
              className="rounded-pill px-3 px-md-4 py-1 d-flex align-items-center"
              onClick={() => setState(s => ({ ...s, showRiderReg: true }))}
            >
              <BsScooter className="me-1 me-md-2" />
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
  onClick={() => {
    updateCart(); // Call your function
    setState(s => ({ ...s, showCart: true })); // Show the cart modal
  }}
  style={{ minWidth: 'auto' }}
>
  <BsCart className="me-1 me-md-2" />
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
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.3s ease;
}

/* Brand Title */
.brand-title {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  transition: font-size 0.3s ease;
}

/* Header Icons */
.header-icon {
  font-size: 2rem !important;
  transition: font-size 0.3s ease;
}

/* Button Hover Effects */
.btn-outline-primary:hover,
.btn-outline-success:hover {
  transform: translateY(-1px);
}

.btn-warning:hover {
  transform: scale(1.05) translateY(-1px);
}

/* Badge */
.badge {
  font-size: 0.7rem;
  padding: 0.4em 0.65em;
  border-radius: 0.65rem;
  transition: all 0.3s ease;
}

/* Medium Screens */
@media (max-width: 768px) {
  .brand-title {
    font-size: 1.6rem;
  }

  .header-icon {
    font-size: 1.6rem !important;
  }

  .btn {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }

  .badge {
    font-size: 0.6rem;
    padding: 0.3em 0.55em;
  }
}

/* Small Screens */
@media (max-width: 576px) {
  .brand-title {
    font-size: 1.45rem;
  }

  .header-icon {
    font-size: 1.5rem !important;
  }

  .btn {
    font-size: 1rem;
    padding: 0.5rem 1rem; /* Increased for better touch area */
  }

  .badge {
    font-size: 1rem;
    padding: 0.3em 0.55em;
  }
}

  `}</style>
</header>



{/* Chef Header - Compact & Modern */}



<div style={{ 
  backgroundColor: '#ffffff',
  padding: '1.25rem 0',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  borderBottom: '1px solid #f0f0f0'
}}>
  <div className="container">
    <div className="d-flex flex-column flex-md-row align-items-start justify-content-between gap-4">
      {/* Left Section: Profile Image */}
      <div className="d-flex align-items-start gap-3">
        <div className="position-relative" style={{ flexShrink: 0 }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #f8f9fa',
            boxShadow: '0 3px 8px rgba(0,0,0,0.08)'
          }}>
            <img
              src={'/images/chef.png'}
              alt={chef.user?.Name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            backgroundColor: '#2ECC71',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '2px solid #ffffff'
          }}>
            <StarFill style={{ color: 'white', fontSize: '0.7rem' }} />
          </div>
        </div>

        {/* Name & Location */}
        <div>
          <div style={{ marginBottom: '0.25rem' }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '0.15rem',
              color: '#333'
            }}>
              {chef.user?.Name}
            </h1>

            
            <div style={{
              display: 'flex',
              gap: '0.3rem',
              alignItems: 'center',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              <PinMapFill style={{ fontSize: '0.9rem', color: '#FF4532' }} />
              <span>{chef?.location} • {chef.area}</span>
            </div>
          </div>

          {/* ProChef & Verified */}
          <div className="d-flex gap-2 mt-2">
            <div style={{
              backgroundColor: '#f0f9ff',
              color: '#0ea5e9',
              padding: '0.25rem 0.75rem',
              borderRadius: '16px',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              border: '1px solid #e0f2fe'
            }}>
              <StarFill style={{ fontSize: '0.7rem' }} />
              <span>PRO CHEF</span>
            </div>
            <div style={{
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              padding: '0.25rem 0.75rem',
              borderRadius: '16px',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              border: '1px solid #dcfce7'
            }}>
              <CheckCircleFill style={{ fontSize: '0.7rem' }} />
              <span>VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Stats */}
      <div className="d-flex flex-wrap align-items-center gap-4" style={{ minWidth: '280px' }}>
        {/* Followers */}
        <div className="text-center">
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#FF4532',
          }}>
            {chef.followers || 0}
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#777',
            textTransform: 'uppercase'
          }}>
        Views
          </div>
        </div>
        
        {/* Likes */}
        <div className="text-center">
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#FF4532',
          }}>
            {chef.likes || 0}
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#777',
            textTransform: 'uppercase'
          }}>
            Likes
          </div>
        </div>
        
        {/* Experience */}
        <div className="text-center">
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#FF4532',
          }}>
            {chef.experienceYears}
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#777',
            textTransform: 'uppercase'
          }}>
            Years Exp
          </div>
        </div>
        
        {/* Cuisine Type */}
        <div style={{
          backgroundColor: '#f0fdf4',
          color: '#16a34a',
          padding: '0.35rem 1rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <EggFried style={{ fontSize: '0.85rem' }} />
          <span>{chef.cuisineType || 'Continental'}</span>
        </div>
      </div>

      {/* Right Section: Buttons */}
      <div className="d-flex flex-wrap align-items-center gap-2">
<Button 
  className="d-flex align-items-center px-5 py-2 custom-outline-green"
  onClick={() => setShowBioModal(true)}
  style={{
    fontWeight: 500,
    fontSize: '0.85rem'
  }}
>
  <PersonLinesFill className="me-1" /> View Bio
</Button>


        <Button 
          className=' px-5 py-2 d-flex align-items-center'
          onClick={() => setShowHireModal(true)}
          style={{
            background: '#FF4532',
            color: 'white',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          Hire Chef
        </Button>
      </div>
    </div>
  </div>
</div>

      {/* Main Content */}
      <div className="container py-5">
        <Row className="g-4">
          {/* Chef Details Sidebar */}
     
{/* Compact Auto-Scroll Foods Section */}
<div className="py-3" style={{ backgroundColor: '#f8f9fa' }}>
  <div className="container">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="fw-bold mb-0" style={{ 
        color: colors.primary,
        fontSize: '1.1rem',
        display: 'flex',
        alignItems: 'center'
      }}>
        <StarHalf className="me-2" style={{ width: '18px', height: '18px' }} /> 
        Signature Creations
      </h5>
      
      <div className="d-flex gap-1">
        <button className="btn btn-sm   px-3 py-1"  style={{  background:  '#FF4532'  ,  color:  '#fff'}} >
          View All
        </button>
      </div>
    </div>
    
    <div className="foods-scroll-container position-relative">
      <div className="foods-scroll d-flex pb-2">
        {foods.map(food => (
          <div key={food.id} className="food-scroll-item" style={{ width: '200px' }}>
            <Card className="h-100 shadow-sm border-0" style={{
              borderRadius: '10px',
              overflow: 'hidden',
              transition: 'all 0.2s ease'
            }}>
              {/* Food Image */}
              <div className="position-relative">
                <div className="ratio ratio-1x1">
                  <img
                    src={food.photoUrls?.[0] || '/placeholder-food.jpg'}
                    alt={food.title}
                    className="card-img-top object-fit-cover"
                    onError={(e) => (e.target.src = '/placeholder-food.jpg')}
                  />
                </div>
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
               
                  padding: '2px 10px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}>
                  <span style={{
                    color: colors.primary,
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}>
                    KES {food.price}
                  </span>
                </div>
              </div>

              <Card.Body className="d-flex flex-column p-2">
                <h6 className="fw-bold mb-1 mt-1" style={{ 
                  color: '#333',
                  fontSize: '0.95rem',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {food.title}
                </h6>

                <div className="d-flex gap-1 flex-wrap mb-2">
                  <span className="badge rounded-pill" style={{ 
                    backgroundColor: '#eef2ff',
                    color: colors.purple,
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}>
                    {food.cuisineType}
                  </span>
                  <span className="badge rounded-pill" style={{ 
                    backgroundColor: '#fef2f2',
                    color: colors.danger,
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}>
                    {food.dietary}
                  </span>
                </div>

                <div className="d-flex gap-2 mt-auto">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="flex-grow-1"
                    style={{ 
                      padding: '0.25rem',
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      borderWidth: '1px',

                

    border: '2px solid #2ECC71', 
    color: '#2ECC71',
    backgroundColor: 'transparent'

                    }}
                    onClick={() => handlePreOrder(food)}
                  >
                    Pre-order
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-grow-1 d-flex align-items-center justify-content-center"
                    style={{ 
                      backgroundColor: '#FF4532',
                      borderColor: '#FF4532',
                      padding: '0.25rem',
                      fontSize: '0.8rem',
                      borderRadius: '6px'
                    }}
                    onClick={() => updateCart(food)}
                  >
                    <CartPlus style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                    Add
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
 
</div>

  <style jsx>{`
    .foods-scroll-container {
      position: relative;
      padding-bottom: 1rem;
    }

    .foods-scroll {
      display: flex;
      overflow-x: auto;
      gap: 1.5rem;
      padding-bottom: 1rem;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x proximity;
      scrollbar-width: thin;
      scrollbar-color: ${colors.primary} #f1f1f1;
    }

    .food-scroll-item {
      flex: 0 0 280px;
      scroll-snap-align: start;
      transition: transform 0.2s ease;
    }

    .food-scroll-item:hover {
      transform: translateY(-4px);
    }

    .foods-scroll::-webkit-scrollbar {
      height: 4px;
    }

    .foods-scroll::-webkit-scrollbar-thumb {
      background-color: ${colors.primary};
      border-radius: 4px;
    }

    .foods-scroll::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .food-scroll-item {
        flex: 0 0 240px;
      }
      
      h5 {
        font-size: 1.1rem !important;
      }
    }
  `}</style>
</div>
          {/* Menu Items */}
          <Col lg={8}>
            <Tabs 
              activeKey={selectedMealType} 
              onSelect={setSelectedMealType}
              className="mb-4"
              style={{
                '--bs-nav-link-color': colors.primary,
                '--bs-nav-link-hover-color': colors.primaryDark,
                '--bs-nav-tabs-link-active-color': 'white',
                '--bs-nav-tabs-link-active-bg': colors.primary
              }}
            >
              <Tab eventKey="all" title="All Meals" />
              <Tab eventKey="breakfast" title="Breakfast" />
              <Tab eventKey="lunch" title="Lunch" />
              <Tab eventKey="dinner" title="Dinner" />
            </Tabs>

            <Row xs={1} md={2} className="g-4">
              {filteredFoods.map(food => (
                <Col key={food.id}>
                  <Card className="h-100 shadow-sm border-0 overflow-hidden">
                    <Carousel interval={null} indicators={food.photoUrls?.length > 1}>
                      {(food.photoUrls || []).map((img, i) => (
                        <Carousel.Item key={i}>
                          <div className="ratio ratio-4x3">
                            <img
                              src={img}
                              alt={`${food.title} - Photo ${i + 1}`}
                              className="card-img-top object-fit-cover"
                              style={{ filter: 'brightness(0.95)' }}
                              onError={(e) => (e.target.src = '/placeholder-food.jpg')}
                            />
                          </div>
                        </Carousel.Item>
                      ))}
                    </Carousel>

                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h5 className="fw-bold mb-0" style={{ color: colors.primary }}>
                            {food.title}
                          </h5>
                          <small className="text-muted">
                            Posted {formatDistanceToNow(new Date(food.createdAt))} ago
                          </small>
                        </div>
                        <Badge 
                          
                          style={{ 
                            background: '#FF4532',
                            fontSize: '1rem',
                            padding: '0.5rem 1rem'
                          }}
                        
                        >
                        <span>   KES {food.price} </span>
                        </Badge>
                      </div>

                      <p className="small text-secondary mb-3 flex-grow-1">{food.description}</p>

                      <div className="d-flex gap-2 flex-wrap mb-3">
                        <Badge pill style={{ backgroundColor: colors.primary }}>
                          {food.speciality}
                        </Badge>
                        <Badge pill style={{ backgroundColor: colors.purple }}>
                          {food.cuisineType}
                        </Badge>
                        <Badge pill style={{ backgroundColor: colors.danger }}>
                          {food.dietary}
                        </Badge>
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
          </Col>
        </Row>
      </div>
<Modal 
  show={showHireModal} 
  onHide={() => setShowHireModal(false)} 
  centered
  size="lg"
  style={{ fontFamily: "'Poppins', sans-serif" }}
>
  {/* Chef Image Header */}
  <Modal.Header 
    closeButton 
    className="position-relative"
    style={{ 
      border: 'none',
      backgroundColor: colors.lightBackground,
      padding: '2rem 1.5rem 0',
      borderRadius: '0'
    }}
  >
    <div className="position-absolute top-0 start-50 translate-middle" style={{ top: '-60px' }}>
      <div 
        className="rounded-circle overflow-hidden border-4"
        style={{
          width: '120px',
          height: '120px',
          borderColor: colors.primary,
          backgroundColor: 'white',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img 
          src="/images/hire.png" 
          alt="Hire a Chef"
          className="img-fluid"
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
    </div>
    
    <Modal.Title 
      className="w-100 text-center mt-4 pt-4" 
      style={{ 
        color: colors.primary,
        fontWeight: 700,
        fontSize: '1.8rem',
        letterSpacing: '0.5px'
      }}
    >
      Hire {chef.user?.Name}
    </Modal.Title>
  </Modal.Header>
  
  <Form onSubmit={handleHireSubmit}>
    <Modal.Body 
      style={{ 
        backgroundColor: colors.lightBackground,
        padding: '1.5rem 2rem',
        borderBottomLeftRadius: '0.3rem',
        borderBottomRightRadius: '0.3rem'
      }}
    >
      {/* Status Messages */}
      {requestStatus === 'success' && (
        <div 
          className="alert alert-success d-flex align-items-center" 
          style={{ 
            borderLeft: `4px solid ${colors.secondary}`,
            backgroundColor: '#e8f5e9'
          }}
        >
          <i className="bi bi-check-circle-fill me-2"></i>
          Request sent successfully! Chef has been notified.
        </div>
      )}
      
      {requestStatus === 'error' && (
        <div 
          className="alert alert-danger d-flex align-items-center"
          style={{ borderLeft: `4px solid ${colors.errorText}` }}
        >
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          Failed to send request. Please try again.
        </div>
      )}

      {/* Payment Steps */}
      {!paymentComplete && (
        <>
          {/* Fee Notice */}
          <div 
            className="mb-4 p-3 rounded text-center"
            style={{ 
              backgroundColor: '#e8f5e9',
              border: `1px dashed ${colors.primary}`,
              position: 'relative'
            }}
          >
            <span 
              className="position-absolute top-0 start-0 px-2 py-1 rounded-end"
              style={{
                backgroundColor: colors.primary,
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              STEP 1
            </span>
            <p className="mb-0" style={{ color: colors.primary, fontWeight: 500 }}>
              Please complete the <strong>KES 200</strong> hiring fee payment via M-Pesa
            </p>
          </div>

          {/* M-Pesa Payment Section */}
          <div className="payment-section p-4 mb-4" style={{ 
            backgroundColor: colors.cardBackground, 
            borderRadius: '10px',
            border: `1px solid ${colors.borderColor}`
          }}>
            <h5 className="mb-3" style={{ fontWeight: 600, color: colors.darkText }}>
              <i className="bi bi-wallet2 me-2"></i>
              Pay via M-Pesa
            </h5>
            
            <div className="d-flex align-items-center mb-3">
              <div className="me-3">
                <img 
                  src="/images/mpesa.png" 
                  alt="M-Pesa" 
                  style={{ width: '60px' }} 
                />
              </div>
              <div>
                <p className="mb-0" style={{ fontWeight: 500 }}>Paybill: 247247</p>
                <p className="mb-0" style={{ fontWeight: 500 }}>Account: JIKONI-CHEF</p>
              </div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>
                <i className="bi bi-phone me-2"></i>
                Your M-Pesa Phone Number
              </Form.Label>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: colors.borderColor }}>+254</InputGroup.Text>
                <Form.Control
                  type="tel"
                  placeholder="7XX XXX XXX"
                  required
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  style={{ 
                    borderColor: colors.primary,
                    color: colors.darkText,
                    borderRadius: '0 8px 8px 0',
                    padding: '0.75rem'
                  }}
                />
              </InputGroup>
              <Form.Text className="text-muted">
                You'll receive a payment request on this number
              </Form.Text>
            </Form.Group>
            
            <div className="text-center mt-4">
              <Button 
                variant="success"
                onClick={initiateMpesaPayment}
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.buttonHover,
                  fontWeight: 600,
                  padding: '0.5rem 2rem',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: colors.buttonHover
                  }
                }}
                disabled={paymentProcessing}
              >
                {paymentProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-check me-2"></i>
                    Pay KES 200 via M-Pesa
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
      
      {/* Form Section - Only show after payment */}
      {paymentComplete && (
        <>
          <div 
            className="mb-4 p-3 rounded text-center"
            style={{ 
              backgroundColor: '#e8f5e9',
              border: `1px dashed ${colors.primary}`,
              position: 'relative'
            }}
          >
            <span 
              className="position-absolute top-0 start-0 px-2 py-1 rounded-end"
              style={{
                backgroundColor: colors.primary,
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              STEP 2
            </span>
            <p className="mb-0" style={{ color: colors.primary, fontWeight: 500 }}>
              Payment received! Please complete the hiring details
            </p>
          </div>
          
          <div className="row g-3">
            {/* Event Type */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>
                  <i className="bi bi-calendar-event me-2"></i>
                  Event Type
                </Form.Label>
                <Form.Select
                  required
                  value={hireDetails.eventType}
                  onChange={(e) => setHireDetails({...hireDetails, eventType: e.target.value})}
                  style={{ 
                    borderColor: colors.primary,
                    color: colors.darkText,
                    borderRadius: '8px',
                    padding: '0.75rem',
                    boxShadow: 'none'
                  }}
                >
                  <option value="">Select event type</option>
                  <option>Wedding</option>
                  <option>Corporate Event</option>
                  <option>Birthday Party</option>
                  <option>Private Dinner</option>
                  <option>Other</option>
                </Form.Select>
              </Form.Group>
            </div>

            {/* Food Type */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>
                  <i className="bi bi-egg-fried me-2"></i>
                  Type of Food
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Kenyan, Italian, Vegan"
                  required
                  value={hireDetails.typeOfFood}
                  onChange={(e) => setHireDetails({...hireDetails, typeOfFood: e.target.value})}
                  style={{ 
                    borderColor: colors.primary,
                    color: colors.darkText,
                    borderRadius: '8px',
                    padding: '0.75rem'
                  }}
                />
              </Form.Group>
            </div>

            {/* Date & Time */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>
                  <i className="bi bi-calendar-date me-2"></i>
                  Date
                </Form.Label>
                <Form.Control 
                  type="date" 
                  required
                  value={hireDetails.date}
                  onChange={(e) => setHireDetails({...hireDetails, date: e.target.value})}
                  style={{ 
                    borderColor: colors.primary,
                    color: colors.darkText,
                    borderRadius: '8px',
                    padding: '0.75rem'
                  }}
                />
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>
                  <i className="bi bi-clock me-2"></i>
                  Time
                </Form.Label>
                <Form.Control 
                  type="time" 
                  required
                  value={hireDetails.time}
                  onChange={(e) => setHireDetails({...hireDetails, time: e.target.value})}
                  style={{ 
                    borderColor: colors.primary,
                    color: colors.darkText,
                    borderRadius: '8px',
                    padding: '0.75rem'
                  }}
                />
              </Form.Group>
            </div>

            {/* Hours & Days */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>
                  <i className="bi bi-hourglass-split me-2"></i>
                  Number of Hours
                </Form.Label>
                <Form.Control 
                  type="number" 
                  min="1"
                  required
                  value={hireDetails.hours}
                  onChange={(e) => setHireDetails({...hireDetails, hours: e.target.value})}
                  style={{ 
                    borderColor: colors.primary,
                    color: colors.darkText,
                    borderRadius: '8px',
                    padding: '0.75rem'
                  }}
                />
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>
                  <i className="bi bi-calendar-week me-2"></i>
                  Number of Days
                </Form.Label>
                <Form.Control 
                  type="number" 
                  min="1"
                  required
                  value={hireDetails.days}
                  onChange={(e) => setHireDetails({...hireDetails, days: e.target.value})}
                  style={{ 
                    borderColor: colors.primary,
                    color: colors.darkText,
                    borderRadius: '8px',
                    padding: '0.75rem'
                  }}
                />
              </Form.Group>
            </div>

            {/* People & Notes */}
            <div className="col-12">
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>
                  <i className="bi bi-people me-2"></i>
                  Number of People
                </Form.Label>
                <Form.Control 
                  type="number" 
                  min="1"
                  value={hireDetails.people}
                  onChange={(e) => setHireDetails({...hireDetails, people: e.target.value})}
                  style={{ 
                    borderColor: colors.primary,
                    color: colors.darkText,
                    borderRadius: '8px',
                    padding: '0.75rem'
                  }}
                />
              </Form.Group>
            </div>

            <div className="col-12">
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>
                  <i className="bi bi-chat-left-text me-2"></i>
                  Special Requests
                </Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  placeholder="Any dietary restrictions, specific dishes, or other requirements..."
                  value={hireDetails.notes}
                  onChange={(e) => setHireDetails({...hireDetails, notes: e.target.value})}
                  style={{ 
                    borderColor: colors.primary,
                    color: colors.darkText,
                    borderRadius: '8px',
                    padding: '0.75rem'
                  }}
                />
              </Form.Group>
            </div>
          </div>
        </>
      )}
    </Modal.Body>
    
    <Modal.Footer 
      style={{ 
        backgroundColor: colors.lightBackground,
        borderTop: `1px solid ${colors.borderColor}`,
        padding: '1rem 2rem',
        justifyContent: 'space-between'
      }}
    >
      <Button 
        variant="outline-secondary" 
        onClick={() => setShowHireModal(false)}
        style={{ 
          color: colors.darkText,
          borderColor: colors.borderColor,
          borderRadius: '8px',
          padding: '0.5rem 1.5rem',
          fontWeight: 600,
          transition: 'all 0.3s'
        }}
      >
        Cancel
      </Button>
      
      {paymentComplete && (
        <Button 
          type="submit" 
          style={{ 
            backgroundColor: colors.primary,
            borderColor: colors.buttonHover,
            color: 'white',
            borderRadius: '8px',
            padding: '0.5rem 2rem',
            fontWeight: 600,
            boxShadow: `0 4px 8px rgba(${hexToRgb(colors.primary)}, 0.3)`,
            transition: 'all 0.3s',
            '&:hover': {
              backgroundColor: colors.buttonHover
            }
          }}
          disabled={requestStatus === 'loading'}
        >
          {requestStatus === 'loading' ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Sending Request...
            </>
          ) : (
            <>
              <i className="bi bi-send-check me-2"></i>
              Confirm Hiring Request
            </>
          )}
        </Button>
      )}
    </Modal.Footer>
  </Form>
</Modal>


 <Modal show={showBioModal} onHide={() => setShowBioModal(false)} centered>
      <Modal.Header 
        closeButton 
        style={{ 
          borderColor: modalColors.primary,
          backgroundColor: modalColors.headerBackground,
          color: modalColors.text,
          borderBottom: '1px solid',
          borderRadius: '5px 5px 0 0' // Rounded corners top
        }}
      >
        <Modal.Title style={{ color: modalColors.primary }}>
          Bio: {chef.user?.Name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: modalColors.background, color: modalColors.text }}>
        {/* Chef's Profile Picture (Optional: if chef object has a profile pic URL) */}
        {chef.user?.profilePic && (
          <div className="text-center mb-3">
            <img 
              src={chef.user.profilePic} 
              alt={`${chef.user?.Name}'s profile`} 
              style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: `2px solid ${modalColors.primary}`
              }} 
            />
          </div>
        )}
        
   
        {/* <p><strong>Name:</strong> {chef.user?.Name}</p> */}

        {/* Chef's Specialty/Cuisine */}
        {chef.profile?.specialty && (
          <p><strong>Specialty:</strong> {chef.profile.specialty}</p>
        )}

        {/* Chef's Experience */}
        {chef.profile?.experience && (
          <p><strong>Experience:</strong> {chef.profile.experience}</p>
        )}
        
        {/* Chef's Bio/Description */}
        {chef.profile?.bio ? (
          <p><strong>About Me:</strong> {chef.profile.bio}</p>
        ) : (
          <p className="text-muted">No detailed biography available yet.</p>
        )}

        {/* Other relevant chef details you might have */}
        {chef.profile?.location && (
          <p><strong>Location:</strong> {chef.profile.location}</p>
        )}
        {chef.profile?.hourlyRate && (
          <p><strong>Hourly Rate:</strong> KES {chef.profile.hourlyRate}</p>
        )}
      </Modal.Body>

      <Modal.Footer style={{ backgroundColor: modalColors.background, borderTop: '1px solid #ddd' }}>
        <Button 
          variant="secondary" 
          onClick={() => setShowBioModal(false)}
          style={{ 
            color: modalColors.primary, 
            borderColor: modalColors.primary,
            backgroundColor: 'transparent' // Make background transparent for secondary look
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  


    </div>
  );

};
export default ChefProfile;