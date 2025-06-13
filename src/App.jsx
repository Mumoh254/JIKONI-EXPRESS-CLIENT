import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
    MdOutlineDownloadForOffline, MdFavoriteBorder, MdInsights, MdPeopleOutline, MdNotificationsNone, MdHome, MdOutlineFastfood
} from 'react-icons/md';
import { RiUserAddLine, RiMotorbikeLine } from 'react-icons/ri';
import { GiWineBottle, GiMeal } from 'react-icons/gi';
import styled, { css } from 'styled-components';
import { useAuth } from './Context/authContext';
import { getUserNameFromToken } from './handler/tokenDecorder';
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


const AppContainer = styled.div`
    min-height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
`;

const MainContent = styled.main`
    flex-grow: 1;
    /* Adjust padding-bottom to account for the total height of the BottomNav + integrated strip */
    /* Estimate: Nav content height + 8px strip height. A safe ~50px */
    padding-bottom: 50px;
`;

const BottomNav = styled.nav`
    // Define Jikoni Green as a CSS variable for consistency
    --jikoni-green: #00C853; // A vibrant green for Jikoni Express

    position: fixed;
    bottom: 0; /* Now perfectly aligned to the bottom of the viewport */
    left: 0;
    right: 0;
    z-index: 1000; /* Ensure it stays above main content */
    background: #fcfcfc; /* Even lighter background for a very sleek look */
    display: flex;
    justify-content: space-around;
    /* Main padding for the navigation items */
    padding: 0.3rem 0;
    /* Add extra padding at the bottom to create space for the integrated strip */
    padding-bottom: calc(0.3rem + 8px); /* 0.3rem for content padding + 8px for the strip */
    border-top: 1px solid #f0f0f0; /* Very light border */
    border-radius: 10px 10px 0 0; /* Slightly smaller border radius */
    box-shadow:
        0 -3px 10px rgba(0, 0, 0, 0.05), /* Very soft and small shadow */
        inset 0 0.5px 0 rgba(255, 255, 255, 0.8); /* Subtle inner highlight */

    /* The Jikoni Strip itself, now integrated as a pseudo-element */
    &::after {
        content: '';
        position: absolute;
        bottom: 3px; /* Sticks to the very bottom edge of the BottomNav */
        left: 0;
        right: 0;
        height: 2px; /* The height of the branding strip */
        background: linear-gradient(90deg, #FF4532 0%, var(--jikoni-green) 100%); /* Red to Green gradient */
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.2); /* Subtle inner shadow for depth */
        z-index: 1; /* Keep it below the NavLink content, but above the nav's background */
    }

    a {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.2rem 0.3rem; /* Padding for individual navigation links */
        /* Ensure bottom padding doesn't interfere with the strip */
        padding-bottom: 0.2rem; /* Consistent padding above the strip */

        color: #7b8591; /* Default icon/text color */
        text-decoration: none;
        font-size: 0.65rem;
        font-weight: 500;
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
            color: var(--jikoni-green); /* Active text color is Jikoni Green */
            font-weight: 700;

            /* The active indicator underline */
            &::after {
                content: '';
                position: absolute;
                bottom: 18px; /* Positioned precisely above the Jikoni strip */
                left: 50%;
                transform: translateX(-50%);
                width: 50%;
                height: 1.5px;
                background: linear-gradient(90deg, #FF4532 0%, var(--jikoni-green) 100%);
                border-radius: 1px;
                box-shadow: 0 0.5px 2px rgba(0, 0, 0, 0.15);
            }

            svg {
                color: var(--jikoni-green); /* Active icon color is Jikoni Green */
                transform: scale(1.03);
                filter: drop-shadow(0 0.5px 2px rgba(0, 0, 0, 0.1));
            }
        }

        svg {
            font-size: 1.1rem;
            margin-bottom: 0.1rem;
            color: #9eaab6; /* Default icon color */
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
    }

    @media (max-width: 480px) {
        padding: 0.2rem 0;
        padding-bottom: calc(0.2rem + 8px); /* Adjust for mobile for the strip */
        border-radius: 8px 8px 0 0;

        a {
            padding: 0.1rem;
            padding-bottom: 0.1rem; /* Adjust for mobile */
            font-size: 0.6rem;

            svg {
                font-size: 1rem;
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
        background-color: var(--jikoni-green); /* Use Jikoni Green for badge */
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
    const { user, logout } = useAuth();

    const [username, setUsername] = useState('');
    const [isChefMode, setIsChefMode] = useState(false);
    const [isRiderMode, setIsRiderMode] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);


    useEffect(() => {
        const userData = getUserNameFromToken();
        if (userData) {
            setUsername(userData.name);
            if (userData.isChef) {
                setIsChefMode(true);
            }
        }
    }, []);

    useEffect(() => {
        const isChefLocal = localStorage.getItem('isChef');
        const isRiderLocal = localStorage.getItem('isRider');

        if (isChefLocal === 'true' && !isChefMode) {
            setIsChefMode(true);
            navigate('/chef/dashboard');
        } else if (isRiderLocal === 'true' && !isRiderMode) {
            setIsRiderMode(true);
            navigate('/rider/dashboard');
        }
    }, [navigate, isChefMode, isRiderMode]);

    const handleLogout = () => {
        logout();
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
                ) : (
                    <>
                        <NavLink to="/">
                            <MdHome /> Home
                        </NavLink>
                        <NavLink to="/jikoni/express/download">
                            <MdOutlineDownloadForOffline /> Get App
                        </NavLink>
                        <NavLink to="/saved/foods">
                            <MdFavoriteBorder /> Saved
                        </NavLink>
                        <NavLink to="/jikoni-express/liqour-shots">
                            <GiWineBottle /> Liquor
                        </NavLink>
                        <NavLink to="/culture/foods">
                            <MdOutlineFastfood /> Foods
                        </NavLink>
                    </>
                )}
            </BottomNav>

            {/* The JikoniStrip component is now integrated into BottomNav and removed from here */}

            {showNotifications && (
                <NotificationsPanel onClose={() => setShowNotifications(false)} />
            )}
        </AppContainer>
    );
}

export default App;