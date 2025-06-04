import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import {
  FiCamera,
  FiDollarSign,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiUsers
} from 'react-icons/fi';
import { FaUserTie } from 'react-icons/fa';

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
  padding: 1rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  animation: ${fadeIn} 0.8s ease-out;

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
    font-size: 1.8rem;
    font-weight: 700;
    color: ${colors.white};
    span {
      color: ${colors.primary};
    }
  }

  nav a {
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

  .download-button {
    background-color: ${colors.primary};
    color: ${colors.white};
    padding: 0.75rem 1.75rem;
    border-radius: 8px;
    font-weight: 600;
    transition: background-color 0.3s ease, transform 0.2s ease;
    &:hover {
      background-color: #E6392B;
      transform: scale(1.05);
    }
  }

  .mobile-menu-button {
    color: ${colors.white};
  }
`;

// Main Hero Section
const MainHeroSection = styled.section`
  background: linear-gradient(135deg, rgba(26,32,44,0.9) 0%, rgba(26,32,44,0.6) 100%),
              url(${food2Image});
  background-size: cover;
  background-position: center;
  color: ${colors.white};
  padding: 8rem 1rem;
  text-align: center;
  border-radius: 24px;
  margin: 2rem 0;
  box-shadow: 0 12px 40px rgba(0,0,0,0.4);
  animation: ${fadeIn} 1s ease-out;

  h2 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    line-height: 1.2;
    span {
      color: ${colors.primary};
    }
    @media (min-width: 768px) {
      font-size: 4.5rem;
    }
  }

  p {
    font-size: 1.35rem;
    max-width: 900px;
    margin: 0 auto 3rem;
    color: ${colors.textMuted};
  }

  .hero-buttons .btn {
    padding: 0.85rem 2.5rem;
    margin: 0.43rem  0rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 50px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    }
  }

  .hero-buttons .btn-primary-styled {
    background-color: ${colors.primary};
    border-color: ${colors.primary};
    color: ${colors.white};
    &:hover {
      background-color: #E6392B;
      border-color: #E6392B;
    }
  }

  .hero-buttons .btn-secondary-styled {
    background-color: ${colors.secondary};
    border-color: ${colors.secondary};
    color: ${colors.white};
    &:hover {
      background-color: #00B247;
      border-color: #00B247;
    }
  }
`;

// Features Section Styling
const FeaturesSection = styled.section`
  padding: 6rem 1rem;
  background: ${colors.white};
  border-radius: 24px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  margin: 2rem auto;
  max-width: 1200px;
  animation: ${fadeIn} 1s ease-out;

  h3 {
    font-size: 2.8rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 4rem;
    color: ${colors.dark};
  }

  .feature-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2.5rem;
    background: ${colors.light};
    border-radius: 16px;
    box-shadow: 0 4px 18px rgba(0,0,0,0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    height: 100%;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }

    .icon-wrapper {
      padding: 1.2rem;
      border-radius: 50%;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      svg {
        font-size: 3.5rem;
        color: ${colors.white};
      }
      &.primary-bg { background-color: ${colors.primary}; }
      &.secondary-bg { background-color: ${colors.secondary}; }
    }

    h4 {
      font-size: 1.6rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: ${colors.dark};
    }

    p {
      color: #666;
      font-size: 1rem;
      line-height: 1.7;
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
  padding: 6rem 1rem;
  text-align: center;
  border-radius: 24px;
  margin: 2rem 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  animation: ${fadeIn} 1s ease-out;

  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    span {
      color: ${colors.primary};
    }
  }

  p {
    font-size: 1.25rem;
    max-width: 800px;
    margin: 0 auto 2rem;
    color: rgba(255,255,255,0.9);
  }
`;

// Pulsating Button
const PulsatingButton = styled(Button)`
  animation: ${props => props.$animationName} ${props => props.$animationDuration} ${props => props.$animationIterationCount} ${props => props.$animationTimingFunction};
`;

// Animated Value Card
const AnimatedValueCard = styled.div`
  background: ${colors.light};
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  opacity: 0;
  animation: ${fadeIn} 1s ease-out ${props => props.delay}s forwards;

  &:hover {
    transform: translateY(-8px);
  }

  svg {
    font-size: 2.5rem;
    color: ${colors.primary};
    margin-bottom: 1.5rem;
  }

  h3 {
    color: ${colors.dark};
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  p {
    color: #666;
    font-size: 1rem;
    line-height: 1.6;
  }
`;

// Value Grid
const ValueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 3rem 0;
`;

// Animated Step Card
const StepCard = styled.div`
  flex-shrink: 0;
  width: 100%;
  max-width: 280px;
  background: ${colors.white};
  border-radius: 16px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  box-shadow: 0 4px 18px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  opacity: 0;
  animation: ${fadeIn} 1s ease-out ${props => props.delay}s forwards;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  }

  .step-number {
    width: 65px;
    height: 65px;
    background: ${colors.primary};
    color: ${colors.white};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-weight: 700;
    font-size: 2.2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }

  h4 {
    color: ${colors.dark};
    font-size: 1.4rem;
    margin-bottom: 0.75rem;
  }

  p {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

// How It Works Section
const HowItWorksSection = styled.section`
  background: linear-gradient(135deg, ${colors.primary}10 0%, ${colors.secondary}10 100%);
  padding: 6rem 1rem;
  border-radius: 24px;
  margin: 3rem auto;
  max-width: 1200px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  animation: ${fadeIn} 1s ease-out;

  h3 {
    font-size: 2.8rem;
    font-weight: 700;
    text-align: center;
    color: ${colors.dark};
    margin-bottom: 4rem;
    span {
      color: ${colors.primary};
    }
  }

  .step-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    gap: 2rem;

    @media (min-width: 768px) {
      flex-direction: row;
      gap: 0;
    }
  }

  .step-arrow {
    display: none;
    color: ${colors.textMuted};
    font-size: 3rem;
    margin: 0 1rem;
    @media (min-width: 768px) {
      display: block;
    }
  }
