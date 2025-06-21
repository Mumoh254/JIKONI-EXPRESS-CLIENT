import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Button, Tabs, Tab, Modal, Spinner, Form } from 'react-bootstrap';
import { PinMapFill, CheckCircleFill, StarFill, Clock, EggFried, PersonLinesFill } from 'react-bootstrap-icons';
import moment from 'moment-timezone';
import { GiKenya } from "react-icons/gi";
import { FaCartPlus } from "react-icons/fa";
import { RiMotorbikeFill } from 'react-icons/ri';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import styled from 'styled-components';

// Assuming these components exist and are correctly imported from their respective paths
import { CartSidebar, PreOrderModal } from '../../../components/cartAndOrder/cart';
import OrderConfirmation from '../../../components/cartAndOrder/orderConfirm';
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
    accentBlue: '#3498DB', // A new accent color for variety
};

// Styled components for improved aesthetics and layout control
const PageWrapper = styled.div`
    background-color: ${colors.lightBackground};
    min-height: 100vh;
    font-family: 'Poppins', sans-serif;
`;

const HeaderContainer = styled.header`
    background-color: ${colors.white};
    box-shadow: 0 2px 15px rgba(0,0,0,0.08);
    position: sticky;
    top: 0;
    z-index: 1050;
    padding: 0.5rem 1rem; // Further reduced padding for a sleeker header

    .brand-title {
        font-size: 1.5rem; // Slightly smaller for sleekness
        font-weight: 800;
        margin-bottom: 0;
        .jikoni-red { color: ${colors.primary}; }
        .jikoni-green { color: ${colors.secondary}; }
    }

    .header-icon {
        font-size: 1.6rem; // Slightly smaller icon
    }

    .header-btn {
        font-size: 0.75rem; // Smaller font for buttons
        font-weight: 600;
        padding: 0.3rem 0.9rem; // Smaller padding for buttons
        border-radius: 50px;
        transition: all 0.3s ease;
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
    }

    .cart-badge {
        background-color: ${colors.secondary};
        font-size: 0.55rem; // Smaller cart badge
        padding: 0.15em 0.35em;
        top: -2px;
        right: -2px;
    }

    @media (max-width: 576px) {
        padding: 0.4rem 0.8rem;
        .brand-title {
            font-size: 1.4rem;
        }
        .header-icon {
            font-size: 1.5rem;
        }
        .header-btn {
            font-size: 0.7rem;
            padding: 0.25rem 0.7rem;
        }
    }
`;

