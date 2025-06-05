import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import {
  FiCamera,
  FiDollarSign,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiMail,
  FiPhone,
  FiHelpCircle
} from 'react-icons/fi';
import { FaUserTie, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

import { Link, NavLink } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import food2Image from '/images/food2.png';

// --- Color Variables ---
const colors = {
  primary: '#FF4532',
  secondary: '#00C853',
  dark: '#1A202C',
  light: '#E0E0E0',
  white: '#FFFFFF',
  textMuted: '#CBD5E0',
  accent1: '#6200EE',
  accent2: '#03DAC6'
};

// --- Animations ---
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); box-shadow: 0 10px 40px rgba(0,0,0,0.4); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

// Header Styling
const StyledHeader = styled.header`
  background: ${colors.dark};
  color: ${colors.white};
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  animation: ${fadeIn} 0.8s ease-out;
  
  @media (max-width: 768px) {
    padding: 1rem;
    flex-wrap: wrap;
  }

  .logo-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-icon {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background-color: ${colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.5rem;
    color: ${colors.white};
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }

  .brand-name {
    font-size: 1.6rem;
    font-weight: 700;
    color: ${colors.white};
    span {
      color: ${colors.primary};
    }
    
    @media (max-width: 576px) {
      font-size: 1.4rem;
    }
  }

  nav {
    display: flex;
    gap: 1.5rem;
    
    @media (max-width: 992px) {
      display: none;
    }
    
    a {
      color: ${colors.textMuted};
      font-weight: 500;
      transition: color 0.3s ease, transform 0.2s ease;
      &:hover {
        color: ${colors.white};
        transform: translateY(-2px);
      }
      &.active {
        color: ${colors.secondary};
        border-bottom: 2px solid ${colors.secondary};
        padding-bottom: 3px;
      }
    }
  }

  .download-button {
    background-color: ${colors.primary};
    color: ${colors.white};
    padding: 0.6rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.3s ease;
    border: none;
    
    &:hover {
      background-color: #E6392B;
      transform: scale(1.05);
    }
    
    @media (max-width: 992px) {
      display: none;
    }
  }

  .mobile-menu-button {
    color: ${colors.white};
    background: none;
    border: none;
    font-size: 1.5rem;
    display: none;
    
    @media (max-width: 992px) {
      display: block;
    }
  }
`;

// Main Hero Section
const MainHeroSection = styled.section`
  background: linear-gradient(135deg, rgba(26,32,44,0.9) 0%, rgba(26,32,44,0.6) 100%),
              url(${food2Image});
  background-size: cover;
  background-position: center;
  color: ${colors.white};
  padding: 6rem 1rem;
  text-align: center;
  border-radius: 24px;
  margin: 2rem 1rem;
  box-shadow: 0 12px 40px rgba(0,0,0,0.4);
  animation: ${fadeIn} 1s ease-out;
  
  @media (max-width: 768px) {
    padding: 4rem 1rem;
    margin: 1rem;
  }

  h2 {
    font-size: 2.8rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    line-height: 1.2;
    span {
      color: ${colors.primary};
    }
    
    @media (min-width: 768px) {
      font-size: 3.5rem;
    }
    
    @media (min-width: 992px) {
      font-size: 4rem;
    }
  }

  p {
    font-size: 1.1rem;
    max-width: 900px;
    margin: 0 auto 2.5rem;
    color: ${colors.textMuted};
    
    @media (min-width: 768px) {
      font-size: 1.25rem;
    }
  }

  .hero-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    
    @media (min-width: 576px) {
      flex-direction: row;
      justify-content: center;
    }
    
    .btn {
      padding: 0.8rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 6px;
      transition: all 0.3s ease;
      min-width: 220px;
      text-align: center;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      }
      
      @media (min-width: 768px) {
        font-size: 1.1rem;
        padding: 0.85rem 2.2rem;
      }
    }
    
    .btn-primary-styled {
      background-color: ${colors.primary};
      border: 2px solid ${colors.primary};
      color: ${colors.white};
      
      &:hover {
        background-color: #E6392B;
        border-color: #E6392B;
      }
    }
    
    .btn-secondary-styled {
      background-color: ${colors.secondary};
      border: 2px solid ${colors.secondary};
      color: ${colors.white};
      
      &:hover {
        background-color: #00B247;
        border-color: #00B247;
      }
    }
  }
`;

