import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
    MdInsights, MdPeopleOutline, MdNotificationsNone, MdHome, MdOutlineFastfood
} from 'react-icons/md';
import { RiMotorbikeLine } from 'react-icons/ri';
import { GiWineBottle, GiMeal } from 'react-icons/gi';
import { FaStore } from 'react-icons/fa';
import styled from 'styled-components'; // Removed unused 'css' import
import { useAuth } from './Context/authContext';
import { getUserNameFromToken, getUserIdFromToken } from './handler/tokenDecorder';

// Components
import LandingPage from './landingPage';
import Register from './components/auth/register';
import Login from './components/auth/login';
import FoodPlatform from './components/users/Foods/foods';
import ChefProfile from './components/users/Foods/chefProfile';
import Download from './components/downold/download';
import VerifyOtp from './components/auth/verify-OTP';
import SavedFoods from './components/saved/saved';
import ChefDashboard from './components/chefs/chefsdashboard';
import Liqour from './Liqour/liqour';
import LiqourProfile from './Liqour/liqourProfile';
import Board from './components/Rider/riderBoard';
import Logout from './components/auth/logout';
import ForgotPassword from './components/auth/forgotPassword';
import NotificationsPanel from '../src/components/chefs/orders/notificationPanel';
import UserOrderDetails from './components/cartAndOrder/userOrderDetails';
import AudioCall from './components/calls/audioCalls';
import VendorDashboard from './Liqour/vendorDashbord';

// Firebase
import { app, VAPID_KEY } from './utilities/firebaseUtilities';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// --- Styled Components ---
const AppContainer = styled.div`
    min-height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
`;

const MainContent = styled.main`
    flex-grow: 1;
    padding: 1rem 0rem;
    padding-bottom: 50px;
`;

const BottomNav = styled.nav`
    --jikoni-green: #00C853;

    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: #fcfcfc;
    display: flex;
    justify-content: space-around;
    padding: 0.3rem 0;
    padding-bottom: calc(0.3rem + 8px);
    border-top: 1px solid #f0f0f0;
    border-radius: 10px 10px 0 0;
    box-shadow:
        0 -3px 10px rgba(0, 0, 0, 0.05),
        inset 0 0.5px 0 rgba(255, 255, 255, 0.8);

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #FF4532 0%, var(--jikoni-green) 100%);
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
        z-index: 1;
    }

    a {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.1rem 0.3rem;
        padding-bottom: 0.2rem;
        color: #2C3E50;
        text-decoration: none;
        font-size: 0.65rem;
        font-weight: 800;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        flex-grow: 1;
        max-width: 90px;

        &:hover {
            color: #FF4532;
            transform: translateY(-1px);

            svg {
                transform: scale(1.08);
                color: #FF4532;
            }
        }

        &.active {
            color: var(--jikoni-green);
            font-weight: 900;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 50%;
                height: 1.8px;
                background: linear-gradient(90deg, #FF4532 0%, var(--jikoni-green) 100%);
                border-radius: 1px;
                box-shadow: 0 0.5px 2px rgba(0, 0, 0, 0.15);
            }

            svg {
                color: var(--jikoni-green);
                transform: scale(1.03);
                filter: drop-shadow(0 0.5px 2px rgba(0, 0, 0, 0.1));
            }
        }

        svg {
            font-size: 1.5rem;
            margin-bottom: 0.1rem;
            color:rgb(0, 0, 0);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
    }

    @media (max-width: 480px) {
        padding: 0.2rem 0;
        padding-bottom: calc(0.2rem + 8px);
        border-radius: 8px 8px 0 0;

        a {
            padding: 0.1rem;
            padding-bottom: 0.1rem;
            font-size: 0.6rem;

            svg {
                font-size: 1.2rem;
                font-weight: 700;
            }
        }
    }
`;

const NotificationBell = styled(NavLink)`
    position: relative;

    .notification-badge {
        position: absolute;
        top: 0px;
        right: 0px;
        background-color: var(--jikoni-green);
        color: white;
        border-radius: 50%;
        padding: 1px 4px;
        font-size: 0.55em;
        font-weight: bold;
        line-height: 1;
        transform: translate(50%, -50%);
        z-index: 1001;
        min-width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
`;