const ChefInfoSection = styled.div`
    background-color: ${colors.white};
    padding: 1.5rem 1rem; // Reduced padding
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    border-bottom: 1px solid ${colors.lightGray};
    display: flex;
    flex-direction: column; // Stack elements vertically
    align-items: center; // Center horizontally
    text-align: center; // Center text

    .profile-picture-wrapper {
        width: 100px; // Further reduced for sleekness
        height: 100px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid ${colors.lightBackground}; // Thinner border
        box-shadow: 0 5px 15px rgba(0,0,0,0.15); // Lighter shadow
        margin-bottom: 0.8rem; // Reduced space below image
        position: relative;
    }

    .profile-picture-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .badge-award {
        position: absolute;
        bottom: 3px; // Adjusted position
        right: 3px; // Adjusted position
        background-color: ${colors.secondary};
        width: 24px; // Further smaller award badge
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 5px rgba(0,0,0,0.15); // Lighter shadow
        border: 1.5px solid ${colors.white}; // Thinner border
        svg { color: white; font-size: 0.8rem; } // Smaller icon
    }

    .chef-name {
        font-size: 1.9rem; // Slightly smaller name
        font-weight: 800;
        color: ${colors.darkText};
        margin-bottom: 0.3rem; // Reduced margin
        line-height: 1.2;
    }

    .location-info {
        display: flex;
        align-items: center;
        gap: 0.4rem; // Reduced gap
        color: ${colors.textMuted};
        font-size: 0.85rem; // Further smaller font
        font-weight: 500;
        margin-bottom: 0.6rem; // Reduced margin
        svg { font-size: 1rem; color: ${colors.primary}; }
    }

    .opening-status {
        display: flex;
        align-items: center;
        gap: 0.3rem; // Reduced gap
        margin-bottom: 0.6rem; // Reduced margin
        font-size: 0.85rem;
        color: ${colors.darkText};

        .status-badge {
            font-size: 0.6rem; // Smaller badge font
            font-weight: bold;
            padding: 0.2em 0.4em;
        }
    }

    .chef-badges {
        display: flex;
        flex-wrap: wrap; // Allow wrapping on small screens
        justify-content: center; // Center badges
        gap: 0.5rem; // Reduced gap
        margin-bottom: 1rem; // Reduced space

        .info-badge {
            background-color: ${colors.lightGray};
            color: ${colors.placeholderText};
            padding: 0.25rem 0.7rem; // Reduced padding
            border-radius: 16px;
            font-size: 0.75rem; // Smaller font
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.3rem; // Reduced gap
            border: 1px solid ${colors.mediumGray};

            &.success { background-color: rgba(0, 200, 83, 0.1); color: ${colors.secondary}; border-color: ${colors.secondary}; }
            &.accent { background-color: rgba(52, 152, 219, 0.1); color: ${colors.accentBlue}; border-color: ${colors.accentBlue}; }
            svg { font-size: 0.8rem; } // Smaller icon
        }
    }

    .chef-stats-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1.5rem; // Reduced gap
        margin-bottom: 1rem; // Reduced margin

        .stat-item {
            text-align: center;
            .stat-value {
                font-size: 1.4rem; // Smaller stat value
                font-weight: 800;
                color: ${colors.darkText};
            }
            .stat-label {
                font-size: 0.8rem; // Smaller stat label
                color: ${colors.placeholderText};
                font-weight: 500;
            }
        }
    }

    .chef-action-buttons {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.6rem; // Reduced gap

        .custom-btn {
            padding: 0.6rem 1.5rem; // Reduced padding
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.85rem; // Smaller font
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.3rem;
            transition: all 0.3s ease;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
        }
        .custom-outline-btn {
            background-color: transparent;
            border: 1.5px solid ${colors.mediumGray}; // Thinner border
            color: ${colors.darkText};
            &:hover {
                background-color: ${colors.lightGray};
                border-color: ${colors.darkText};
            }
        }
        .custom-solid-btn {
            background-color: ${colors.primary};
            border: 1.5px solid ${colors.primary}; // Thinner border
            color: ${colors.white};
            &:hover {
                background-color: #E6392B;
                border-color: #E6392B;
            }
        }
    }

    @media (max-width: 576px) {
        padding: 1rem 0.5rem;
        .chef-name {
            font-size: 1.6rem;
        }
        .profile-picture-wrapper {
            width: 80px;
            height: 80px;
            margin-bottom: 0.6rem;
        }
        .badge-award {
            width: 20px;
            height: 20px;
            svg { font-size: 0.7rem; }
        }
        .location-info, .opening-status {
            font-size: 0.8rem;
        }
        .chef-badges .info-badge {
            font-size: 0.7rem;
            padding: 0.2rem 0.5rem;
        }
        .chef-stats-container {
            gap: 1rem;
        }
        .chef-stats-container .stat-value {
            font-size: 1.2rem;
        }
        .chef-stats-container .stat-label {
            font-size: 0.75rem;
        }
        .chef-action-buttons .custom-btn {
            font-size: 0.8rem;
            padding: 0.5rem 1rem;
        }
    }
`;

const FoodCategoriesContainer = styled(Card)`
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    margin-bottom: 1.5rem;

    .card-body {
        padding: 1rem; // Reduced padding
    }

    .tabs-wrapper {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch; /* Enable smooth scrolling on iOS */
        scrollbar-width: none; /* Hide scrollbar for Firefox */
        &::-webkit-scrollbar {
            display: none; /* Hide scrollbar for Chrome, Safari, Edge */
        }
    }

    .nav-tabs {
        flex-wrap: nowrap; // Ensure tabs stay in a single row
        border-bottom: none;

        .nav-link {
            white-space: nowrap; // Prevent tab text from wrapping
            padding: 0.5rem 1rem; // Reduced padding
            color: ${colors.placeholderText};
            font-weight: 600;
            border: none;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
            margin-right: 0.3rem; // Reduced space between tabs

            &:hover {
                color: ${colors.primary};
                border-bottom-color: ${colors.primary};
            }

            &.active {
                color: ${colors.primary};
                border-bottom-color: ${colors.primary};
                background-color: transparent;
            }
        }
    }

    @media (max-width: 576px) {
        .card-body {
            padding: 0.8rem;
        }
        .nav-tabs .nav-link {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
        }
    }
`;

