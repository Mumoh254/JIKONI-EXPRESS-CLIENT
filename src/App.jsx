import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
    MdOutlineDownloadForOffline, MdFavoriteBorder, MdInsights, MdPeopleOutline, MdNotificationsNone, MdHome, MdOutlineFastfood
} from 'react-icons/md';
import { RiUserAddLine, RiMotorbikeLine } from 'react-icons/ri';
import { GiWineBottle, GiMeal } from 'react-icons/gi';
import { FaStore } from 'react-icons/fa'; // Icon for Vendor Dashboard
import styled, { css } from 'styled-components';
import { useAuth } from './Context/authContext';
import { getUserNameFromToken, getUserIdFromToken } from './handler/tokenDecorder';
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
import { requestFCMToken } from './utilities/firebaseUtilities'; // Ensure this utility function exists

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
    // New state to track if FCM token has been successfully synced to the backend
    const [fcmTokenSynced, setFcmTokenSynced] = useState(false);

    // Log userId on component render (initial and updates)
    console.log("Current User ID in App component:", userId);

    useEffect(() => {
        const id = getUserIdFromToken();
        if (id) {
            setUserId(id);
            console.log("User ID retrieved from token:", id);
        } else {
            console.log("No User ID found in token.");
        }
    }, []);

    // Request FCM token from Firebase
    useEffect(() => {
        // Only attempt to fetch FCM token if we haven't already successfully done so
        if (!fcmToken) {
            const fetchFCMToken = async () => {
                try {
                    console.log("Attempting to request FCM token...");
                    const token = await requestFCMToken(); // This function should be defined in firebaseUtilities.js
                    setFcmToken(token);
                    console.log("FCM Token successfully retrieved:", token);
                } catch (err) {
                    console.error("Error requesting FCM token:", err.message);
                    setError(err.message);
                }
            };
            fetchFCMToken();
        } else {
            console.log("FCM Token already exists. Skipping request.");
        }
    }, [fcmToken]); // Re-run if fcmToken becomes null (e.g., on logout or error)

    // Once both userId and fcmToken are available AND not yet synced, send to backend
    useEffect(() => {
        if (userId && fcmToken && !fcmTokenSynced) {
            console.log("Attempting to sync token to backend with userId:", userId, "and fcmToken:", fcmToken);

            const syncTokenToBackend = async () => {
                try {
                    const response = await fetch(`https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/user/${userId}/fcm-token`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: fcmToken }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json(); // Try to parse error response
                        throw new Error(`Failed to save device token: ${response.status} - ${errorData.message || response.statusText}`);
                    }

                    console.log('✅ Device token saved successfully');
                    setFcmTokenSynced(true); // Mark as synced after successful save
                } catch (err) {
                    console.error('❌ Error saving token to backend:', err.message);
                    setError(err.message);
                    // Do NOT set fcmTokenSynced to true on error, so it retries
                }
            };

            syncTokenToBackend();
        } else if (fcmTokenSynced) {
            console.log("FCM Token already synced to backend. Skipping.");
        } else {
            console.log("Waiting for userId and fcmToken to be available before syncing.");
        }
    }, [userId, fcmToken, fcmTokenSynced]); // Dependencies to re-run this effect

    useEffect(() => {
        const userData = getUserNameFromToken();
        if (userData) {
            setUsername(userData.name);
            if (userData.isChef) {
                setIsChefMode(true);
                console.log("User is in Chef Mode.");
            }
            if (userData.isVendor) {
                setIsVendorMode(true);
                console.log("User is in Vendor Mode.");
            }
        } else {
            console.log("No user data found in token.");
        }
    }, []);

    useEffect(() => {
        const isChefLocal = localStorage.getItem('isChef');
        const isRiderLocal = localStorage.getItem('isRider');
        const isVendorLocal = localStorage.getItem('isVendor');

        if (isChefLocal === 'true' && !isChefMode) {
            setIsChefMode(true);
            navigate('/chef/dashboard');
            console.log("Redirecting to Chef Dashboard based on local storage.");
        } else if (isRiderLocal === 'true' && !isRiderMode) {
            setIsRiderMode(true);
            navigate('/rider/dashboard');
            console.log("Redirecting to Rider Dashboard based on local storage.");
        } else if (isVendorLocal === 'true' && !isVendorMode) {
            setIsVendorMode(true);
            navigate('/vendor/dashboard');
            console.log("Redirecting to Vendor Dashboard based on local storage.");
        }
    }, [navigate, isChefMode, isRiderMode, isVendorMode]);

    const handleLogout = () => {
        console.log("Logging out...");
        logout();
        // Reset FCM token state on logout so it re-registers for the new user (or next login)
        setFcmToken(null);
        setFcmTokenSynced(false);
        navigate('/login');
    };


    return (
        <AppContainer>
            <MainContent>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-otp" element={<VerifyOtp />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
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