// Features Section Styling
const FeaturesSection = styled.section`
  padding: 4rem 1rem;
  background: ${colors.white};
  border-radius: 24px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  margin: 2rem auto;
  max-width: 1200px;
  animation: ${fadeIn} 1s ease-out;
  
  @media (min-width: 768px) {
    padding: 5rem 1rem;
  }

  h3 {
    font-size: 2.2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 3rem;
    color: ${colors.dark};
    
    @media (min-width: 768px) {
      font-size: 2.8rem;
      margin-bottom: 4rem;
    }
  }

  .feature-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem;
    background: ${colors.light};
    border-radius: 12px;
    box-shadow: 0 4px 18px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
    height: 100%;
    margin-bottom: 1.5rem;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }

    .icon-wrapper {
      padding: 1rem;
      border-radius: 50%;
      margin-bottom: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      
      svg {
        font-size: 2.5rem;
        color: ${colors.white};
      }
      &.primary-bg { background-color: ${colors.primary}; }
      &.secondary-bg { background-color: ${colors.secondary}; }
    }

    h4 {
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: ${colors.dark};
    }

    p {
      color: #666;
      font-size: 0.95rem;
      line-height: 1.6;
    }
  }
`;

// Hero Section
const HeroSection = styled.div`
  background: linear-gradient(45deg, rgba(0,0,0,0.85) 0%, rgba(0, 0, 0, 0.54) 100%),
    url(${food2Image});
  background-size: cover;
  background-position: center;
  color: ${colors.white};
  padding: 4rem 1rem;
  text-align: center;
  border-radius: 24px;
  margin: 2rem 1rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  animation: ${fadeIn} 1s ease-out;
  
  @media (min-width: 768px) {
    padding: 5rem 1rem;
  }

  h1 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 1.2rem;
    
    span {
      color: ${colors.primary};
    }
    
    @media (min-width: 768px) {
      font-size: 2.8rem;
    }
  }

  p {
    font-size: 1.1rem;
    max-width: 800px;
    margin: 0 auto 1.8rem;
    color: rgba(255,255,255,0.9);
    
    @media (min-width: 768px) {
      font-size: 1.25rem;
    }
  }
  
  .hero-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    
    @media (min-width: 576px) {
      flex-direction: row;
      justify-content: center;
    }
    
    .btn {
      padding: 0.8rem 1.8rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 6px;
      transition: all 0.3s ease;
      min-width: 220px;
      text-align: center;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      }
    }
  }
`;

// Pulsating Button
const PulsatingButton = styled(Button)`
  animation: ${props => props.$animationName} ${props => props.$animationDuration} ${props => props.$animationIterationCount} ${props => props.$animationTimingFunction};
  border-radius: 6px !important;
`;

// Animated Value Card
const AnimatedValueCard = styled.div`
  background: ${colors.light};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  opacity: 0;
  animation: ${fadeIn} 1s ease-out ${props => props.delay}s forwards;
  margin-bottom: 1.5rem;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }

  svg {
    font-size: 2.2rem;
    color: ${colors.primary};
    margin-bottom: 1.2rem;
  }

  h3 {
    color: ${colors.dark};
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }

  p {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.6;
  }
`;

// Value Grid
const ValueGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 2rem 1rem;
  
  @media (min-width: 576px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    padding: 3rem 1rem;
  }
`;

// Animated Step Card
const StepCard = styled.div`
  background: ${colors.white};
  border-radius: 12px;
  padding: 1.8rem 1.2rem;
  text-align: center;
  box-shadow: 0 4px 18px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  opacity: 0;
  animation: ${fadeIn} 1s ease-out ${props => props.delay}s forwards;
  margin-bottom: 1.5rem;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  }

  .step-number {
    width: 60px;
    height: 60px;
    background: ${colors.primary};
    color: ${colors.white};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.2rem;
    font-weight: 700;
    font-size: 1.8rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }

  h4 {
    color: ${colors.dark};
    font-size: 1.3rem;
    margin-bottom: 0.6rem;
  }

  p {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.6;
  }