const FoodCarouselContainer = styled.div`
    margin-bottom: 2rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin; // Make scrollbar visible but thin
    scrollbar-color: ${colors.primary} ${colors.lightGray}; // Custom scrollbar color for Firefox
    &::-webkit-scrollbar {
        height: 8px; // Height of the horizontal scrollbar
    }
    &::-webkit-scrollbar-track {
        background: ${colors.lightGray};
        border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${colors.primary};
        border-radius: 10px;
        border: 2px solid ${colors.lightGray};
    }
    padding-bottom: 0.5rem; // Give space for scrollbar
`;

const FoodCardStyled = styled(Card)`
    border: none;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    width: 280px; // Fixed width for horizontal scrolling
    flex-shrink: 0; // Prevent shrinking
    margin-right: 1.5rem; // Space between cards
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;

    &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }

    .card-img-top {
        height: 180px; // Fixed height for images
        object-fit: cover;
    }

    .card-body {
        padding: 1.2rem;
    }

    .food-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: ${colors.darkText};
        margin-bottom: 0.5rem;
    }

    .food-description {
        font-size: 0.9rem;
        color: ${colors.textMuted};
        line-height: 1.5;
        margin-bottom: 0.8rem;
    }

    .price-tag {
        font-size: 1.3rem;
        font-weight: 800;
        color: ${colors.primary};
    }

    .add-to-cart-btn {
        background-color: ${colors.secondary};
        border-color: ${colors.secondary};
        color: ${colors.white};
        font-size: 0.9rem;
        font-weight: 600;
        border-radius: 8px;
        padding: 0.6rem 1rem;
        transition: all 0.3s ease;
        &:hover {
            background-color: #00B14A;
            border-color: #00B14A;
            transform: translateY(-2px);
        }
    }

    .pre-order-btn {
        background-color: transparent;
        border: 2px solid ${colors.primary};
        color: ${colors.primary};
        font-size: 0.9rem;
        font-weight: 600;
        border-radius: 8px;
        padding: 0.6rem 1rem;
        transition: all 0.3s ease;
        &:hover {
            background-color: ${colors.primary};
            color: ${colors.white};
            transform: translateY(-2px);
        }
    }
`;

const SectionHeading = styled.h3`
    font-size: 1.8rem;
    font-weight: 700;
    color: ${colors.darkText};
    margin-bottom: 1.5rem;
    span {
        color: ${colors.primary};
    }

    @media (max-width: 576px) {
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }
`;

const HorizontalScrollIndicator = styled.div`
    text-align: center;
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: ${colors.textMuted};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    svg {
        animation: bounceX 1.5s infinite;
    }

    @keyframes bounceX {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(5px); }
    }
`;

const StyledModalHeader = styled(Modal.Header)`
    border-bottom: none;
    padding-bottom: 0;
    .modal-title {
        color: ${colors.darkText};
        font-weight: 700;
    }
`;

const StyledModalBody = styled(Modal.Body)`
    padding: 1.5rem 2rem;
    p {
        color: ${colors.placeholderText};
        line-height: 1.6;
    }
    hr {
        border-color: ${colors.lightGray};
        margin: 1.5rem 0;
    }
    .form-label {
        font-weight: 600;
        color: ${colors.darkText};
        margin-bottom: 0.5rem;
    }
    .form-control {
        border-radius: 10px; // More rounded inputs
        border: 1px solid ${colors.borderColor};
        padding: 0.8rem 1rem;
        &:focus {
            border-color: ${colors.primary};
            box-shadow: 0 0 0 0.25rem rgba(255, 69, 50, 0.25);
        }
    }
    .modal-submit-btn {
        background-color: ${colors.primary};
        border-color: ${colors.primary};
        color: ${colors.white};
        font-weight: 600;
        padding: 0.8rem 1.5rem;
        border-radius: 10px;
        transition: all 0.3s ease;
        &:hover {
            background-color: ${colors.buttonHover};
            border-color: ${colors.buttonHover};
            transform: translateY(-2px);
        }
    }
`;

