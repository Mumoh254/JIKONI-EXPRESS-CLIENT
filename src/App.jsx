import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
    MdInsights, MdPeopleOutline, MdNotificationsNone, MdHome, MdOutlineFastfood
} from 'react-icons/md';
import { RiMotorbikeLine } from 'react-icons/ri';
import { GiWineBottle, GiMeal } from 'react-icons/gi';
import { FaStore } from 'react-icons/fa'; // Icon for Vendor Dashboard
import styled, { css } from 'styled-components';
import { useAuth } from './Context/authContext';
import { getUserNameFromToken, getUserIdFromToken } from './handler/tokenDecorder';

// Import all your components
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
import VendorDashboard from './Liqour/vendorDashbord'; // Import the VendorDashboard component

// Firebase imports - Import 'app' and 'VAPID_KEY' from your firebaseUtilities
import { app, VAPID_KEY } from './utilities/firebaseUtilities';
// Import specific messaging functions directly from 'firebase/messaging'
import { getMessaging, getToken, onMessage } from "firebase/messaging";


// --- Styled Components (UI remains intact) ---
const AppContainer = styled.div`
    min-height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
`;

const MainContent = styled.main`
    flex-grow: 1;
    padding: 1rem 0rem;
    padding-bottom: 50px; /* Ensure content is above bottom nav */
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
    padding-bottom: calc(0.3rem + 8px); /* Adjust for notch/safe area */
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

// --- Main App Component ---
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
    // Removed fcmTokenSynced state as it's no longer needed for token sending logic

    // Initialize Firebase Messaging instance directly in App.jsx
    const messaging = getMessaging(app);

    // 1. FCM Initialization & Token Handling (Consolidated)
    useEffect(() => {
        const initializeFCM = async () => {
            try {
                console.log("Initializing FCM...");

                // Check notification permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.warn("Notification permission not granted");
                    return;
                }

                // Get initial token
                try {
                    const token = await getToken(messaging, {
                        vapidKey: VAPID_KEY // Use the imported VAPID_KEY
                    });
                    if (token) {
                        console.log("Initial FCM token received:", token);
                        setFcmToken(token);
                        // No need to set fcmTokenSynced(false) here, as that state is removed
                    }
                } catch (tokenError) {
                    console.error("Error getting FCM token:", tokenError);
                    setError(`FCM Token Error: ${tokenError.message}`);
                }

                // Listen for foreground messages
                const unsubscribeOnMessage = onMessage(messaging, (payload) => {
                    console.log('Foreground push notification received:', payload);
                    // Using alert for demonstration, consider a custom modal or toast
                    alert(`New Notification: ${payload.notification.title || 'Notification'} - ${payload.notification.body || ''}`);
                });

                return () => {
                    unsubscribeOnMessage(); // Cleanup the onMessage listener
                };
            } catch (error) {
                console.error("FCM initialization failed:", error);
                setError(`FCM Init Error: ${error.message}`);
            }
        };

        initializeFCM();
    }, [messaging]); // Dependency on 'messaging' instance


    // 2. Extract userId from token on mount or token change
    useEffect(() => {
        const id = getUserIdFromToken();
        if (id) {
            setUserId(id);
            console.log("User ID retrieved from token:", id);
        } else {
            console.log("No User ID found in token.");
            setUserId(null); // Clear userId if no token or invalid
        }
    }, []); // Runs once on mount


    // 3. Sync FCM token to backend when userId and fcmToken are available
    // This effect now simply sends the token if both are available,
    // relying on the backend to handle old/duplicate tokens as specified.
    useEffect(() => {
        if (userId && fcmToken) {
            console.log("Attempting to sync token to backend for userId:", userId, "and fcmToken:", fcmToken);

            const syncTokenToBackend = async () => {
                try {
                    const response = await fetch(`https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/user/${userId}/fcm-token`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            // You might need an Authorization header here if your API is protected
                            // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({ token: fcmToken }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Failed to save device token: ${response.status} - ${errorData.message || response.statusText}`);
                    }

                    console.log('✅ Device token saved successfully');
                } catch (err) {
                    console.error('❌ Error saving token to backend:', err.message);
                    setError(`Token Sync Error: ${err.message}`);
                    // The error is set, and the effect will re-run if dependencies change,
                    // automatically retrying the sync if the error was transient
                }
            };

            syncTokenToBackend();
        } else {
            console.log("Waiting for userId and fcmToken to be available before syncing.");
        }
    }, [userId, fcmToken]); // Dependencies control when this effect re-runs


    // 4. Determine user roles from token and handle initial redirects
    useEffect(() => {
        const userData = getUserNameFromToken();
        let shouldRedirect = false;

        if (userData) {
            setUsername(userData.name);

            if (userData.isChef) {
                setIsChefMode(true);
                setIsRiderMode(false);
                setIsVendorMode(false);
                console.log("User is in Chef Mode.");
                if (window.location.pathname !== '/chef/dashboard') {
                    shouldRedirect = true;
                    navigate('/chef/dashboard');
                }
            } else if (userData.isRider) {
                setIsRiderMode(true);
                setIsChefMode(false);
                setIsVendorMode(false);
                console.log("User is in Rider Mode.");
                if (window.location.pathname !== '/rider/dashboard') {
                    shouldRedirect = true;
                    navigate('/rider/dashboard');
                }
            } else if (userData.isVendor) {
                setIsVendorMode(true);
                setIsChefMode(false);
                setIsRiderMode(false);
                console.log("User is in Vendor Mode.");
                if (window.location.pathname !== '/vendor/dashboard') {
                    shouldRedirect = true;
                    navigate('/vendor/dashboard');
                }
            } else {
                // If user is logged in but not a specific role, ensure modes are false
                setIsChefMode(false);
                setIsRiderMode(false);
                setIsVendorMode(false);
            }
        } else {
            // User is not logged in or token is invalid
            setUsername('');
            setIsChefMode(false);
            setIsRiderMode(false);
            setIsVendorMode(false);
            console.log("No user data found in token or user logged out.");
            // Optionally redirect to login if no token and not on public routes
            const publicRoutes = ['/', '/register', '/verify-otp', '/login', '/forgot-password', '/jikoni/express/download'];
            if (!publicRoutes.includes(window.location.pathname)) {
                // navigate('/login'); // Uncomment if you want to force login for unauthenticated users on non-public routes
            }
        }

        // Clean up localStorage flags if user is not in that role anymore (important after logout)
        if (!userData || !userData.isChef) localStorage.removeItem('isChef');
        if (!userData || !userData.isRider) localStorage.removeItem('isRider');
        if (!userData || !userData.isVendor) localStorage.removeItem('isVendor');

    }, [navigate]); // Re-run when navigate function changes (unlikely) or if you want to tie it to an auth state change

    // This effect can be removed if the above consolidated effect handles all role-based redirects.
    // Keeping it here for now if you explicitly rely on localStorage for initial redirect as a fallback
    // but the above is preferred.
    useEffect(() => {
        const isChefLocal = localStorage.getItem('isChef') === 'true';
        const isRiderLocal = localStorage.getItem('isRider') === 'true';
        const isVendorLocal = localStorage.getItem('isVendor') === 'true';

        // Only redirect if current mode is not set AND localStorage suggests it should be
        if (isChefLocal && !isChefMode && window.location.pathname !== '/chef/dashboard') {
            setIsChefMode(true);
            navigate('/chef/dashboard');
            console.log("Redirecting to Chef Dashboard based on local storage (fallback).");
        } else if (isRiderLocal && !isRiderMode && window.location.pathname !== '/rider/dashboard') {
            setIsRiderMode(true);
            navigate('/rider/dashboard');
            console.log("Redirecting to Rider Dashboard based on local storage (fallback).");
        } else if (isVendorLocal && !isVendorMode && window.location.pathname !== '/vendor/dashboard') {
            setIsVendorMode(true);
            navigate('/vendor/dashboard');
            console.log("Redirecting to Vendor Dashboard based on local storage (fallback).");
        }
    }, [navigate, isChefMode, isRiderMode, isVendorMode]);


    const handleLogout = useCallback(() => {
        console.log("Logging out...");
        logout();
        // Reset FCM token states on logout to force re-registration for the next login
        setFcmToken(null);
        // Removed setFcmTokenSynced as that state is removed
        setUserId(null); // Clear userId on logout
        setIsChefMode(false);
        setIsRiderMode(false);
        setIsVendorMode(false);
        localStorage.removeItem('isChef'); // Explicitly clear local storage flags
        localStorage.removeItem('isRider');
        localStorage.removeItem('isVendor');
        navigate('/login');
    }, [logout, navigate]);


    return (
        <AppContainer>
            <MainContent>
                {/* Display any global errors (e.g., FCM issues) */}
                {error && <div style={{ color: 'red', textAlign: 'center', padding: '10px' }}>Error: {error}</div>}

                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-otp" element={<VerifyOtp />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout onLogout={handleLogout} />} /> {/* Pass handleLogout */}
                    <Route path="/audio/calls" element={<AudioCall />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/jikoni-express/liqour-shots" element={<Liqour />} />
                    <Route path="/culture/foods" element={<FoodPlatform />} />
                    <Route path="/chef/:id" element={<ChefProfile />} />
                    <Route path="/liqour/:id" element={<LiqourProfile />} />
                    <Route path="/jikoni/express/download" element={<Download />} />
                    <Route path="/saved/foods" element={<SavedFoods />} />
                    <Route path="/user/order-details/:orderId" element={<UserOrderDetails />} />
                    <Route path="/user/order-details" element={<UserOrderDetails />} /> {/* This might be a generic order list */}
                    <Route path="/rider/dashboard" element={<Board />} />
                    {/* Pass setIsChefMode to ChefDashboard if it needs to update the parent's state */}
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
                        {/* NotificationBell as="div" means it won't navigate but will trigger the onClick */}
                        <NotificationBell as="div" onClick={() => setShowNotifications(!showNotifications)}>
                            <MdNotificationsNone /> Alerts
                            {/* Replace 'true' with an actual notification count check */}
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
                            {true && <span className="notification-badge">2</span>}
                        </NotificationBell>
                    </>
                ) : (
                    <>
                        <NavLink to="/">
                            <MdHome style={{ color: 'red' }} /> Home
                        </NavLink>

                        <NavLink to="/jikoni/express/download">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-download-icon lucide-cloud-download"><path d="M12 13v8l-4-4"/><path d="m12 21 4-4"/><path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284"/></svg> Get App
                        </NavLink>
                        <NavLink
                            to="/saved/foods"
                            className="nav-link"
                            style={{
                                color: '#FF4532',
                                fontWeight: '800',
                                fontSize: '0.85rem'
                            }}
                        >
                            Saved
                            <svg
                                className="arrow-animate"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#00C853"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ marginLeft: '4px' }}
                            >
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

            {showNotifications && (
                <NotificationsPanel onClose={() => setShowNotifications(false)} />
            )}
        </AppContainer>
    );
}

export default App;
