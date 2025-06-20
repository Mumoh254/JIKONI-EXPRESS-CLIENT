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

import RiderRegistration from '../../modals/riderRegistration';
import popSound from '../../../../public/audio/cliks.mp3';
import { jwtDecode } from "jwt-decode";
import moment from 'moment-timezone';
import { CartSidebar, PreOrderModal } from '../../cartAndOrder/cart';
import OrderConfirmation from '../../cartAndOrder/orderConfirm'
import { GiKenya } from 'react-icons/gi';

import { RiMotorbikeFill } from 'react-icons/ri';
import { FaCartPlus } from "react-icons/fa";
import { SiCodechef } from "react-icons/si";

import { FixedSizeList as List } from 'react-window';



const theme = {
    primary: '#2563eb',
    secondary: '#c3e703',
    accent: '#CC00FF',
    light: '#fff',
    dark: '#CC00FF'
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

const PreOrderBadge = styled(Badge)`
  background: linear-gradient(45deg, ${colors.primary}, #FF6B6B);
  color: #fff;
  border: none;
  padding: 0.4em 0.8em;
  font-weight: 500;
`;

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
    const [isLiqour, setIsLiqour] = useState(false);
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


    const goToLiquor = () => {
        navigate('/jikoni-express/liqour-shots'); // Notice the leading slash
    };

    const parseTime = (timeStr, today) => {
        // Try 24-hr format first
        let time = moment.tz(`${today} ${timeStr}`, 'YYYY-MM-DD HH:mm', 'Africa/Nairobi');
        if (!time.isValid()) {
            // Try 12-hr format with am/pm
            time = moment.tz(`${today} ${timeStr}`, 'YYYY-MM-DD h:mma', 'Africa/Nairobi');
        }
        return time;
    }

    const isChefOpen = (openingHours) => {
        if (!openingHours) return false;

        const [start, end] = openingHours.split(' - ');
        const now = moment.tz('Africa/Nairobi');
        const today = now.format('YYYY-MM-DD');

        const startTime = parseTime(start.trim().toLowerCase(), today);
        let endTime = parseTime(end.trim().toLowerCase(), today);

        if (endTime.isBefore(startTime)) {
            endTime = endTime.add(1, 'day');
        }

        console.log('now:', now.format());
        console.log('startTime:', startTime.format());
        console.log('endTime:', endTime.format());

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
            // Already closed or closing time passed
            return null;
        }

        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();

        return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
    };

    const playSound = () => {
        new Audio(popSound).play();
    };


    //    handle  food  height  accordingly
    function FoodsList({ filteredFoods, playSound, navigate, handleLike, updateCart, handlePreOrder, isChefOpen, getTimeUntilClosing, colors }) {
  const [itemSize, setItemSize] = useState(800);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width < 576) {
        setItemSize(400); // small phones
      } else if (width < 992) {
        setItemSize(600); // tablets or medium screens
      } else {
        setItemSize(800); // desktop or large screens
      }
    }
    handleResize(); // set initially
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


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


    const RowComponent = ({ index, style, data }) => {
        const food = data.foods[index];
        const { playSound, navigate, handleLike, updateCart, handlePreOrder, isChefOpen, getTimeUntilClosing, colors } = data.props;

        if (!food) return null; // Safety check

        return (
            <div style={{ ...style, padding: '10px' }}> {/* Add padding to simulate original Col spacing */}
                <Col xs={12} md={6} lg={4} xl={4} style={{ height: '100%' }}> {/* Col needs to take 100% height of the itemSize */}
                    <Card className="h-100 shadow-sm border-0 overflow-hidden food-card" style={{
                        borderRadius: '16px',
                        transition: 'all 0.3s ease',
                        height: '100%' // Ensure card fills its allocated height
                    }}>
                        <div className="position-relative" style={{ overflow: 'hidden' }}>
                            <Carousel
                                interval={3000} // Auto-play every 3 seconds
                                indicators={food.photoUrls?.length > 1}
                                controls={false}
                                pause={false}
                            >
                                {food.photoUrls?.map((img, i) => (
                                    <Carousel.Item key={i}>
                                        <div className="ratio ratio-4x3">
                                            <img
                                                src={img}
                                                alt={`${food.title} - Photo ${i + 1}`}
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
                                    <span style={{
                                        paddingLeft: "2px",
                                        paddingRight: '10px',
                                        color: '#00C853'
                                    }} > Posted: </span> {formatDistanceToNow(new Date(food.createdAt), { addSuffix: true })}
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
                                        <Clock size={18} className="text-primary" />
                                        <small className="fw-medium">
                                            {food.chef?.openingHours || '5am - 6pm'}
                                            {isChefOpen(food.chef?.openingHours || '5am - 2pm') && (
                                                <span style={{ color: '#ff4d4d' }}>
                                                    {' '}• Closing in {getTimeUntilClosing(food.chef?.openingHours || '8am - 2pm')}
                                                </span>
                                            )}
                                        </small>
                                    </div>
                                    <Badge
                                        bg={isChefOpen(food.chef?.openingHours || '5am - 2pm') ? 'success' : 'secondary'}
                                        className={`p-2 fw-medium text-${isChefOpen(food.chef?.openingHours || '8am - 2pm') ? 'light' : 'dark'}`}
                                    >
                                        {isChefOpen(food.chef?.openingHours || '5am - 2pm') ? 'Available' : 'Closed'}
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
            </div>
        );
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
        // onClose() // This might need to be removed or conditionally called depending on where this function is triggered
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
                    <div className="d-flex justify-content-between align-items-center py-2 py-md-3">
                        <div className="d-flex align-items-center gap-2 gap-md-3">
                            <GiKenya className=" header-icon gradient-icon" />
                            <h1 className="m-0 brand-title display-6 fw-bold">
                                <span className="jikoni-red">Jikoni</span>
                                <span className="jikoni-green px-1">Express</span>
                            </h1>

                        </div>

                        <div className="d-flex gap-2 gap-md-3 align-items-center">


                            {!state.isChefMode && !state.isRiderMode && (
                                <div className="d-flex gap-1 gap-md-2">
                                    <Button
                                        variant="primary"
                                        className="px-3 px-md-4 py-1 d-flex align-items-center"
                                        style={{ backgroundColor: colors.primary, border: 'none' }}
                                        onClick={() => setState(s => ({ ...s, showChefReg: true }))}
                                    >
                                        <SiCodechef className="me-2" />
                                        <span className="d-none d-md-inline">Chef</span>
                                    </Button>

                                    <Button
                                        variant="success"
                                        className="px-3 px-md-4 py-1 d-flex align-items-center"
                                        style={{ backgroundColor: colors.secondary, border: 'none' }}
                                        onClick={() => setState(s => ({ ...s, showRiderReg: true }))}
                                    >
                                        <RiMotorbikeFill className="me-2" />
                                        <span className="d-none d-md-inline">Rider</span>
                                    </Button>
                                </div>
                            )}
                            <Button
                                className="px-3 me-2 mt-1 px-md-2 py-1 position-relative d-flex align-items-center text-white border-0"
                                style={{ backgroundColor: '#FFC107' }} // warning yellow
                                onClick={() => setState(s => ({ ...s, showCart: true }))}
                            >
                                <FaCartPlus className="me-2" />
                                <span className="d-none d-md-inline">Cart</span>

                                {/* Green badge for cart count */}
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


            <div className=" container-xl">
                {/* Stories Section */}
                <div className="stories-fixed-section bg-white ">
                    <div className="stories-fixed-section bg-white ">


                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h4 className="mb-3 fw-bold mt-3" style={{ color: '#FF4532', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ color: 'green' }} // change icon color here
                                >
                                    <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
                                    <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" />
                                    <path d="m2.1 21.8 6.4-6.3" />
                                    <path d="m19 5-7 7" />
                                </svg>
                                Jikoni Reels
                            </h4>


                            <button
                                onClick={goToLiquor}
                                style={{
                                    Color: '#00C853',
                                    border: 'none',

                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                }}
                            >
                                🍷 Liquor
                            </button>
                        </div>

                        <div className="stories-container">
                            <div className="stories-scroll">
                                {/* Add Story Button */}
                                <div
                                    className="story-item"
                                    onClick={() => registerAsChef()} // Assuming registerAsChef and postFood functions exist
                                    style={{ marginRight: '0rem' }}
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
                                                    // This function seems to be missing from the original snippet
                                                    // postFood(); 
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
                                        style={{ marginRight: '0.4rem' }}
                                    >
                                        <div className="story-image-wrapper position-relative">
                                            <div className="story-gradient-border">
                                                <img
                                                    src={food.photoUrls?.[0] || '/placeholder-food.jpg'} // fallback if image missing
                                                    alt={food.title} // good for accessibility & SEO
                                                    className="story-img" // styling class
                                                    loading="lazy" // native lazy loading
                                                />
                                            </div>

                                            <div className="story-details  ">
                                                <span className="chef-name  ">{food.chef.user.Name}</span>
                                                <Badge pill className="location-badge overflow-hidden p-0">
                                                    <GeoAlt size={14} className="me-1 ms-1 text-white" />

                                                    <marquee
                                                        behavior="scroll"
                                                        direction="left"
                                                        scrollAmount="1.3"
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
      width: 22px;
      height: 22px;
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
  height: 2px;
  background: linear-gradient(90deg, #FF4532 0%, #00C853 100%);
}

.stories-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #FF4532 0%, #00C853 100%);
  border-radius: 1px;
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



  .carousel-indicators [data-bs-target] {
    background-color: #06b10f;
  }

  .carousel-indicators .active {
    background-color: #ff1900;
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
                        <Modal.Header closeButton className="border-0 pb-0" style={{ backgroundColor: colors.cardBackground }}>
                            <Modal.Title className="fw-bold" style={{ color: colors.darkText }}>
                                Pre-Order Your Meal
                            </Modal.Title>
                        </Modal.Header>

                        <Modal.Body className="py-4" style={{ backgroundColor: colors.cardBackground }}>
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
                                        <h5 className="mb-1 fw-bold" style={{ color: colors.darkText }}>{selectedFood.title}</h5>
                                        <div className="d-flex align-items-center">
                                            <PreOrderBadge pill>
                                                {selectedFood.mealType}
                                            </PreOrderBadge>
                                            <span className="fw-bold ms-2" style={{ color: colors.primary }}>
                                                KES {selectedFood.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Form>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group controlId="preOrderDate">
                                            <Form.Label className="fw-medium mb-2" style={{ color: colors.darkText }}>Delivery Date</Form.Label>
                                            <div className="input-group border rounded-3 overflow-hidden" style={{ borderColor: colors.borderColor }}>
                                                <span className="input-group-text bg-white border-0">
                                                    <Calendar size={18} style={{ color: colors.placeholderText }} />
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
                                            <small className="d-block mt-1" style={{ color: colors.placeholderText }}>Select delivery date</small>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group controlId="preOrderTime">
                                            <Form.Label className="fw-medium mb-2" style={{ color: colors.darkText }}>Delivery Time</Form.Label>
                                            <div className="input-group border rounded-3 overflow-hidden" style={{ borderColor: colors.borderColor }}>
                                                <span className="input-group-text bg-white border-0">
                                                    <Clock size={18} style={{ color: colors.placeholderText }} />
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
                                            <small className="d-block mt-1" style={{ color: colors.placeholderText }}>Choose convenient time</small>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group controlId="servings">
                                            <Form.Label className="fw-medium mb-2" style={{ color: colors.darkText }}>Number of Servings</Form.Label>
                                            <Form.Select
                                                aria-label="Number of Servings"
                                                value={preOrderForm.servings}
                                                onChange={(e) => setPreOrderForm({ ...preOrderForm, servings: parseInt(e.target.value) })}
                                                className="py-2 px-3 border rounded-3"
                                                style={{
                                                    height: 'calc(2.5rem + 10px)',
                                                    boxShadow: 'none',
                                                    borderColor: colors.borderColor
                                                }}
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                                    <option key={num} value={num}>{num} serving{num > 1 ? 's' : ''}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group controlId="totalPrice">
                                            <Form.Label className="fw-medium mb-2" style={{ color: colors.darkText }}>Total Price</Form.Label>
                                            <div className="d-flex align-items-center justify-content-center h-100 rounded-3 py-2"
                                                style={{ backgroundColor: colors.lightBackground }}>
                                                <h4 className="mb-0 fw-bold" style={{ color: colors.primary }}>
                                                    {selectedFood ? `KES ${(selectedFood.price * preOrderForm.servings).toFixed(2)}` : ''}
                                                </h4>
                                            </div>
                                        </Form.Group>
                                    </Col>

                                    <Col xs={12}>
                                        <Form.Group controlId="specialInstructions">
                                            <Form.Label className="fw-medium mb-2" style={{ color: colors.darkText }}>Special Instructions</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Any dietary restrictions or special requests..."
                                                value={preOrderForm.instructions}
                                                onChange={(e) => setPreOrderForm({ ...preOrderForm, instructions: e.target.value })}
                                                className="border-0"
                                                style={{ outline: 'none', boxShadow: 'none' }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Modal.Body>

                        <Modal.Footer className="border-0 pt-0" style={{ backgroundColor: colors.cardBackground }}>
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowPreOrderModal(false)}
                                className="py-2 px-4 fw-bold"
                                style={{
                                    borderRadius: '12px',
                                    borderColor: colors.borderColor,
                                    color: colors.darkText
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                className="py-2 px-4 fw-bold"
                                style={{
                                    borderRadius: '12px',
                                    background: colors.secondary,
                                    border: 'none'
                                }}
                            >
                                Confirm Pre-Order
                            </Button>
                        </Modal.Footer>
                    </Modal>


                    {/* Main Content Area */}
                    <main className="py-4">
                        {state.loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                                <Spinner animation="border" variant="primary" />
                            </div>
                        ) : state.error ? (
                            <Alert variant="danger" className="text-center">
                                Error: {state.error}
                            </Alert>
                        ) : (
                            <Row className="g-4 py-3">
                                <List
      height={Math.min(itemSize * filteredFoods.length, window.innerHeight)} // max height to viewport height
      itemCount={filteredFoods.length}
      itemSize={itemSize}
      width="100%"
      itemData={{
        foods: filteredFoods,
        props: { playSound, navigate, handleLike, updateCart, handlePreOrder, isChefOpen, getTimeUntilClosing, colors }
      }}
    >
      {RowComponent}
    </List>
                            </Row>
                        )}
                    </main>
                </div>
            </div>

            {/* Cart Offcanvas */}
            <CartSidebar
                show={state.showCart}
                handleClose={() => setState(s => ({ ...s, showCart: false }))}
                cart={state.cart}
                updateCart={updateCart}
                handleCheckout={handleCheckout}
            />

            {/* Modals */}
            <ChefRegistrationModal
                show={state.showChefReg}
                handleClose={() => setState(s => ({ ...s, showChefReg: false }))}
                registerChef={registerChef}
            />
            <RiderRegistration
                show={state.showRiderReg}
                handleClose={() => setState(s => ({ ...s, showRiderReg: false }))}
                handleRiderRegistration={handleRiderRegistration}
            />
            {/* Add other modals (FoodPostModal, EditFoodModal, etc.) if they exist */}
        </Container>
    );
};

export default FoodPlatform;