const StyledModalFooter = styled(Modal.Footer)`
    border-top: none;
    padding-top: 0;
    justify-content: center;
`;


const ChefProfile = () => {
    const { id: chefId } = useParams();
    const [state, setState] = useState({
        foods: [],
        orders: [],
        cart: [],
        showCart: false,
        loading: true,
        error: null,
        isChefMode: localStorage.getItem('isChef') === 'true',
        isRiderMode: localStorage.getItem('isRider') === 'true',
        showOrderConfirmation: false,
        userLocation: null,
        locationError: null,
        areas: [],
        specialties: []
    });

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
    const [chef, setChef] = useState({});
    const [selectedMealType, setSelectedMealType] = useState('all');
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
                const chefResponse = await fetch(`${BASE_URL}/chef/${chefId}`);
                if (!chefResponse.ok) {
                    throw new Error(`Failed to fetch chef profile. Status: ${chefResponse.status}`);
                }
                const chefData = await chefResponse.json();
                const fetchedChef = chefData?.data ?? {};

                setChef(fetchedChef);

                if (typeof fetchedChef.openingHours === 'string') {
                    updateOpeningStatus(fetchedChef.openingHours);
                } else {
                    updateOpeningStatus('08:00 - 18:00');
                    console.warn("Missing or invalid openingHours from chef data, using default:", fetchedChef);
                }

                const foodsResponse = await fetch(`${BASE_URL}/foods/${chefId}`);
                if (!foodsResponse.ok) {
                    throw new Error(`Failed to fetch foods for this chef. Status: ${foodsResponse.status}`);
                }
                const foodsData = await foodsResponse.json();
                console.log("Fetched Foods Data:", foodsData);

                const areas = [...new Set(foodsData.map(food => food.area).filter(Boolean))];
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

        return () => {
        };
    }, [chefId, BASE_URL]);

    useEffect(() => {
        if (chef && chef.openingHours) {
            const interval = setInterval(() => {
                updateOpeningStatus(chef.openingHours);
            }, 60000);

            return () => clearInterval(interval);
        }
    }, [chef?.openingHours, chef]);

    const playSound = () => {
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

    const handlePreOrderSubmit = () => {
        if (!selectedFood) {
            console.error("No food selected for pre-order.");
            Swal.fire('Error', 'No food selected for pre-order.', 'error');
            return;
        }

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

        updateCart(preOrderItem, preOrderForm.servings);
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
                    console.error("Geolocation error:", error);
                    setState(prev => ({
                        ...prev,
                        showOrderConfirmation: true,
                        locationError: "Failed to get your location: " + error.message
                    }));
                    Swal.fire('Location Error', 'Failed to get your current location. Please enable location services or manually enter your address during checkout.', 'error');
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
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
                cart: [],
                showOrderConfirmation: false
            }));
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
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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

            Swal.fire('Success', 'Hire request sent successfully! The chef will contact you soon.', 'success');
            setShowHireModal(false);
            setHireForm({ name: '', email: '', eventDate: '', guests: 10, message: '' });
        } catch (error) {
            console.error('Hire chef error:', error);
            Swal.fire('Error', error.message || 'Failed to send hire request. Please try again.', 'error');
        }
    };

    const filteredFoods = state.foods.filter(food => {
        return selectedMealType === 'all' || food.mealType === selectedMealType;
    });

    // Splitting foods for horizontal and vertical display
    const featuredFoods = filteredFoods.slice(0, Math.min(filteredFoods.length, 5)); // Show up to 5 featured foods
    const otherFoods = filteredFoods.slice(featuredFoods.length); // The rest of the foods

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

    if (!chef || !chef.user) {
        return <div className="text-center py-5" style={{ backgroundColor: colors.lightBackground }}>Chef profile not found or data is incomplete.</div>;
    }

    return (
        <PageWrapper>
            <HeaderContainer>
                <div className="d-flex justify-content-between align-items-center container">
                    <div className="d-flex align-items-center gap-2">
                        <GiKenya className="header-icon" style={{ color: colors.secondary }} />
                        <h1 className="brand-title">
                            <span className="jikoni-red">Jikoni</span>
                            <span className="jikoni-green px-1">Express</span>
                        </h1>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                        {!state.isChefMode && !state.isRiderMode && (
                            <Button
                                variant="success"
                                className="header-btn"
                                style={{ backgroundColor: colors.secondary, border: 'none' }}
                                onClick={() => navigate('/rider-registration')} // Example navigation
                            >
                                <RiMotorbikeFill className="me-2" />
                                <span className="d-none d-md-inline">Rider</span>
                            </Button>
                        )}
                        <Button
                            className="header-btn position-relative text-white border-0"
                            style={{ backgroundColor: '#FFC107' }}
                            onClick={() => setState(s => ({ ...s, showCart: true }))}
                        >
                            <FaCartPlus className="me-2" />
                            <span className="d-none d-md-inline">Cart</span>
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill cart-badge">
                                {state.cart.reduce((sum, i) => sum + i.quantity, 0)}
                                <span className="visually-hidden">items in cart</span>
                            </span>
                        </Button>
                    </div>
                </div>
            </HeaderContainer>

            {/* Chef Profile Section (Image on top, text below) */}
            <ChefInfoSection>
                <div className="profile-picture-wrapper">
                    <img
                        src={chef.profilePictureUrl || 'https://placehold.co/140x140/FF4532/FFFFFF?text=Chef'}
                        alt={chef.user?.Name || 'Chef Profile'}
                        className="profile-picture-img"
                        onError={(e) => (e.target.src = 'https://placehold.co/140x140/FF4532/FFFFFF?text=Chef')}
                    />
                    <div className="badge-award">
                        <BsAwardFill />
                    </div>
                </div>

                <h1 className="chef-name">
                    {chef.user?.Name || 'Chef Name Not Available'}
                </h1>

                <div className="location-info">
                    <PinMapFill />
                    <span>{chef?.location || 'N/A'} • {chef.area || 'N/A'}</span>
                </div>

                <div className="opening-status">
                    <Clock style={{ color: colors.textMuted }} />
                    <span style={{ fontWeight: 600 }}>
                        {chef.openingHours || 'Hours not specified'}
                    </span>
                    {chef.openingHours && (
                        <Badge
                            bg={openingStatus.isOpen ? "success" : "danger"}
                            className="status-badge rounded-pill"
                        >
                            {openingStatus.isOpen ?
                                `Open${openingStatus.closingIn ? ` (Closes in ${openingStatus.closingIn})` : ''}` :
                                'Closed'}
                        </Badge>
                    )}
                </div>

                <div className="chef-badges">
                    <div className="info-badge">
                        <StarFill style={{ color: colors.starGold }} />
                        <span>PRO CHEF</span>
                    </div>
                    <div className="info-badge success">
                        <CheckCircleFill />
                        <span>VERIFIED</span>
                    </div>
                    <div className="info-badge accent">
                        <EggFried />
                        <span>{chef.cuisineType || 'Continental Cuisine'}</span>
                    </div>
                </div>

                <div className="chef-stats-container">
                    <div className="stat-item">
                        <div className="stat-value">{chef.views || 0}</div>
                        <div className="stat-label">Views</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{chef.likes || 0}</div>
                        <div className="stat-label">Likes</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{chef.experienceYears || 0}</div>
                        <div className="stat-label">Years Exp</div>
                    </div>
                </div>

                <div className="chef-action-buttons">
                    <Button
                        className="custom-btn custom-outline-btn"
                        onClick={() => setShowBioModal(true)}
                    >
                        <PersonLinesFill /> Full Bio
                    </Button>
                    <Button
                        className="custom-btn custom-solid-btn"
                        onClick={() => setShowHireModal(true)}
                    >
                        <CheckCircleFill /> Hire Chef
                    </Button>
                </div>
            </ChefInfoSection>

            {/* Main Content Area */}
            <div className="container py-5">
                <Row>
                    <Col lg={12}>
                        {/* Food Categories / Tabs */}
                        <FoodCategoriesContainer>
                            <Card.Body>
                                <div className="tabs-wrapper">
                                    <Tabs
                                        activeKey={selectedMealType}
                                        onSelect={(k) => setSelectedMealType(k)}
                                        className="mb-0 nav-tabs"
                                    >
                                        <Tab eventKey="all" title="All Meals" />
                                        <Tab eventKey="breakfast" title="Breakfast" />
                                        <Tab eventKey="lunch" title="Lunch" />
                                        <Tab eventKey="dinner" title="Dinner" />
                                        <Tab eventKey="dessert" title="Dessert" />
                                        <Tab eventKey="drinks" title="Drinks" />
                                    </Tabs>
                                </div>
                            </Card.Body>
                        </FoodCategoriesContainer>

                        {/* Featured Food Items - Horizontal Scroll */}
                        {featuredFoods.length > 0 && (
                            <>
                                <SectionHeading>Featured <span>{selectedMealType === 'all' ? 'Meals' : selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}</span></SectionHeading>
                                <FoodCarouselContainer>
                                    <div className="d-flex flex-row">
                                        {featuredFoods.map(food => (
                                            <FoodCardStyled key={food.id}>
                                                <Card.Img
                                                    variant="top"
                                                    src={food.photoUrls || 'https://placehold.co/280x180/F0F2F5/A0AEC0?text=Food+Image'}
                                                    alt={food.title}
                                                    onError={(e) => (e.target.src = 'https://placehold.co/280x180/F0F2F5/A0AEC0?text=Food+Image')}
                                                />
                                                <Card.Body>
                                                    <Card.Title className="food-title">{food.title}</Card.Title>
                                                    <Card.Text className="food-description">
                                                        {food.description} {/* Displaying full description */}
                                                    </Card.Text>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="price-tag">Ksh {food.price}</span>
                                                        <Button
                                                            className="add-to-cart-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateCart(food, 1);
                                                                Swal.fire({
                                                                    toast: true,
                                                                    position: 'top-end',
                                                                    showConfirmButton: false,
                                                                    timer: 1500,
                                                                    timerProgressBar: true,
                                                                    icon: 'success',
                                                                    title: `${food.title} added to cart!`,
                                                                });
                                                            }}
                                                        >
                                                            <FaCartPlus className="me-2" /> Add
                                                        </Button>
                                                    </div>
                                                    {/* Pre-order Button */}
                                                    <Button
                                                        className="pre-order-btn w-100 mt-2"
                                                        onClick={(e) => { e.stopPropagation(); handlePreOrder(food); }}
                                                    >
                                                        Pre-Order
                                                    </Button>
                                                </Card.Body>
                                            </FoodCardStyled>
                                        ))}
                                    </div>
                                </FoodCarouselContainer>
                                <HorizontalScrollIndicator>
                                    Scroll for more <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                                    </svg>
                                </HorizontalScrollIndicator>
                            </>
                        )}

                        {/* All Other Food Items - Vertical Grid */}
                        {otherFoods.length > 0 && (
                            <>
                                <SectionHeading className="mt-5">All <span>{selectedMealType === 'all' ? 'Meals' : selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}</span></SectionHeading>
                                <Row xs={1} md={2} lg={3} className="g-4">
                                    {otherFoods.map(food => (
                                        <Col key={food.id}>
                                            <FoodCardStyled>
                                                <Card.Img
                                                    variant="top"
                                                    src={food.photoUrls || 'https://placehold.co/280x180/F0F2F5/A0AEC0?text=Food+Image'}
                                                    alt={food.title}
                                                    onError={(e) => (e.target.src = 'https://placehold.co/280x180/F0F2F5/A0AEC0?text=Food+Image')}
                                                />
                                                <Card.Body>
                                                    <Card.Title className="food-title">{food.title}</Card.Title>
                                                    <Card.Text className="food-description">
                                                        {food.description} {/* Displaying full description */}
                                                    </Card.Text>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="price-tag">Ksh {food.price}</span>
                                                        <Button
                                                            className="add-to-cart-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateCart(food, 1);
                                                                Swal.fire({
                                                                    toast: true,
                                                                    position: 'top-end',
                                                                    showConfirmButton: false,
                                                                    timer: 1500,
                                                                    timerProgressBar: true,
                                                                    icon: 'success',
                                                                    title: `${food.title} added to cart!`,
                                                                });
                                                            }}
                                                        >
                                                            <FaCartPlus className="me-2" /> Add
                                                        </Button>
                                                    </div>
                                                    {/* Pre-order Button */}
                                                    <Button
                                                        className="pre-order-btn w-100 mt-2"
                                                        onClick={(e) => { e.stopPropagation(); handlePreOrder(food); }}
                                                    >
                                                        Pre-Order
                                                    </Button>
                                                </Card.Body>
                                            </FoodCardStyled>
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        )}
                        {filteredFoods.length === 0 && (
                            <div className="text-center w-100 p-5" style={{ color: colors.placeholderText }}>
                                <EggFried style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                                <p>No {selectedMealType === 'all' ? 'meals' : selectedMealType} available from this chef yet.</p>
                            </div>
                        )}
                    </Col>
                </Row>
            </div>

            {/* Cart Sidebar */}
            {state.showCart && (
                <CartSidebar
                    show={state.showCart}
                    handleClose={() => setState(s => ({ ...s, showCart: false }))}
                    cartItems={state.cart}
                    updateCart={updateCart}
                    handleCheckout={handleCheckout}
                />
            )}

            {/* Pre-Order Modal */}
            {selectedFood && (
                <PreOrderModal
                    show={showPreOrderModal}
                    handleClose={() => setShowPreOrderModal(false)}
                    food={selectedFood}
                    preOrderForm={preOrderForm}
                    setPreOrderForm={setPreOrderForm}
                    handleSubmit={handlePreOrderSubmit}
                />
            )}

            {/* Order Confirmation Modal */}
            {state.showOrderConfirmation && (
                <OrderConfirmation
                    show={state.showOrderConfirmation}
                    onHide={() => setState(s => ({ ...s, showOrderConfirmation: false }))}
                    cartItems={state.cart}
                    userLocation={state.userLocation}
                    locationError={state.locationError}
                    onConfirmOrder={handleConfirmOrder}
                />
            )}

            {/* Bio Modal */}
            <Modal show={showBioModal} onHide={() => setShowBioModal(false)} centered>
                <StyledModalHeader closeButton>
                    <Modal.Title>About {chef.user?.Name}</Modal.Title>
                </StyledModalHeader>
                <StyledModalBody>
                    <p>
                        {chef.bio || 'No detailed biography available yet.'}
                    </p>
                    <hr />
                    <p style={{ color: colors.darkText, fontWeight: '600' }}>
                        Specialty: <span style={{ color: colors.primary }}>{chef.speciality || 'Not specified'}</span>
                    </p>
                </StyledModalBody>
                <StyledModalFooter>
                    <Button variant="secondary" onClick={() => setShowBioModal(false)} className="rounded-pill">Close</Button>
                </StyledModalFooter>
            </Modal>

            {/* Hire Chef Modal */}
            <Modal show={showHireModal} onHide={() => setShowHireModal(false)} centered>
                <StyledModalHeader closeButton>
                    <Modal.Title>Hire {chef.user?.Name} for an Event</Modal.Title>
                </StyledModalHeader>
                <StyledModalBody>
                    <Form onSubmit={handleHireChef}>
                        <Form.Group className="mb-3" controlId="hireName">
                            <Form.Label>Your Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter your name"
                                value={hireForm.name}
                                onChange={(e) => setHireForm({ ...hireForm, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="hireEmail">
                            <Form.Label>Your Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={hireForm.email}
                                onChange={(e) => setHireForm({ ...hireForm, email: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="eventDate">
                            <Form.Label>Event Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={hireForm.eventDate}
                                onChange={(e) => setHireForm({ ...hireForm, eventDate: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="guests">
                            <Form.Label>Number of Guests</Form.Label>
                            <Form.Control
                                type="number"
                                value={hireForm.guests}
                                onChange={(e) => setHireForm({ ...hireForm, guests: parseInt(e.target.value) || 1 })}
                                min="1"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="message">
                            <Form.Label>Message (Optional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Tell us more about your event..."
                                value={hireForm.message}
                                onChange={(e) => setHireForm({ ...hireForm, message: e.target.value })}
                            />
                        </Form.Group>
                        <Button type="submit" className="modal-submit-btn w-100 mt-3">
                            Send Hire Request
                        </Button>
                    </Form>
                </StyledModalBody>
            </Modal>

        </PageWrapper>
    );
};

export default ChefProfile;
