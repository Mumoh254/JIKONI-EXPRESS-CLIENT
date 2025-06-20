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
    starGold: '#FFD700', // Gold for star ratings
    lightGray: '#E2E8F0', // General light gray for borders/dividers
    textMuted: '#6B7280', // Muted text color
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
                                        className="px-3 px-md-4 py-1 d-flex align-items-center rounded-pill"
                                        style={{ backgroundColor: colors.secondary, border: 'none', fontSize: '0.9rem', fontWeight: '500' }}
                                        onClick={() => setState(s => ({ ...s, showRiderReg: true }))}
                                    >
                                        <RiMotorbikeFill className="me-2" />
                                        <span className="d-none d-md-inline">Rider</span>
                                    </Button>
                                </div>
                            )}
                            <Button
                                className="px-3 me-2 mt-1 px-md-2 py-1 position-relative d-flex align-items-center text-white border-0 rounded-pill"
                                style={{ backgroundColor: '#FFC107', fontSize: '0.9rem', fontWeight: '500' }} // Using a distinct color for cart
                                onClick={() => setState(s => ({ ...s, showCart: true }))}
                            >
                                <FaCartPlus className="me-2" />
                                <span className="d-none d-md-inline">Cart</span>
                                <span
                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                                    style={{ backgroundColor: colors.secondary, fontSize: '0.7rem', padding: '0.4em 0.6em' }}
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
                padding: '1.5rem 0',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                borderBottom: `1px solid ${colors.lightGray}`
            }}>
                <div className="container">
                    <div className="d-flex flex-column flex-md-row align-items-start justify-content-between gap-4">
                        <div className="d-flex align-items-start gap-3">
                            <div className="position-relative" style={{ flexShrink: 0 }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: `3px solid ${colors.lightBackground}`,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
                                    bottom: '5px',
                                    right: '5px',
                                    backgroundColor: colors.secondary, // Green for verified/pro
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                    border: '3px solid #ffffff'
                                }}>
                                    <BsAwardFill style={{ color: 'white', fontSize: '0.9rem' }} /> {/* Award fill for pro/verified */}
                                </div>
                            </div>

                            <div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <h1 style={{
                                        fontSize: '2rem',
                                        fontWeight: 800,
                                        marginBottom: '0.25rem',
                                        color: colors.darkText,
                                        lineHeight: '1.2'
                                    }}>
                                        {chef.user?.Name || 'Chef Name Not Available'}
                                    </h1>
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        alignItems: 'center',
                                        color: colors.textMuted,
                                        fontSize: '0.95rem',
                                        fontWeight: '500'
                                    }}>
                                        <PinMapFill style={{ fontSize: '1rem', color: colors.primary }} />
                                        <span>{chef?.location || 'N/A'} • {chef.area || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Opening Hours Display */}
                                <div className="d-flex align-items-center gap-2 mt-2">
                                    <Clock style={{ fontSize: '0.9rem', color: colors.textMuted }} />
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.darkText }}>
                                        {chef.openingHours || 'Hours not specified'}
                                    </span>
                                    {chef.openingHours && (
                                        <Badge
                                            bg={openingStatus.isOpen ? "success" : "danger"}
                                            className="ms-2 py-1 px-2 rounded-pill"
                                            style={{ fontSize: '0.75rem', fontWeight: 'bold' }}
                                        >
                                            {openingStatus.isOpen ?
                                                `Open${openingStatus.closingIn ? ` (Closes in ${openingStatus.closingIn})` : ''}` :
                                                'Closed'}
                                        </Badge>
                                    )}
                                </div>

                                <div className="d-flex gap-2 mt-3">
                                    <div style={{
                                        backgroundColor: '#eff6ff',
                                        color: '#3b82f6',
                                        padding: '0.4rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        border: '1px solid #dbeafe'
                                    }}>
                                        <StarFill style={{ fontSize: '0.75rem', color: colors.starGold }} />
                                        <span>PRO CHEF</span>
                                    </div>
                                    <div style={{
                                        backgroundColor: '#ecfdf5',
                                        color: '#10b981',
                                        padding: '0.4rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        border: '1px solid #d1fae5'
                                    }}>
                                        <CheckCircleFill style={{ fontSize: '0.75rem' }} />
                                        <span>VERIFIED</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex flex-wrap align-items-center gap-5 pe-4">
                            <div className="text-center">
                                <div style={{
                                    fontSize: '1.6rem',
                                    fontWeight: 700,
                                    color: colors.primary,
                                    lineHeight: '1.2'
                                }}>
                                    {chef.views || 0}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    color: colors.textMuted,
                                    textTransform: 'uppercase',
                                    marginTop: '0.25rem'
                                }}>
                                    Views
                                </div>
                            </div>

                            <div className="text-center">
                                <div style={{
                                    fontSize: '1.6rem',
                                    fontWeight: 700,
                                    color: colors.primary,
                                    lineHeight: '1.2'
                                }}>
                                    {chef.likes || 0}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    color: colors.textMuted,
                                    textTransform: 'uppercase',
                                    marginTop: '0.25rem'
                                }}>
                                    Likes
                                </div>
                            </div>

                            <div className="text-center">
                                <div style={{
                                    fontSize: '1.6rem',
                                    fontWeight: 700,
                                    color: colors.primary,
                                    lineHeight: '1.2'
                                }}>
                                    {chef.experienceYears || 0}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    color: colors.textMuted,
                                    textTransform: 'uppercase',
                                    marginTop: '0.25rem'
                                }}>
                                    Years Exp
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: '#fffbeb',
                                color: '#d97706',
                                padding: '0.5rem 1.2rem',
                                borderRadius: '25px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                border: '1px solid #fde68a',
                                flexShrink: 0
                            }}>
                                <EggFried style={{ fontSize: '0.95rem' }} />
                                <span>{chef.cuisineType || 'Continental Cuisine'}</span>
                            </div>
                        </div>

                        <div className="d-flex flex-wrap align-items-center gap-3">
                            <Button
                                className="d-flex align-items-center px-4 py-2 rounded-pill"
                                onClick={() => setShowBioModal(true)}
                                style={{
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    backgroundColor: 'transparent',
                                    color: colors.secondary,
                                    border: `2px solid ${colors.secondary}`,
                                    '&:hover': {
                                        backgroundColor: colors.secondary,
                                        color: colors.cardBackground
                                    }
                                }}
                            >
                                <PersonLinesFill className="me-2" style={{ fontSize: '1.1rem' }} />
                                Full Bio
                            </Button>
                            <Button
                                className="d-flex align-items-center px-4 py-2 rounded-pill"
                                onClick={() => setShowHireModal(true)}
                                style={{
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    backgroundColor: colors.primary,
                                    color: 'white',
                                    border: `2px solid ${colors.primary}`,
                                    '&:hover': {
                                        backgroundColor: colors.buttonHover,
                                        borderColor: colors.buttonHover
                                    }
                                }}
                            >
                                <CheckCircleFill className="me-2" style={{ fontSize: '1.1rem' }} />
                                Hire Chef
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container py-5">
                <Row>
                    <Col lg={9}>
                        {/* Food Categories / Tabs */}
                        <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
                            <Card.Body className="p-3">
                                <Tabs
                                    activeKey={selectedMealType}
                                    onSelect={(k) => setSelectedMealType(k)}
                                    className="mb-3 jikoni-tabs"
                                    fill
                                    style={{
                                        '--bs-nav-tabs-link-active-color': colors.primary,
                                        '--bs-nav-tabs-link-active-border-color': `${colors.lightGray} ${colors.lightGray} ${colors.primary}`,
                                        '--bs-nav-tabs-link-hover-border-color': `${colors.lightGray} ${colors.lightGray} ${colors.primary}`,
                                        '--bs-nav-tabs-border-color': colors.lightGray,
                                        '--bs-nav-tabs-border-radius': '8px',
                                        fontSize: '1rem',
                                        fontWeight: 600
                                    }}
                                >
                                    <Tab eventKey="all" title="All Meals" />
                                    <Tab eventKey="breakfast" title="Breakfast" />
                                    <Tab eventKey="lunch" title="Lunch" />
                                    <Tab eventKey="dinner" title="Dinner" />
                                    <Tab eventKey="dessert" title="Dessert" />
                                    <Tab eventKey="drinks" title="Drinks" />
                                </Tabs>
                            </Card.Body>
                        </Card>

                        {/* Food Menu Items */}
                        <Row xs={1} md={2} className="g-4">
                            {filteredFoods.length > 0 ? (
                                filteredFoods.map(food => (
                                    <Col key={food.id}>
                                        <Card className="h-100 shadow-sm border-0 food-card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                            <Row className="g-0">
                                                <Col xs={4}>
                                                    <div style={{ height: '100%', minHeight: '150px', overflow: 'hidden' }}>
                                                        <Card.Img
                                                            variant="top"
                                                            src={food.image || '/images/default-food.jpg'}
                                                            alt={food.title}
                                                            style={{ objectFit: 'cover', width: '100%', height: '100%', transition: 'transform 0.3s ease-in-out' }}
                                                            className="food-card-img"
                                                        />
                                                    </div>
                                                </Col>
                                                <Col xs={8}>
                                                    <Card.Body className="d-flex flex-column justify-content-between p-3">
                                                        <div>
                                                            <Card.Title className="mb-1" style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.darkText }}>
                                                                {food.title}
                                                            </Card.Title>
                                                            <Card.Text className="mb-2" style={{ fontSize: '0.9rem', color: colors.textMuted }}>
                                                                {food.description?.substring(0, 70)}...
                                                            </Card.Text>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <StarFill className="text-warning me-1" style={{ fontSize: '0.9rem', color: colors.starGold }} />
                                                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.darkText }}>
                                                                    {food.rating?.toFixed(1) || 'N/A'}
                                                                </span>
                                                                <span className="ms-2" style={{ fontSize: '0.85rem', color: colors.textMuted }}>
                                                                    ({food.reviews || 0} reviews)
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                                            <div className="price-tag" style={{ fontSize: '1.4rem', fontWeight: 700, color: colors.primary }}>
                                                                Ksh {food.price?.toFixed(2) || '0.00'}
                                                            </div>
                                                            <div className="d-flex gap-2">
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    className="rounded-pill"
                                                                    onClick={() => handlePreOrder(food)}
                                                                    style={{
                                                                        fontWeight: 500,
                                                                        fontSize: '0.85rem',
                                                                        borderColor: colors.secondary,
                                                                        color: colors.secondary,
                                                                        '&:hover': {
                                                                            backgroundColor: colors.secondary,
                                                                            color: 'white'
                                                                        }
                                                                    }}
                                                                >
                                                                    <Clock className="me-1" /> Pre-Order
                                                                </Button>
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    onClick={() => updateCart(food, 1)}
                                                                    className="rounded-pill"
                                                                    style={{
                                                                        backgroundColor: colors.primary,
                                                                        borderColor: colors.primary,
                                                                        fontWeight: 500,
                                                                        fontSize: '0.85rem',
                                                                        '&:hover': {
                                                                            backgroundColor: colors.buttonHover,
                                                                            borderColor: colors.buttonHover
                                                                        }
                                                                    }}
                                                                >
                                                                    <CartPlus className="me-1" /> Add
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </Col>
                                ))
                            ) : (
                                <Col xs={12}>
                                    <Card className="text-center py-5 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                                        <Card.Body>
                                            <p className="text-muted fs-5">No food items found for this chef or selected meal type.</p>
                                            <Button
                                                variant="outline-primary"
                                                onClick={() => setSelectedMealType('all')}
                                                style={{ color: colors.primary, borderColor: colors.primary }}
                                            >
                                                Show All Meals
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )}
                        </Row>
                    </Col>

                    <Col lg={3}>
                        {/* Right Sidebar - Dynamic Content */}
                        <div className="d-flex flex-column gap-4 sticky-top" style={{ top: '100px' }}>
                            {/* Chef's Top Selling Items Carousel (Placeholder) */}
                            <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
                                <Card.Body>
                                    <h5 className="mb-3" style={{ color: colors.darkText, fontWeight: 700 }}>Chef's Top Picks</h5>
                                    <Carousel indicators={false} controls={true} interval={3000} className="chef-carousel">
                                        {state.foods.slice(0, 3).map((food, idx) => ( // Show first 3 foods as top picks
                                            <Carousel.Item key={idx}>
                                                <img
                                                    className="d-block w-100 rounded"
                                                    src={food.image || '/images/carousel-food.jpg'}
                                                    alt={food.title}
                                                    style={{ height: '180px', objectFit: 'cover' }}
                                                />
                                                <Carousel.Caption className="bg-dark bg-opacity-75 py-2 rounded-bottom" style={{ bottom: '0' }}>
                                                    <h5 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{food.title}</h5>
                                                    <p className="mb-0" style={{ fontSize: '0.9rem' }}>Ksh {food.price?.toFixed(2)}</p>
                                                </Carousel.Caption>
                                            </Carousel.Item>
                                        ))}
                                        {state.foods.length === 0 && (
                                            <Carousel.Item>
                                                <div className="d-flex justify-content-center align-items-center rounded" style={{ height: '180px', backgroundColor: colors.lightGray, color: colors.textMuted }}>
                                                    No Top Picks Yet
                                                </div>
                                            </Carousel.Item>
                                        )}
                                    </Carousel>
                                </Card.Body>
                            </Card>

                            {/* Promotional Banner/Card */}
                            <Card className="shadow-sm border-0 text-center p-3" style={{ borderRadius: '12px', background: `linear-gradient(45deg, ${colors.primary}, ${colors.buttonHover})`, color: 'white' }}>
                                <Card.Body>
                                    <h4 className="fw-bold mb-2">Exclusive Offer!</h4>
                                    <p className="mb-3">Get 15% off your first pre-order from {chef.user?.Name}!</p>
                                    <Button
                                        variant="light"
                                        className="rounded-pill fw-bold"
                                        onClick={() => Swal.fire('Offer Details', 'Use code JIKONI15 at checkout for 15% off!', 'info')}
                                        style={{ color: colors.primary }}
                                    >
                                        Claim Offer
                                    </Button>
                                </Card.Body>
                            </Card>

                            {/* Quick Links / CTAs */}
                            <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
                                <Card.Body>
                                    <h5 className="mb-3" style={{ color: colors.darkText, fontWeight: 700 }}>Quick Actions</h5>
                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="outline-primary"
                                            className="d-flex align-items-center justify-content-center py-2 rounded-pill"
                                            onClick={goToLiquor}
                                            style={{
                                                color: colors.primary,
                                                borderColor: colors.primary,
                                                fontWeight: 500,
                                                '&:hover': {
                                                    backgroundColor: colors.primary,
                                                    color: 'white'
                                                }
                                            }}
                                        >
                                            <FaCartPlus className="me-2" /> Explore Liquor Shots
                                        </Button>
                                        <Button
                                            variant="outline-success"
                                            className="d-flex align-items-center justify-content-center py-2 rounded-pill"
                                            onClick={() => navigate('/jikoni-express/contact')} // Example navigation
                                            style={{
                                                color: colors.secondary,
                                                borderColor: colors.secondary,
                                                fontWeight: 500,
                                                '&:hover': {
                                                    backgroundColor: colors.secondary,
                                                    color: 'white'
                                                }
                                            }}
                                        >
                                            <PersonLinesFill className="me-2" /> Contact Support
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Modals */}
            <Modal show={showBioModal} onHide={() => setShowBioModal(false)} centered size="lg">
                <Modal.Header closeButton style={{ borderBottom: `1px solid ${colors.lightGray}` }}>
                    <Modal.Title style={{ color: colors.darkText, fontWeight: 700 }}>{chef.user?.Name}'s Full Biography</Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-4">
                    <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: colors.darkText }}>
                        {chef.bio || "This chef has not provided a detailed biography yet. Check back soon for more information!"}
                    </p>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4">
                        <div className="d-flex align-items-center gap-2">
                            <Clock style={{ color: colors.primary, fontSize: '1.2rem' }} />
                            <span className="fw-bold" style={{ color: colors.darkText }}>Joined:</span>
                            <span style={{ color: colors.textMuted }}>
                                {chef.createdAt ? formatDistanceToNow(new Date(chef.createdAt), { addSuffix: true }) : 'N/A'}
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <EggFried style={{ color: colors.secondary, fontSize: '1.2rem' }} />
                            <span className="fw-bold" style={{ color: colors.darkText }}>Specialty:</span>
                            <span style={{ color: colors.textMuted }}>
                                {chef.speciality || 'Diverse Cuisine'}
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <PinMapFill style={{ color: colors.primary, fontSize: '1.2rem' }} />
                            <span className="fw-bold" style={{ color: colors.darkText }}>Area:</span>
                            <span style={{ color: colors.textMuted }}>
                                {chef.area || 'Various'}
                            </span>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: `1px solid ${colors.lightGray}` }}>
                    <Button
                        variant="secondary"
                        onClick={() => setShowBioModal(false)}
                        style={{
                            backgroundColor: colors.lightGray,
                            color: colors.darkText,
                            border: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: colors.borderColor
                            }
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showHireModal} onHide={() => setShowHireModal(false)} centered size="md">
                <Modal.Header closeButton style={{ borderBottom: `1px solid ${colors.lightGray}` }}>
                    <Modal.Title style={{ color: colors.darkText, fontWeight: 700 }}>Hire {chef.user?.Name} for an Event</Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-4">
                    <Form onSubmit={handleHireChef}>
                        <Form.Group className="mb-3" controlId="hireName">
                            <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>Your Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter your name"
                                value={hireForm.name}
                                onChange={(e) => setHireForm({ ...hireForm, name: e.target.value })}
                                required
                                style={{ borderColor: colors.borderColor, '&:focus': { borderColor: colors.primary, boxShadow: `0 0 0 0.25rem ${colors.primary}40` } }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="hireEmail">
                            <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>Your Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={hireForm.email}
                                onChange={(e) => setHireForm({ ...hireForm, email: e.target.value })}
                                required
                                style={{ borderColor: colors.borderColor, '&:focus': { borderColor: colors.primary, boxShadow: `0 0 0 0.25rem ${colors.primary}40` } }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="hireEventDate">
                            <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>Event Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={hireForm.eventDate}
                                onChange={(e) => setHireForm({ ...hireForm, eventDate: e.target.value })}
                                required
                                style={{ borderColor: colors.borderColor, '&:focus': { borderColor: colors.primary, boxShadow: `0 0 0 0.25rem ${colors.primary}40` } }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="hireGuests">
                            <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>Number of Guests</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                value={hireForm.guests}
                                onChange={(e) => setHireForm({ ...hireForm, guests: parseInt(e.target.value) || 1 })}
                                required
                                style={{ borderColor: colors.borderColor, '&:focus': { borderColor: colors.primary, boxShadow: `0 0 0 0.25rem ${colors.primary}40` } }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-4" controlId="hireMessage">
                            <Form.Label style={{ fontWeight: 600, color: colors.darkText }}>Message / Event Details</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Tell us more about your event (e.g., type of event, specific cuisine requests, budget)"
                                value={hireForm.message}
                                onChange={(e) => setHireForm({ ...hireForm, message: e.target.value })}
                                style={{ borderColor: colors.borderColor, '&:focus': { borderColor: colors.primary, boxShadow: `0 0 0 0.25rem ${colors.primary}40` } }}
                            />
                        </Form.Group>
                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100 py-2 rounded-pill"
                            style={{
                                backgroundColor: colors.primary,
                                borderColor: colors.primary,
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                '&:hover': {
                                    backgroundColor: colors.buttonHover,
                                    borderColor: colors.buttonHover
                                }
                            }}
                        >
                            Send Hire Request
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Cart Sidebar, Pre-order Modal, and Order Confirmation - Assuming these are styled internally */}
            <CartSidebar
                show={state.showCart}
                handleClose={() => setState(s => ({ ...s, showCart: false }))}
                cartItems={state.cart}
                updateCart={updateCart}
                handleCheckout={handleCheckout}
            />

            <PreOrderModal
                show={showPreOrderModal}
                handleClose={() => setShowPreOrderModal(false)}
                food={selectedFood}
                preOrderForm={preOrderForm}
                setPreOrderForm={setPreOrderForm}
                handleSubmit={handlePreOrderSubmit}
            />

            <OrderConfirmation
                show={state.showOrderConfirmation}
                handleClose={() => setState(s => ({ ...s, showOrderConfirmation: false }))}
                cartItems={state.cart}
                userLocation={state.userLocation}
                locationError={state.locationError}
                handleConfirmOrder={handleConfirmOrder}
            />

            {/* Custom CSS for finer control and hover effects */}
            <style jsx>{`
                .jikoni-tabs .nav-link {
                    color: ${colors.darkText};
                    border: none;
                    border-bottom: 2px solid transparent;
                    transition: all 0.3s ease;
                    padding: 0.75rem 1.25rem;
                }
                .jikoni-tabs .nav-link:hover {
                    color: ${colors.primary};
                    border-bottom-color: ${colors.primary};
                }
                .jikoni-tabs .nav-link.active {
                    color: ${colors.primary};
                    background-color: ${colors.cardBackground};
                    border-bottom: 3px solid ${colors.primary};
                    font-weight: 700;
                }
                .jikoni-tabs .nav-item {
                    margin-bottom: 0; /* Remove default margin */
                }
                .food-card {
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                }
                .food-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
                }
                .food-card-img {
                    transition: transform 0.3s ease-in-out;
                }
                .food-card:hover .food-card-img {
                    transform: scale(1.05);
                }
                .chef-carousel .carousel-control-prev-icon,
                .chef-carousel .carousel-control-next-icon {
                    background-color: ${colors.darkText};
                    border-radius: 50%;
                    padding: 10px;
                }
                .chef-carousel .carousel-indicators [data-bs-target] {
                    background-color: ${colors.primary};
                }
                .custom-outline-green {
                    border-color: ${colors.secondary};
                    color: ${colors.secondary};
                    background-color: transparent;
                    transition: all 0.3s ease;
                }
                .custom-outline-green:hover {
                    background-color: ${colors.secondary};
                    color: white;
                    border-color: ${colors.secondary};
                }
            `}</style>
        </div>
    );
};

export default ChefProfile;