`;

// How It Works Section
const HowItWorksSection = styled.section`
  background: linear-gradient(135deg, ${colors.primary}10 0%, ${colors.secondary}10 100%);
  padding: 4rem 1rem;
  border-radius: 24px;
  margin: 2rem auto;
  max-width: 1200px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  animation: ${fadeIn} 1s ease-out;
  
  @media (min-width: 768px) {
    padding: 5rem 1rem;
  }

  h3 {
    font-size: 2.2rem;
    font-weight: 700;
    text-align: center;
    color: ${colors.dark};
    margin-bottom: 3rem;
    
    span {
      color: ${colors.primary};
    }
    
    @media (min-width: 768px) {
      font-size: 2.8rem;
      margin-bottom: 4rem;
    }
  }
`;

// Call to Action Section
const CtaSection = styled.section`
  background: linear-gradient(45deg, ${colors.primary} 0%, #B71C1C 100%);
  padding: 4rem 1rem;
  border-radius: 24px;
  text-align: center;
  color: ${colors.white};
  margin: 2rem auto;
  max-width: 1200px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.4);
  animation: ${fadeIn} 1s ease-out;
  
  @media (min-width: 768px) {
    padding: 5rem 1rem;
  }

  h2 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 1.2rem;
    line-height: 1.2;
    
    @media (min-width: 768px) {
      font-size: 2.8rem;
    }
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    opacity: 0.95;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    
    @media (min-width: 768px) {
      font-size: 1.25rem;
      margin-bottom: 2.5rem;
    }
  }
  
  .cta-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    
    @media (min-width: 576px) {
      flex-direction: row;
      justify-content: center;
    }
    
    .btn {
      padding: 0.8rem 1.8rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 6px;
      transition: all 0.3s ease;
      min-width: 220px;
      text-align: center;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      }
      
      @media (min-width: 768px) {
        font-size: 1.1rem;
        padding: 0.85rem 2rem;
      }
    }
    
    .btn-light-styled {
      background-color: ${colors.white};
      border: 2px solid ${colors.white};
      color: ${colors.primary};
      
      &:hover {
        background-color: #f0f0f0;
        border-color: #f0f0f0;
      }
    }
    
    .btn-outline-light-styled {
      background-color: transparent;
      border: 2px solid ${colors.white};
      color: ${colors.white};
      
      &:hover {
        background-color: rgba(255,255,255,0.15);
      }
    }
  }
`;

// Footer Styling
const StyledFooter = styled.footer`
  background: ${colors.dark};
  color: ${colors.textMuted};
  padding: 3rem 1rem 1.5rem;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
  animation: ${fadeIn} 0.8s ease-out;
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 2.5rem;
    
    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (min-width: 992px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  .footer-column {
    h4 {
      color: ${colors.white};
      font-size: 1.3rem;
      margin-bottom: 1.5rem;
      position: relative;
      padding-bottom: 0.5rem;
      
      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 50px;
        height: 2px;
        background: ${colors.primary};
      }
    }
    
    p {
      font-size: 0.95rem;
      line-height: 1.7;
      margin-bottom: 1.2rem;
    }
    
    .company-info {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      
      div {
        display: flex;
        align-items: flex-start;
        gap: 0.8rem;
        
        svg {
          margin-top: 0.2rem;
          flex-shrink: 0;
        }
      }
    }
    
    .footer-links {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      
      a {
        color: ${colors.textMuted};
        transition: color 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        &:hover {
          color: ${colors.white};
          text-decoration: none;
        }
        
        svg {
          font-size: 1.1rem;
        }
      }
    }
    
    .social-links {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
      
      a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.1);
        color: ${colors.white};
        transition: all 0.3s ease;
        
        &:hover {
          background: ${colors.primary};
          transform: translateY(-3px);
        }
      }
    }
  }
  
  .copyright {
    text-align: center;
    padding-top: 2rem;
    margin-top: 2rem;
    border-top: 1px solid rgba(255,255,255,0.1);
    font-size: 0.9rem;
    
    p {
      margin-bottom: 0.5rem;
    }
  }
