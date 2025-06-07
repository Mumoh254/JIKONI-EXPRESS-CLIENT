import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
  FiDownload, FiHeart, FiBarChart2, FiUsers, FiCoffee
} from 'react-icons/fi';
import styled from 'styled-components';
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
import { FaWineBottle } from "react-icons/fa";
import { IoIosPersonAdd } from "react-icons/io";
import { GiHotMeal } from "react-icons/gi";
import  Liqour   from './Liqour/liqour'
import LiqourProfile from './Liqour/liqourProfile';
import  Board from './components/Rider/riderBoard'


const AppContainer = styled.div`
  min-height: 100vh;
  position: relative;
`;

const MainContent = styled.main`
  padding: 1rem 0rem;
  padding-bottom: 80px;
`;

const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(145deg, #dfe6e9, #ffffff);
  display: flex;
  justify-content: space-around;
  padding: 0.8rem 0;
  border-top: 1px solid #d1d9e6;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    0 -4px 12px rgba(0, 0, 0, 0.15),
    0 4px 6px rgba(0, 0, 0, 0.05);
  border-radius: 12px 12px 0 0;

  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem;
    color: rgb(255, 13, 13);
    text-decoration: none;
    font-size: 0.8rem;
    transition: all 0.3s ease-in-out;
    position: relative;

    &:hover {
      transform: translateY(-4px);
      color: #4f46e5;

      svg {
        transform: scale(1.2);
        filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.15));
      }
    }

    &.active {
      color: #4f46e5;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 26px;
        height: 4px;
        background: #FF4532;
        border-radius: 2px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }

      svg {
        color: #FF4532;
        filter: drop-shadow(0 2px 6px #c3e703);
      }
    }

    svg {
      font-size: 1.6rem;
      font-weight: bold;
      margin-bottom: 0.4rem;
      transition: all 0.3s ease;
      color: #FF4532;
      filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.25));
      transform: perspective(300px) translateZ(5px);
    }
  }

  @media (max-width: 480px) {
    padding: 0.6rem 0;

    a {
      padding: 0.5rem;
      font-size: 0.7rem;

      svg {
        font-size: 1.1rem;
      }
    }
  }
`;

function App() {


  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [username, setUsername] = useState('');
  const [isChefMode, setIsChefMode] = useState(false);
  const [isRiderMode, setIsRiderMode] = useState(false);


  // Set username from token
  useEffect(() => {
    const userData = getUserNameFromToken();
    if (userData) {
      setUsername(userData.name);
    }
  }, []);

  // Redirect if isChef is true
  useEffect(() => {
  const isChef = localStorage.getItem('isChef');
  const isRider = localStorage.getItem('isRider');

  if (isChef === 'true') {
    setIsChefMode(true);
    navigate('/chef/dashboard');
  } else if (isRider === 'true') {
    setIsRiderMode(true);
    navigate('/rider/dashboard');
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
            <Route path="/register" element={<Register />} />
             <Route path="/jikoni-express/liqour-shots" element={<Liqour />} />
          <Route path="/culture/foods" element={<FoodPlatform />} />
          <Route path="/chef/:id" element={<ChefProfile />} />
            <Route path="/liqour/:id" element={<LiqourProfile />} />
          <Route path="/jikoni/express/download" element={<Download />} />
          <Route path="/saved/foods" element={<SavedFoods />} />

            <Route path="/rider/dashboard" element={<Board />} />

          
          <Route path="/chef/dashboard" element={<ChefDashboard setIsChefMode={setIsChefMode} />} />
        </Routes>
      </MainContent>

    <BottomNav>
  {isChefMode ? (
    <>
      <NavLink to="/chef/dashboard#analytics">
        <FiBarChart2 /> Analytics
      </NavLink>
      <NavLink to="/chef/dashboard#riders">
        <FiUsers /> Riders
      </NavLink>
      <NavLink to="/chef/dashboard">
        <FiCoffee /> Foods
      </NavLink>
    </>
  ) : isRiderMode ? (
    <>
   
    </>
  ) : (
    <>
      <NavLink to="/register">
        <IoIosPersonAdd /> Register
      </NavLink>
      <NavLink to="/jikoni/express/download">
        <FiDownload /> Get App
      </NavLink>
      <NavLink to="/saved/foods">
        <FiHeart /> Saved
      </NavLink>
      <NavLink to="/jikoni-express/liqour-shots">
        <FaWineBottle /> Liqour
      </NavLink>
      <NavLink to="/culture/foods">
        <GiHotMeal /> Foods
      </NavLink>
    </>
  )}
</BottomNav>

    </AppContainer>
  );
}

export default App;