function App() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [username, setUsername] = useState('');
    const [isChefMode, setIsChefMode] = useState(false);
    const [isRiderMode, setIsRiderMode] = useState(false);
    const [isVendorMode, setIsVendorMode] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [fcmToken, setFcmToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState(null);

    const messaging = getMessaging(app);

    // Register service worker for mobile
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/firebase-messaging-sw.js')
                .then(reg => {
                    console.log('Service Worker registered:', reg);
                })
                .catch(err => {
                    console.error('Service Worker registration failed:', err);
                });
        }
    }, []);

    // FCM Initialization & Token Handling
    useEffect(() => {
        const initializeFCM = async () => {
            try {
                console.log("Initializing FCM...");

                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.warn("Notification permission not granted");
                    return;
                }

                try {
                    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
                    if (token) {
                        console.log("Initial FCM token received:", token);
                        setFcmToken(token);
                    }
                } catch (tokenError) {
                    console.error("Error getting FCM token:", tokenError);
                    setError(`FCM Token Error: ${tokenError.message}`);
                }

                const unsubscribeOnMessage = onMessage(messaging, (payload) => {
                    console.log('Foreground push notification received:', payload);
                    // Play IN-APP sound for foreground messages
                    try {
                        const audio = new Audio('/sounds/notification.mp3'); // Ensure this path is correct
                        audio.play().catch(e => console.error('Failed to play foreground sound:', e));
                    } catch (audioError) {
                        console.error('Error creating or playing audio in foreground:', audioError);
                    }
                    // DO NOT call new Notification() here. The service worker handles that.
                });

                return () => {
                    unsubscribeOnMessage();
                };
            } catch (error) {
                console.error("FCM initialization failed:", error);
                setError(`FCM Init Error: ${error.message}`);
            }
        };

        initializeFCM();
    }, [messaging]);

    // User ID handling with token change detection
    useEffect(() => {
        const updateUserId = () => {
            const id = getUserIdFromToken();
            if (id) {
                setUserId(id);
                console.log("User ID retrieved from token:", id);
            } else {
                console.log("No User ID found in token.");
                setUserId(null);
            }
        };

        updateUserId();

        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                updateUserId();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Token sync with retry mechanism
    useEffect(() => {
        if (!userId || !fcmToken) return;

        const syncTokenToBackend = async (retryCount = 0) => {
            try {
                console.log(`Syncing token to backend for userId: ${userId}, attempt: ${retryCount + 1}`);
                
                const response = await fetch(`https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/user/${userId}/fcm-token`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: fcmToken }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Failed to save device token: ${errorData.message || response.statusText}`);
                }

                console.log('✅ Device token saved successfully');
            } catch (err) {
                console.error('❌ Error saving token to backend:', err.message);
                setError(`Token Sync Error: ${err.message}`);

                if (retryCount < 5) {
                    const delay = Math.pow(2, retryCount) * 1000;
                    console.log(`Retrying in ${delay}ms...`);
                    setTimeout(() => syncTokenToBackend(retryCount + 1), delay);
                } else {
                    console.error('Max retries reached for token sync. Token might not be synced.');
                }
            }
        };

        syncTokenToBackend();
    }, [userId, fcmToken]);

    // User role handling - REVERTED TO PREVIOUS LOGIC FOR LOCALSTORAGE CLEARING
    useEffect(() => {
        const userData = getUserNameFromToken();
        const path = window.location.pathname;

        if (userData) {
            setUsername(userData.name);

            if (userData.isChef) {
                setIsChefMode(true);
                setIsRiderMode(false);
                setIsVendorMode(false);
                // Only redirect if not already on the chef dashboard
                if (path !== '/chef/dashboard') {
                    navigate('/chef/dashboard');
                }
            } else if (userData.isRider) {
                setIsRiderMode(true);
                setIsChefMode(false);
                setIsVendorMode(false);
                // Only redirect if not already on the rider dashboard
                if (path !== '/rider/dashboard') {
                    navigate('/rider/dashboard');
                }
            } else if (userData.isVendor) {
                setIsVendorMode(true);
                setIsChefMode(false);
                setIsRiderMode(false);
                // Only redirect if not already on the vendor dashboard
                if (path !== '/vendor/dashboard') {
                    navigate('/vendor/dashboard');
                }
            } else {
                // User is logged in but has no specific role
                setIsChefMode(false);
                setIsRiderMode(false);
                setIsVendorMode(false);
            }
            // IMPORTANT: Only clear localStorage for roles IF THE USER IS LOGGED IN 
            // AND the specific role is NOT present in their userData.
            // This ensures we don't clear valid role flags when they exist.
            if (!userData.isChef) localStorage.removeItem('isChef');
            if (!userData.isRider) localStorage.removeItem('isRider');
            if (!userData.isVendor) localStorage.removeItem('isVendor');

        } else {
            // User is not logged in, clear all role-related states and localStorage
            setUsername('');
            setIsChefMode(false);
            setIsRiderMode(false);
            setIsVendorMode(false);
            localStorage.removeItem('isChef');
            localStorage.removeItem('isRider');
            localStorage.removeItem('isVendor');
        }
    }, [navigate]); // navigate is a dependency as it's used inside

    // Handle user logout
    const handleLogout = useCallback(() => {
        console.log("Logging out...");
        logout(); // Call the logout function from auth context
        setFcmToken(null); // Clear FCM token state
        setUserId(null); // Clear user ID state
        setIsChefMode(false); // Reset role states
        setIsRiderMode(false);
        setIsVendorMode(false);
        // Clear specific role flags from localStorage upon explicit logout
        localStorage.removeItem('isChef');
        localStorage.removeItem('isRider');
        localStorage.removeItem('isVendor');
        navigate('/login'); // Redirect to login page
    }, [logout, navigate]);

    return (
        <AppContainer>
            <MainContent>
                {/* Display any general error messages */}
                {error && <div style={{ color: 'red', textAlign: 'center', padding: '10px' }}>Error: {error}</div>}

                {/* React Router Routes */}
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-otp" element={<VerifyOtp />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
                    <Route path="/audio/calls" element={<AudioCall />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/jikoni-express/liqour-shots" element={<Liqour />} />
                    <Route path="/culture/foods" element={<FoodPlatform />} />
                    <Route path="/chef/:id" element={<ChefProfile />} />
                    <Route path="/liqour/:id" element={<LiqourProfile />} />
                    <Route path="/jikoni/express/download" element={<Download />} />
                    <Route path="/saved/foods" element={<SavedFoods />} />
                    <Route path="/user/order-details/:orderId" element={<UserOrderDetails />} />
                    <Route path="/user/order-details" element={<UserOrderDetails />} />
                    <Route path="/rider/dashboard" element={<Board />} />
                    <Route path="/chef/dashboard" element={<ChefDashboard setIsChefMode={setIsChefMode} />} />
                    <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                </Routes>
            </MainContent>

            {/* Bottom Navigation */}
            <BottomNav>
                {isChefMode ? (
                    <>
                        <NavLink to="/chef/dashboard#analytics">
                            <MdInsights /> Analytics
                        </NavLink>
                        <NavLink to="/chef/dashboard#riders">
                            <MdPeopleOutline /> Riders
                        </NavLink>
                        <NavLink to="/chef/dashboard">
                            <GiMeal /> Menu
                        </NavLink>
                        <NotificationBell as="div" onClick={() => setShowNotifications(!showNotifications)}>
                            <MdNotificationsNone /> Alerts
                            {/* Placeholder for actual notification count */}
                            {true && <span className="notification-badge">3</span>} 
                        </NotificationBell>
                    </>
                ) : isRiderMode ? (
                    <>
                        <NavLink to="/rider/dashboard">
                            <RiMotorbikeLine /> Deliveries
                        </NavLink>
                        <NotificationBell as="div" onClick={() => setShowNotifications(!showNotifications)}>
                            <MdNotificationsNone /> Alerts
                            {/* Placeholder for actual notification count */}
                            {true && <span className="notification-badge">1</span>}
                        </NotificationBell>
                    </>
                ) : isVendorMode ? (
                    <>
                        <NavLink to="/vendor/dashboard">
                            <FaStore /> Dashboard
                        </NavLink>
                        <NotificationBell as="div" onClick={() => setShowNotifications(!showNotifications)}>
                            <MdNotificationsNone /> Alerts
                            {/* Placeholder for actual notification count */}
                            {true && <span className="notification-badge">2</span>}
                        </NotificationBell>
                    </>
                ) : (
                    <>
                        <NavLink to="/">
                            <MdHome style={{ color: 'red' }} /> Home
                        </NavLink>
                        <NavLink to="/jikoni/express/download">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 13v8l-4-4"/><path d="m12 21 4-4"/><path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284"/></svg> Get App
                        </NavLink>
                        <NavLink to="/saved/foods" className="nav-link" style={{ color: '#FF4532', fontWeight: '800', fontSize: '0.85rem' }}>
                            Saved
                            <svg className="arrow-animate" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </NavLink>
                        <NavLink to="/jikoni-express/liqour-shots">
                            <GiWineBottle /> Liquor
                        </NavLink>
                        <NavLink to="/culture/foods">
                            <MdOutlineFastfood style={{ color: 'red' }} /> Foods
                        </NavLink>
                    </>
                )}
            </BottomNav>

            {/* Notifications Panel */}
            {showNotifications && (
                <NotificationsPanel onClose={() => setShowNotifications(false)} />
            )}
        </AppContainer>
    );
}

export default App;