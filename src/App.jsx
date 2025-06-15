import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import {
    MdOutlineDownloadForOffline, MdFavoriteBorder, MdInsights, MdPeopleOutline, MdNotificationsNone, MdHome, MdOutlineFastfood
} from 'react-icons/md';
import { RiMotorbikeLine } from 'react-icons/ri';
import { GiWineBottle, GiMeal } from 'react-icons/gi';
import { FaStore } from 'react-icons/fa';
import styled from 'styled-components';

import { useAuth } from './Context/authContext';
import { getUserNameFromToken } from './handler/tokenDecorder';
import { requestFCMToken } from './utilities/firebaseUtilities';

// Pages and components
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
import NotificationsPanel from './components/chefs/orders/notificationPanel';
import UserOrderDetails from './components/cartAndOrder/userOrderDetails';
import AudioCall from './components/calls/audioCalls';
import VendorDashboard from './Liqour/vendorDashbord';

const AppContainer = styled.div`min-height: 100vh; display: flex; flex-direction: column;`;
const MainContent = styled.main`flex-grow: 1; padding: 1rem 0rem; padding-bottom: 50px;`;
const BottomNav = styled.nav`
  --jikoni-green: #00C853;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 1000;
  background: #fcfcfc;
  display: flex; justify-content: space-around;
  padding: 0.3rem 0;
  border-top: 1px solid #f0f0f0;
  border-radius: 10px 10px 0 0;
`;

const NotificationBell = styled(NavLink)`
  position: relative;
  .notification-badge {
    position: absolute;
    top: 0px; right: 0px;
    background-color: var(--jikoni-green);
    color: white;
    border-radius: 50%;
    padding: 1px 4px;
    font-size: 0.55em;
    min-width: 16px; height: 16px;
    display: flex; align-items: center; justify-content: center;
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

  // Step 1: Decode user token to get ID
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
  }, []);

  // Step 2: Request FCM token from Firebase
  useEffect(() => {
    const fetchFCMToken = async () => {
      try {
        const token = await requestFCMToken();
        setFcmToken(token);
      } catch (error) {
        console.error("FCM Token Error:", error);
      }
    };
    fetchFCMToken();
  }, []);

  // Step 3: Send token + userId to backend
  useEffect(() => {
    const sendTokenToBackend = async () => {
      if (!userId || !fcmToken) return;
      try {
        await axios.put(
          `https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/user/${userId}/fcm-token`,
          { token: fcmToken },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log('FCM token saved.');
      } catch (err) {
        console.error('Failed to save token:', err.message);
      }
    };
    sendTokenToBackend();
  }, [userId, fcmToken]);

  // Handle role redirection
  useEffect(() => {
    const userData = getUserNameFromToken();
    if (userData) {
      setUsername(userData.name);
      if (userData.isChef) setIsChefMode(true);
      if (userData.isVendor) setIsVendorMode(true);
    }

    const isChefLocal = localStorage.getItem('isChef');
    const isRiderLocal = localStorage.getItem('isRider');
    const isVendorLocal = localStorage.getItem('isVendor');

    if (isChefLocal === 'true') {
      setIsChefMode(true);
      navigate('/chef/dashboard');
    } else if (isRiderLocal === 'true') {
      setIsRiderMode(true);
      navigate('/rider/dashboard');
    } else if (isVendorLocal === 'true') {
      setIsVendorMode(true);
      navigate('/vendor/dashboard');
    }
  }, [navigate]);

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
          <Route path="/rider/dashboard" element={<Board />} />
          <Route path="/chef/dashboard" element={<ChefDashboard />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        </Routes>
      </MainContent>

      <BottomNav>
        {/* Simplified bottom nav for brevity */}
        <NavLink to="/"><MdHome /> Home</NavLink>
        <NavLink to="/culture/foods"><MdOutlineFastfood /> Foods</NavLink>
        <NavLink to="/jikoni-express/liqour-shots"><GiWineBottle /> Liquor</NavLink>
        <NavLink to="/saved/foods">Saved</NavLink>
        <NotificationBell as="div" onClick={() => setShowNotifications(!showNotifications)}>
          <MdNotificationsNone /> Alerts
          {true && <span className="notification-badge">3</span>}
        </NotificationBell>
      </BottomNav>

      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
    </AppContainer>
  );
}

export default App;