`;

// Call to Action Section
const CtaSection = styled.section`
  background: linear-gradient(45deg, ${colors.primary} 0%, ${colors.primaryDark || '#B71C1C'} 100%);
  padding: 6rem 1rem;
  border-radius: 24px;
  text-align: center;
  color: ${colors.white};
  margin: 3rem auto;
  max-width: 1200px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.4);
  animation: ${fadeIn} 1.s ease-out;

  h2 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    line-height: 1.2;
  }

  p {
    font-size: 1.35rem;
    margin-bottom: 2.5rem;
    opacity: 0.95;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  .cta-buttons .btn {
    padding: 0.85rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 50px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    }
  }
  .cta-buttons .btn-light-styled {
    background-color: ${colors.white};
    border-color: ${colors.white};
    color: ${colors.primary};
    &:hover {
      background-color: ${colors.light};
      border-color: ${colors.light};
    }
  }
  .cta-buttons .btn-outline-light-styled {
    background-color: transparent;
    border-color: ${colors.white};
    color: ${colors.white};
    &:hover {
      background-color: rgba(255,255,255,0.15);
    }
  }
`;

// Footer Styling
const StyledFooter = styled.footer`
  background: ${colors.dark};
  color: ${colors.textMuted};
  padding: 2.5rem 3rem;
  text-align: center;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
  animation: ${fadeIn} 0.8s ease-out;

  .footer-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;

    @media (min-width: 768px) {
      flex-direction: row;
    }
  }

  p {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: ${colors.textMuted};
  }

  .footer-links a {
    color: ${colors.textMuted};
    transition: color 0.3s ease;
    &:hover {
      color: ${colors.white};
      text-decoration: underline;
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
    <Container fluid className="px-0">

      {/* Header */}
      <StyledHeader>
        <div className="logo-container">
          <div className="logo-icon">
            <span>JE</span>
          </div>
          <h1 className="brand-name">Jikoni <span>Express</span></h1>
        </div>
        <nav className="hidden md:flex space-x-8">
          <NavLink to="#features">Features</NavLink>
          <NavLink to="#how-it-works">How it Works</NavLink>
          <NavLink to="#about">About Us</NavLink>
          <NavLink to="#contact">Contact</NavLink>
        </nav>
        <Button
          onClick={() => showCustomModal('Download options coming soon!')}
          className="download-button hidden md:block"
        >
          Download App
        </Button>
        {/* Mobile menu button */}
        <button className="md:hidden mobile-menu-button focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </StyledHeader>

      {/* Main Hero Section */}
      <MainHeroSection>
        <div className="relative z-10 max-w-5xl mx-auto">
          <h2>
            Africa's <span style={{ color: colors.primary }}>First Decentralized</span> Food & Liquor Delivery
          </h2>
          <p>
            Experience the future of culinary and beverage access. Jikoni Express connects you directly to local kitchens, fresh produce, and premium liquor sellers, powered by a secure, transparent, and community-driven network.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 hero-buttons">
            <Button
              onClick={() => showCustomModal('Coming soon to App Store!')}
              className="btn-primary-styled"
            >
              Get on App Store
            </Button>
            <Button
              onClick={() => showCustomModal('Coming soon to Google Play!')}
              className="btn-secondary-styled"
            >
              Get on Google Play
            </Button>
          </div>
        </div>
      </MainHeroSection>

      {/* Features Section */}
      <FeaturesSection id="features">
        <h3>Why Choose Jikoni Express?</h3>
        <Row className="g-5">
          {/* Feature 1 */}
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
          {/* Feature 2 */}
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
          {/* Feature 3 */}
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
        <div className="d-flex gap-3 justify-content-center">
          <PulsatingButton
            variant="light"
            size="lg"
            className="rounded-pill px-4"
            $animationName={pulse}
            $animationDuration="2s"
            $animationIterationCount="infinite"
            $animationTimingFunction="ease-in-out"
          >
            Start Cooking <FaUserTie />
          </PulsatingButton>
          <Link to="/culture/foods">
            <Button variant="outline-light" size="lg" className="rounded-pill px-4">
              Explore Meals
            </Button>
          </Link>
        </div>
      </HeroSection>

      {/* Value Grid */}
      <div className="py-5 px-4">
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
        <Row className="g-4 justify-content-center">
          {steps.slice(0,3).map((step, index) => (
            <Col xs={12} md={4} key={index} className="d-flex justify-content-center">
              <StepCard delay={index * 0.2}>
                <div className="step-number" style={{ backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary }}>{step.number}</div>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </StepCard>
            </Col>
          ))}
        </Row>
        <Row className="g-4 mt-5 justify-content-center">
          {steps.slice(3,6).map((step, index) => (
            <Col xs={12} md={4} key={index} className="d-flex justify-content-center">
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
        <div className="d-flex gap-3 justify-content-center cta-buttons">
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
      <StyledFooter>
        <div className="footer-content">
          <div className="mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} Jikoni Express. All rights reserved.</p>
            <p className="text-sm mt-1">Powered by Welt Tallis.</p>
          </div>
          <div className="flex space-x-6 footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </StyledFooter>
    </Container>
  );
};

export default LandingPage;