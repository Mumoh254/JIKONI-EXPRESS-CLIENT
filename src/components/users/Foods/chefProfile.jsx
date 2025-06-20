import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Carousel, Badge, Button, Tabs, Tab, Modal, Spinner, Form } from 'react-bootstrap';
import { StarHalf, CartPlus, PinMapFill, CheckCircleFill, StarFill, Clock, EggFried, PersonLinesFill } from 'react-bootstrap-icons';
import moment from 'moment-timezone';
import { formatDistanceToNow } from 'date-fns';
import { GiKenya } from "react-icons/gi";
import { FaCartPlus } from "react-icons/fa";
import { RiMotorbikeFill } from 'react-icons/ri';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { CartSidebar, PreOrderModal } from '../../../components/cartAndOrder/cart'; // Ensure these paths are correct
import OrderConfirmation from '../../../components/cartAndOrder/orderConfirm'; // Ensure this path is correct
import { BsAwardFill } from 'react-icons/bs';

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
    purple: '#6B46C1', // Example for a badge color
    danger: '#EF4444', // Example for a badge color
};

const ChefProfile = () => {
    const { id: chefId } = useParams();
    const [state, setState] = useState({
        foods: [],
        orders: [], // Not explicitly used or updated in this snippet
        cart: [],
        showCart: false,
        loading: true,
        error: null,
        // These seem unrelated to ChefProfile directly, perhaps for a larger dashboard?
        showChefReg: false,
        showRiderReg: false,
        showFoodPost: false,
        showAnalytics: false,
        showBikers: false,
        showEditFood: null,
        isChefMode: localStorage.getItem('isChef') === 'true',
        isRiderMode: localStorage.getItem('isRider') === 'true',
        filters: { area: 'all', specialty: 'all', mealType: 'all' }, // filters.mealType is used by selectedMealType
        showOrderConfirmation: false,
        userLocation: null,
        locationError: null,
        areas: [], // Populated from foods, but not used for filtering in this snippet
        specialties: [] // Populated from foods, but not used for filtering in this snippet
    });

    const [isLiqour, setIsLiqour] = useState(false); // Not used in this snippet's logic
    const navigate = useNavigate();
    const BASE_URL = "http://localhost:8000/apiV1/smartcity-ke";
    const [userId, setUserId] = useState(null);
    const [showPreOrderModal, setShowPreOrderModal] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [preOrderForm, setPreOrderForm] = useState({
        date: '',
        time: '',
        instructions: '',
        servings: 1
    });
    const [orderHistory, setOrderHistory] = useState([]); // Not explicitly used or updated in this snippet
    const [chef, setChef] = useState({}); // Separate state for chef data
    const [selectedMealType, setSelectedMealType] = useState('all'); // State for the Tabs filter
    const [showBioModal, setShowBioModal] = useState(false);
    const [showHireModal, setShowHireModal] = useState(false);
    const [hireForm, setHireForm] = useState({
        name: '',
        email: '',
        eventDate: '',
        guests: 10,
        message: ''
    });
    const [openingStatus, setOpeningStatus] = useState({
        isOpen: false,
        closingIn: null
    });

    const goToLiquor = () => {
        navigate('/jikoni-express/liqour-shots');
    };

    const parseTime = (timeStr, today) => {
        let time = moment.tz(`${today} ${timeStr}`, 'YYYY-MM-DD HH:mm', 'Africa/Nairobi');
        if (!time.isValid()) {
            time = moment.tz(`${today} ${timeStr}`, 'YYYY-MM-DD h:mma', 'Africa/Nairobi');
        }
        return time;
    };

    const updateOpeningStatus = (openingHours) => {
        if (!openingHours || typeof openingHours !== 'string' || !openingHours.includes(' - ')) {
            setOpeningStatus({ isOpen: false, closingIn: null });
            return;
        }

        const [start, end] = openingHours.split(' - ');
        const now = moment.tz('Africa/Nairobi');
        const today = now.format('YYYY-MM-DD');

        const startTime = parseTime(start.trim().toLowerCase(), today);
        let endTime = parseTime(end.trim().toLowerCase(), today);

        // Handle cases where closing time is on the next day (e.g., 22:00 - 02:00)
        if (endTime.isBefore(startTime)) {
            endTime = endTime.add(1, 'day');
        }

        const isOpen = now.isSameOrAfter(startTime) && now.isBefore(endTime);
        let closingIn = null;

        if (isOpen) {
            const duration = moment.duration(endTime.diff(now));
            if (duration.asMilliseconds() > 0) {
                const hours = Math.floor(duration.asHours());
                const minutes = duration.minutes();
                closingIn = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
            }
        }

        setOpeningStatus({
            isOpen,
            closingIn
        });
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

        if ("Notification" in window) {
            Notification.requestPermission().then((perm) => {
                if (perm === "granted") {
                    console.log("Notifications granted.");
                    // new Notification("Notifications Enabled"); // This might be annoying on every load
                }
            });
        }

        const fetchData = async () => {
            if (!chefId) {
                setState(s => ({ ...s, loading: false, error: "No Chef ID provided in the URL." }));
                return;
            }

            setState(s => ({ ...s, loading: true, error: null }));

            try {
                // Fetch Chef Profile
                const chefResponse = await fetch(`${BASE_URL}/chef/${chefId}`);
                if (!chefResponse.ok) {
                    throw new Error(`Failed to fetch chef profile. Status: ${chefResponse.status}`);
                }
            const chefData = await chefResponse.json();
const fetchedChef = chefData?.data ?? {}; // ✅ correct key

setChef(fetchedChef);

if (typeof fetchedChef.openingHours === 'string') {
  updateOpeningStatus(fetchedChef.openingHours);
} else {
  updateOpeningStatus('08:00 - 18:00'); // fallback default
  console.warn('Chef is missing openingHours:', fetchedChef);
}
 // fallback to empty object

setChef(fetchedChef);

// Only update if openingHours exists and is a string
if (typeof fetchedChef.openingHours === 'string') {
  updateOpeningStatus(fetchedChef.openingHours);
} else {
  // Optional: use default or log warning
  updateOpeningStatus('08:00 - 18:00'); // fallback default
  console.warn("Missing or invalid openingHours from chef data:", fetchedChef);
}

                // Fetch Foods for this Chef
                const foodsResponse = await fetch(`${BASE_URL}/foods/${chefId}`);
                if (!foodsResponse.ok) {
                    throw new Error(`Failed to fetch foods for this chef. Status: ${foodsResponse.status}`);
                }
                const foodsData = await foodsResponse.json();
                console.log("Fetched Foods Data:", foodsData);

                const areas = [...new Set(foodsData.map(food => food.area).filter(Boolean))];
                // Note: Assuming chef.speciality is on the food object for these purposes
                const specialties = [...new Set(foodsData.map(food => food.chef?.speciality).filter(Boolean))];

                setState(s => ({
                    ...s,
                    foods: foodsData,
                    areas: ['all', ...areas],
                    specialties: ['all', ...specialties],
                    loading: false
                }));

            } catch (err) {
                console.error("Failed to fetch data:", err);
                setState(s => ({ ...s, error: err.message, loading: false }));
            }
        };

        fetchData();

        // Cleanup function if component unmounts quickly after initial fetch
        return () => {
            // Any cleanup if necessary (e.g., abort controllers if fetches are long)
        };
    }, [chefId, BASE_URL]); // Dependencies for useEffect

    // Update opening status every minute based on the 'chef' state
    useEffect(() => {
        // Only set up interval if chef and openingHours are available
        if (chef && chef.openingHours) {
            const interval = setInterval(() => {
                updateOpeningStatus(chef.openingHours);
            }, 60000); // Update every minute

            return () => clearInterval(interval); // Clear interval on unmount or chef.openingHours change
        }
    }, [chef?.openingHours, chef]); // Depend on chef.openingHours and chef object itself

    const playSound = () => {
        // Placeholder for cart add sound
        console.log("Play cart sound!");
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
                    price: Number(item.price) // Ensure price is a number
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

    const handlePreOrderSubmit = () => {
        if (!selectedFood) {
            console.error("No food selected for pre-order.");
            Swal.fire('Error', 'No food selected for pre-order.', 'error');
            return;
        }

        // Basic validation for date and time for pre-order
        if (!preOrderForm.date || !preOrderForm.time) {
            Swal.fire('Error', 'Please select a date and time for your pre-order.', 'warning');
            return;
        }

        const preOrderItem = {
            ...selectedFood,
            isPreOrder: true,
            preOrderDate: preOrderForm.date,
            preOrderTime: preOrderForm.time,
            instructions: preOrderForm.instructions,
            quantity: preOrderForm.servings,
            totalPrice: selectedFood.price * preOrderForm.servings
        };

        updateCart(preOrderItem, preOrderForm.servings); // Add to cart
        setShowPreOrderModal(false);
        Swal.fire('Success', `${selectedFood.title} pre-order added to cart!`, 'success');
    };

    const handleCheckout = () => {
        if (state.cart.length === 0) {
            Swal.fire('Cart Empty', 'Please add items to your cart before checking out.', 'warning');
            return;
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // In a real app, you'd use a Geocoding API to get a readable address
                    const mockAddress = "123 Main St, Nairobi, Kenya"; // Placeholder
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
                    console.error("Geolocation error:", error);
                    setState(prev => ({
                        ...prev,
                        showOrderConfirmation: true, // Still show, but with location error
                        locationError: "Failed to get your location: " + error.message
                    }));
                    Swal.fire('Location Error', 'Failed to get your current location. Please enable location services or manually enter your address during checkout.', 'error');
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Geolocation options
            );
        } else {
            setState(prev => ({
                ...prev,
                showOrderConfirmation: true,
                locationError: "Geolocation is not supported by your browser"
            }));
            Swal.fire('Browser Support', 'Geolocation is not supported by your browser. Cannot automatically get your location.', 'error');
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
                cart: [], // Clear cart after order confirmation
                showOrderConfirmation: false
            }));
            // Optionally, navigate to an order history page or home
        });
    };

    const handleHireChef = async (e) => {
        e.preventDefault();
        if (!userId) {
            Swal.fire('Authentication Required', 'Please log in to hire a chef.', 'info');
            return;
        }
        if (!chefId) {
            Swal.fire('Error', 'Chef ID is missing.', 'error');
            return;
        }
        if (!hireForm.name || !hireForm.email || !hireForm.eventDate || !hireForm.guests) {
            Swal.fire('Validation Error', 'Please fill in all required fields for the hire request.', 'warning');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/chef/${chefId}/hire`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure token is sent
                },
                body: JSON.stringify({
                    chefId: chefId,
                    customerId: userId,
                    name: hireForm.name,
                    email: hireForm.email,
                    eventDate: hireForm.eventDate,
                    guests: hireForm.guests,
                    message: hireForm.message
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to send hire request. Status: ${response.status}`);
            }

            // const result = await response.json(); // If you need the response data
            Swal.fire('Success', 'Hire request sent successfully! The chef will contact you soon.', 'success');
            setShowHireModal(false);
            setHireForm({ name: '', email: '', eventDate: '', guests: 10, message: '' }); // Clear form
        } catch (error) {
            console.error('Hire chef error:', error);
            Swal.fire('Error', error.message || 'Failed to send hire request. Please try again.', 'error');
        }
    };

    // Filter foods based on selected meal type tab
    const filteredFoods = state.foods.filter(food => {
        return selectedMealType === 'all' || food.mealType === selectedMealType;
    });

    if (state.loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: colors.lightBackground }}>
                <Spinner animation="border" role="status" style={{ color: colors.primary }}>
                    <span className="visually-hidden">Loading chef profile and menu...</span>
                </Spinner>
            </div>
        );
    }

    if (state.error) {
        return <div className="text-center text-danger py-5" style={{ backgroundColor: colors.lightBackground }}>Error: {state.error}. Please try again later.</div>;
    }

    // Fallback if chef data is somehow missing even after loading
    if (!chef || !chef.user) {
        return <div className="text-center py-5" style={{ backgroundColor: colors.lightBackground }}>Chef profile not found or data is incomplete.</div>;
    }

    return (
        <div style={{ backgroundColor: colors.lightBackground, minHeight: '100vh' }}>
            <header className="header bg-white shadow-sm sticky-top">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center py-2 py-md-3">
                        <div className="d-flex align-items-center gap-2 gap-md-3">
                            <GiKenya className=" header-icon gradient-icon" style={{ fontSize: '2.5rem', color: colors.secondary }} />
                            <h1 className="m-0 brand-title display-6 fw-bold">
                                <span className="jikoni-red" style={{ color: colors.primary }}>Jikoni</span>
                                <span className="jikoni-green px-1" style={{ color: colors.secondary }}>Express</span>
                            </h1>
                        </div>

                        <div className="d-flex gap-2 gap-md-3 align-items-center">
                            {!state.isChefMode && !state.isRiderMode && (
                                <div className="d-flex gap-1 gap-md-2">
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
                                style={{ backgroundColor: '#FFC107' }} // Using a distinct color for cart
                                onClick={() => setState(s => ({ ...s, showCart: true }))}
                            >
                                <FaCartPlus className="me-2" />
                                <span className="d-none d-md-inline">Cart</span>
                                <span
                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-white"
                                    style={{ backgroundColor: colors.secondary }}
                                >
                                    {state.cart.reduce((sum, i) => sum + i.quantity, 0)}
                                    <span className="visually-hidden">items in cart</span>
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
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
                                        src={chef.profilePictureUrl || '/images/chef.png'} // Use actual profile picture or a default
                                        alt={chef.user?.Name || 'Chef Profile'}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                        onError={(e) => (e.target.src = '/images/chef.png')}
                                    />
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    backgroundColor: '#2ECC71', // Green for verified/pro
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    border: '2px solid #ffffff'
                                }}>
                                    <BsAwardFill style={{ color: 'white', fontSize: '0.7rem' }} /> {/* Award fill for pro/verified */}
                                </div>
                            </div>

                            <div>
                                <div style={{ marginBottom: '0.25rem' }}>
                                    <h1 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        marginBottom: '0.15rem',
                                        color: '#333'
                                    }}>
                                        {chef.user?.Name || 'Chef Name Not Available'}
                                    </h1>
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.3rem',
                                        alignItems: 'center',
                                        color: '#666',
                                        fontSize: '0.9rem'
                                    }}>
                                        <PinMapFill style={{ fontSize: '0.9rem', color: colors.primary }} />
                                        <span>{chef?.location || 'N/A'} • {chef.area || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Opening Hours Display */}
                                <div className="d-flex align-items-center gap-1 mt-2">
                                    <Clock style={{ fontSize: '0.85rem', color: '#666' }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#666' }}>
                                        {chef.openingHours || 'Hours not specified'}
                                    </span>
                                    {chef.openingHours && (
                                        <Badge
                                            bg={openingStatus.isOpen ? "success" : "danger"}
                                            className="ms-2"
                                            style={{ fontSize: '0.75rem' }}
                                        >
                                            {openingStatus.isOpen ?
                                                `Open${openingStatus.closingIn ? ` (Closes in ${openingStatus.closingIn})` : ''}` :
                                                'Closed'}
                                        </Badge>
                                    )}
                                </div>

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

                        <div className="d-flex flex-wrap align-items-center gap-4" style={{ minWidth: '280px' }}>
                            <div className="text-center">
                                <div style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.primary,
                                }}>
                                    {chef.views || 0} {/* Changed from followers to views as per common chef profiles */}
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

                            <div className="text-center">
                                <div style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.primary,
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

                            <div className="text-center">
                                <div style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.primary,
                                }}>
                                    {chef.experienceYears || 0}
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

                        <div className="d-flex flex-wrap align-items-center gap-2">
                            <Button
                                className="d-flex align-items-center px-5 py-2 custom-outline-green"
                                onClick={() => setShowBioModal(true)}
                                style={{
                                    fontWeight: 500,
                                    fontSize: '0.85rem',
                                    borderColor: colors.secondary,
                                    color: colors.secondary,
                                    background: 'transparent',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        background: colors.secondary,
                                        color: 'white'
                                    }
                                }}
                            >
                                <PersonLinesFill className="me-1" /> View Bio
                            </Button>

                            <Button
                                className=' px-5 py-2 d-flex align-items-center'
                                onClick={() => setShowHireModal(true)}
                                style={{
                                    background: colors.primary,
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    transition: 'background-color 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: colors.buttonHover
                                    }
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
                    {/* Compact Auto-Scroll Foods Section - Signature Creations */}
                    <Col xs={12}>
                        <div className="py-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
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

                                    {/* You can add a link here to a full menu page if "View All" is desired */}
                                    <Button className="btn btn-sm px-3 py-1" style={{ background: colors.primary, color: '#fff', border: 'none' }} >
                                        View All
                                    </Button>
                                </div>

                                <div className="foods-scroll-container position-relative overflow-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    <style>{`
                                        .foods-scroll-container::-webkit-scrollbar {
                                            display: none;
                                        }
                                    `}</style>
                                    <div className="foods-scroll d-flex pb-2 gap-3">
                                        {state.foods.length > 0 ? (
                                            state.foods.map(food => (
                                                <div key={food._id || food.id} className="food-scroll-item" style={{ flexShrink: 0, width: '200px' }}>
                                                    <Card className="h-100 shadow-sm border-0" style={{
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer'
                                                    }}>
                                                        <div className="position-relative">
                                                            <div className="ratio ratio-1x1">
                                                                <img
                                                                    src={food.photoUrls?.[0] || '/placeholder-food.jpg'}
                                                                    alt={food.title}
                                                                    className="card-img-top object-fit-cover"
                                                                    onError={(e) => (e.target.src = '/placeholder-food.jpg')}
                                                                />
                                                            </div>
                                                            {food.isPreOrder && (
                                                                <Badge bg="info" className="position-absolute top-0 start-0 m-2">Pre-Order</Badge>
                                                            )}
                                                        </div>
                                                        <Card.Body className="d-flex flex-column p-3">
                                                            <Card.Title className="mb-1" style={{ fontSize: '1rem', fontWeight: 600, color: colors.darkText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {food.title}
                                                            </Card.Title>
                                                            <Card.Text className="text-muted mb-2 flex-grow-1" style={{ fontSize: '0.85rem', minHeight: '3em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {food.description?.substring(0, 50)}...
                                                            </Card.Text>
                                                            <div className="d-flex justify-content-between align-items-center mt-auto">
                                                                <div className="price-tag" style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.primary }}>
                                                                    KSh {food.price?.toFixed(2)}
                                                                </div>
                                                                {food.isPreOrder ? (
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        onClick={() => handlePreOrder(food)}
                                                                        style={{ borderColor: colors.primary, color: colors.primary }}
                                                                    >
                                                                        <Clock className="me-1" /> Pre-Order
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        variant="primary"
                                                                        size="sm"
                                                                        onClick={() => updateCart(food, 1)}
                                                                        style={{ backgroundColor: colors.primary, border: 'none' }}
                                                                    >
                                                                        <CartPlus className="me-1" /> Add
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-muted col-12">No signature dishes available at the moment.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Chef's Menu Section (with Tabs) */}
                    <Col xs={12}>
                        <Card className="shadow-sm border-0" style={{ borderRadius: '10px' }}>
                            <Card.Body>
                                <h4 className="mb-4" style={{ color: colors.darkText }}>Chef's Menu</h4>
                                <Tabs
                                    activeKey={selectedMealType}
                                    onSelect={(k) => setSelectedMealType(k)}
                                    className="mb-4 jikoni-tabs"
                                    fill
                                >
                                    <Tab eventKey="all" title="All">
                                        {/* Content handled by filteredFoods below */}
                                    </Tab>
                                    <Tab eventKey="Breakfast" title="Breakfast">
                                        {/* Content handled by filteredFoods below */}
                                    </Tab>
                                    <Tab eventKey="Lunch" title="Lunch">
                                        {/* Content handled by filteredFoods below */}
                                    </Tab>
                                    <Tab eventKey="Dinner" title="Dinner">
                                        {/* Content handled by filteredFoods below */}
                                    </Tab>
                                    <Tab eventKey="Snacks" title="Snacks">
                                        {/* Content handled by filteredFoods below */}
                                    </Tab>
                                    <Tab eventKey="Drinks" title="Drinks">
                                        {/* Content handled by filteredFoods below */}
                                    </Tab>
                                    <Tab eventKey="Desserts" title="Desserts">
                                        {/* Content handled by filteredFoods below */}
                                    </Tab>
                                </Tabs>

                                <Row xs={1} md={2} lg={3} className="g-4">
                                    {filteredFoods.length > 0 ? (
                                        filteredFoods.map(food => (
                                            <Col key={food._id || food.id}>
                                                <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                                                    <div className="position-relative">
                                                        <div className="ratio ratio-4x3"> {/* Maintain aspect ratio */}
                                                            <img
                                                                src={food.photoUrls?.[0] || '/placeholder-food.jpg'}
                                                                alt={food.title}
                                                                className="card-img-top object-fit-cover"
                                                                onError={(e) => (e.target.src = '/placeholder-food.jpg')}
                                                            />
                                                        </div>
                                                        {food.isPreOrder && (
                                                            <Badge bg="info" className="position-absolute top-0 start-0 m-2">Pre-Order</Badge>
                                                        )}
                                                    </div>
                                                    <Card.Body className="d-flex flex-column p-3">
                                                        <Card.Title className="mb-1" style={{ fontSize: '1rem', fontWeight: 600, color: colors.darkText }}>
                                                            {food.title}
                                                        </Card.Title>
                                                        <Card.Text className="text-muted mb-2 flex-grow-1" style={{ fontSize: '0.85rem' }}>
                                                            {food.description?.substring(0, 100)}...
                                                        </Card.Text>
                                                        <div className="d-flex justify-content-between align-items-center mt-auto">
                                                            <div className="price-tag" style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.primary }}>
                                                                KSh {food.price?.toFixed(2)}
                                                            </div>
                                                            {food.isPreOrder ? (
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => handlePreOrder(food)}
                                                                    style={{ borderColor: colors.primary, color: colors.primary }}
                                                                >
                                                                    <Clock className="me-1" /> Pre-Order
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    onClick={() => updateCart(food, 1)}
                                                                    style={{ backgroundColor: colors.primary, border: 'none' }}
                                                                >
                                                                    <CartPlus className="me-1" /> Add to Cart
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))
                                    ) : (
                                        <Col xs={12} className="text-center text-muted py-4">
                                            <p>No menu items found for this category.</p>
                                        </Col>
                                    )}
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Cart Sidebar */}
            <CartSidebar
                show={state.showCart}
                handleClose={() => setState(s => ({ ...s, showCart: false }))}
                cartItems={state.cart}
                updateCart={updateCart}
                handleCheckout={handleCheckout}
            />

            {/* Pre-Order Modal */}
            <PreOrderModal
                show={showPreOrderModal}
                handleClose={() => setShowPreOrderModal(false)}
                food={selectedFood}
                preOrderForm={preOrderForm}
                setPreOrderForm={setPreOrderForm}
                handlePreOrderSubmit={handlePreOrderSubmit}
            />

            {/* Order Confirmation Modal */}
            <OrderConfirmation
                show={state.showOrderConfirmation}
                handleClose={() => setState(s => ({ ...s, showOrderConfirmation: false }))}
                cartItems={state.cart}
                userLocation={state.userLocation}
                locationError={state.locationError}
                handleConfirmOrder={handleConfirmOrder}
            />

            {/* Chef Bio Modal */}
            <Modal show={showBioModal} onHide={() => setShowBioModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: colors.darkText }}>About {chef.user?.Name || 'This Chef'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{chef.bio || "No detailed biography available yet."}</p>
                    <p><strong>Cuisine Type:</strong> {chef.cuisineType || 'N/A'}</p>
                    <p><strong>Years of Experience:</strong> {chef.experienceYears || 0} years</p>
                 <p>
  <strong>Specialties:</strong>{' '}
  {Array.isArray(chef.speciality)
    ? chef.speciality.join(', ')
    : chef.speciality || 'N/A'}
</p>

                    {/* Add more chef details as available */}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBioModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Hire Chef Modal */}
            <Modal show={showHireModal} onHide={() => setShowHireModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: colors.darkText }}>Hire {chef.user?.Name || 'This Chef'} for an Event</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleHireChef}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Your Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={hireForm.name}
                                onChange={(e) => setHireForm({ ...hireForm, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Your Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={hireForm.email}
                                onChange={(e) => setHireForm({ ...hireForm, email: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Event Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={hireForm.eventDate}
                                onChange={(e) => setHireForm({ ...hireForm, eventDate: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Number of Guests</Form.Label>
                            <Form.Control
                                type="number"
                                value={hireForm.guests}
                                onChange={(e) => setHireForm({ ...hireForm, guests: parseInt(e.target.value) || 1 })}
                                min="1"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Message / Event Details</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={hireForm.message}
                                onChange={(e) => setHireForm({ ...hireForm, message: e.target.value })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowHireModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" style={{ backgroundColor: colors.primary, border: 'none' }}>
                            Send Request
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </div>
    );
};

export default ChefProfile;