`;

const LandingPage = () => {
  const showCustomModal = (message) => {
    alert(message);
  };

  const values = [
    {
      icon: <FaUserTie />,
      title: "Become a Home Chef",
      text: "Start earning immediately using your cooking skills"
    },
    {
      icon: <FiCamera />,
      title: "Share Food Stories",
      text: "Post your dishes Instagram-style with real-time updates"
    },
    {
      icon: <FiDollarSign />,
      title: "Instant Earnings",
      text: "Get paid securely through Welt Tallis blockchain"
    }
  ];

  const steps = [
    {
      number: '1',
      title: "Create Your Profile",
      text: "Set up your chef profile in minutes"
    },
    {
      number: '2',
      title: "Post Your Dishes",
      text: "Share photos and set your prices"
    },
    {
      number: '3',
      title: "Start Earning",
      text: "Receive orders and get paid instantly"
    },
    {
      number: '4',
      title: "Join as a Liquor Seller",
      text: "Register to showcase and sell your liquor selections"
    },
    {
      number: '5',
      title: "Post Liquor Products",
      text: "Upload images, set prices, and list your bottles"
    },
    {
      number: '6',
      title: "Earn from Liquor Sales",
      text: "Get paid directly when customers place orders"
    }
  ];

  return (
    <Container fluid className="px-0" style={{ overflowX: 'hidden' }}>

      {/* Header */}
      <StyledHeader>
        <div className="logo-container">
          <div className="logo-icon">
            <span>JE</span>
          </div>
          <h1 className="brand-name">Jikoni <span>Express</span></h1>
        </div>
        <nav>
          <NavLink to="#features">Features</NavLink>
          <NavLink to="#how-it-works">How it Works</NavLink>
          <NavLink to="#about">About Us</NavLink>
          <NavLink to="#contact">Contact</NavLink>
        </nav>
        <Button
          onClick={() => showCustomModal('Download options coming soon!')}
          className="download-button"
        >
          Download App
        </Button>
        <button className="mobile-menu-button focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </StyledHeader>

      {/* Main Hero Section */}
      <MainHeroSection>
        <div className="relative z-10 max-w-5xl mx-auto">
          <h2>
            Africa's <span>First Decentralized</span> Food & Liquor Delivery
          </h2>
          <p>
            Experience the future of culinary and beverage access. Jikoni Express connects you directly to local kitchens, fresh produce, and premium liquor sellers, powered by a secure, transparent, and community-driven network.
          </p>
          <div className="hero-buttons">
            <Button
              onClick={() => showCustomModal('Coming soon to App Store!')}
              className="btn-primary-styled"
            >
             Explore  Liqour
            </Button>
            <Button
              onClick={() => showCustomModal('Coming soon to Google Play!')}
              className="btn-secondary-styled"
            >
            Explore Foods
            </Button>
          </div>
        </div>
      </MainHeroSection>

      {/* Features Section */}
      <FeaturesSection id="features">
        <h3>Why Choose Jikoni Express?</h3>
        <Row className="g-4">
          <Col md={4}>
            <div className="feature-card">
              <div className="icon-wrapper primary-bg">
                <FiCheckCircle />
              </div>
              <h4>Decentralized & Fair</h4>
              <p>
                Direct connections, fairer prices for producers, and transparent transactions. No hidden fees, just honest food and clear dealings.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="feature-card">
              <div className="icon-wrapper secondary-bg">
                <FiUsers />
              </div>
              <h4>Community Powered</h4>
              <p>
                Support local businesses and farmers directly. Our network thrives on community participation and trust.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="feature-card">
              <div className="icon-wrapper primary-bg">
                <FiDollarSign />
              </div>
              <h4>Secure & Transparent</h4>
              <p>
                Blockchain technology ensures every transaction is secure, verifiable, and transparent from origin to table.
              </p>
            </div>
          </Col>
        </Row>
      </FeaturesSection>

      {/* Hero Section */}
      <HeroSection>
        <h1>Turn Your Kitchen into<br /><span>Income Source</span></h1>
        <p>Join Kenya's first decentralized food and liquor platform powered by Welt Tallis blockchain</p>
        <div className="hero-buttons">
          <PulsatingButton
            variant="light"
            size="lg"
            className="px-4"
            $animationName={pulse}
            $animationDuration="2s"
            $animationIterationCount="infinite"
            $animationTimingFunction="ease-in-out"
          >
            Start Cooking <FaUserTie />
          </PulsatingButton>
          <Link to="/culture/foods">
            <Button variant="outline-light" size="lg" className="px-4">
              Explore Meals
            </Button>
          </Link>
        </div>
      </HeroSection>

      {/* Value Grid */}
      <div className="py-3">
        <ValueGrid>
          {values.map((value, index) => (
            <AnimatedValueCard key={index} delay={index * 0.2}>
              {value.icon}
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </AnimatedValueCard>
          ))}
        </ValueGrid>
      </div>

      {/* How It Works Section */}
      <HowItWorksSection id="how-it-works">
        <h3>How It <span>Works</span></h3>
        <Row className="g-4">
          {steps.slice(0,3).map((step, index) => (
            <Col xs={12} md={6} lg={4} key={index}>
              <StepCard delay={index * 0.2}>
                <div className="step-number" style={{ backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary }}>{step.number}</div>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </StepCard>
            </Col>
          ))}
          {steps.slice(3,6).map((step, index) => (
            <Col xs={12} md={6} lg={4} key={index + 3}>
              <StepCard delay={(index + 3) * 0.2}>
                <div className="step-number" style={{ backgroundColor: index % 2 === 0 ? colors.secondary : colors.primary }}>{step.number}</div>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </StepCard>
            </Col>
          ))}
        </Row>
      </HowItWorksSection>

      {/* Call to Action Section */}
      <CtaSection>
        <h2>Ready to Join the Food & Liquor Revolution?</h2>
        <p>Start your culinary or business journey today with zero upfront costs</p>
        <div className="cta-buttons">
          <Button variant="light" size="lg" className="btn-light-styled">
            Become a Chef
          </Button>
          <Link to="/jikoni/express/download">
            <Button variant="outline-light" size="lg" className="btn-outline-light-styled">
              Download App
            </Button>
          </Link>
        </div>
      </CtaSection>

      {/* Footer */}
      <StyledFooter id="contact">
        <div className="footer-content">
          <div className="footer-column">
            <h4>About Jikoni Express</h4>
            <p>
              Jikoni Express is revolutionizing Kenya's food and beverage culture through decentralized technology. 
              We connect home chefs, liquor sellers, and food enthusiasts in a transparent, community-driven marketplace.
            </p>
            <div className="social-links">
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaLinkedinIn /></a>
            </div>
          </div>
          
          <div className="footer-column">
            <h4>Company</h4>
            <div className="footer-links">
              <a href="#"><span>About Us</span></a>
              <a href="#"><span>Our Team</span></a>
              <a href="#"><span>Careers</span></a>
              <a href="#"><span>Blog</span></a>
              <a href="#"><span>Press</span></a>
            </div>
          </div>
          
          <div className="footer-column">
            <h4>Legal</h4>
            <div className="footer-links">
              <a href="#"><span>Terms of Service</span></a>
              <a href="#"><span>Privacy Policy</span></a>
              <a href="#"><span>Cookie Policy</span></a>
              <a href="#"><span>Licenses</span></a>
              <a href="#"><span>Compliance</span></a>
            </div>
          </div>
          
          <div className="footer-column">
            <h4>Contact Us</h4>
            <div className="company-info">
              <div>
                <FiMapPin />
                <span>Jikoni Express Limited, Nairobi, Kenya</span>
              </div>
              <div>
                <FiPhone />
                <span>+254 700 123 456</span>
              </div>
              <div>
                <FiMail />
                <span>info@jikoniexpress.co.ke</span>
              </div>
              <div>
                <FiHelpCircle />
                <span>support@jikoniexpress.co.ke</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="copyright">
          <p>&copy; {new Date().getFullYear()} Jikoni Express Limited. All rights reserved.</p>
          <p>Powered by Welt Tallis Blockchain Technology</p>
        </div>
      </StyledFooter>
    </Container>
  );
};

export default LandingPage;