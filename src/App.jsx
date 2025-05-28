import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
  FiShoppingBag, FiDownload, FiHeart
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
import    VerifyOtp     from  './components/auth/verify-OTP'
import    SavedFoods     from   './components/saved/saved'


const AppContainer = styled.div`
  min-height: 100vh;
  position: relative;
`;

const MainContent = styled.main`
  padding: 1rem;
  padding-bottom: 80px;
`;
const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  padding: 0.8rem 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  border-top: 1px solid #f1f5f9;

  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem;
    color:rgb(255, 13, 13);
    text-decoration: none;
    font-size: 0.8rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    
    &:hover {
      transform: translateY(-3px);
      color: #4f46e5;
      
      svg {
        transform: scale(1.15);
      }
    }
    
    &.active {
      color: #4f46e5;
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 24px;
        height: 3px;
        background: #FF4532;
        border-radius: 2px;
      }
      
      svg {
        color: #FF4532;
        filter: drop-shadow(0 2px 4px #c3e703);
      }
    }
    
    svg {
      font-size: 1.4rem;
      font-weight:  bold;
      margin-bottom: 0.4rem;
      transition: all 0.3s ease;
      color: #FF4532;
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

  useEffect(() => {
    const userData = getUserNameFromToken();
    if (userData) setUsername(userData.name);
  }, []);

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
          <Route path="/food" element={<FoodPlatform />} />
          <Route path="/chef/:id" element={<ChefProfile />} />
          <Route path="/download" element={<Download />} />
          <Route path="/favourites" element={<SavedFoods  />} />
         
        </Routes>
      </MainContent>

      <BottomNav>
        <NavLink to="/food">
          <FiShoppingBag /> Foods
        </NavLink>
        <NavLink to="/download">
          <FiDownload /> Get App
        </NavLink>
        <NavLink to="/favourites">
          <FiHeart /> Saved
        </NavLink>

            <NavLink to="/register">
          <FiHeart /> Register
        </NavLink>

          <NavLink to="/">
          <FiShoppingBag /> Home
        </NavLink>
      </BottomNav>
    </AppContainer>
  );
}

export default App;