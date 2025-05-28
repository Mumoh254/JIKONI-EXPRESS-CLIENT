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
import { FaUserTie } from 'react-icons/fa'; // or any chef-like representation


import { NavLink } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import nairobiImage from '/images/food.png';

// Color Variables
const colors = {
  primary: '#FF4532', // Brand Red
  secondary: '#2ECC71', // Fresh Green
  dark: '#2D3436',
  light: '#F8F9FA'
};

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const HeroSection = styled.div`
  background: linear-gradient(45deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 100%),
    url(${nairobiImage});
  background-size: cover;
  background-position: center;
  color: ${colors.light};
  padding: 6rem 1rem;
  text-align: center;
  border-radius: 24px;
  margin: 2rem 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);

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

const ValueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 3rem 0;
`;

const ValueCard = styled.div`
  background: ${colors.light};
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);

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

const HowItWorks = styled.div`
  background: ${colors.secondary}15;
  padding: 4rem 1rem;
  border-radius: 24px;
  margin: 3rem 0;

  h2 {
    text-align: center;
    color: ${colors.dark};
    margin-bottom: 3rem;
    font-size: 2.5rem;
    
    span {
      color: ${colors.primary};
    }
  }
`;

const StepCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  height: 100%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);

  .number {
    width: 40px;
    height: 40px;
    background: ${colors.primary};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-weight: 700;
  }

  h3 {
    color: ${colors.dark};
    margin-bottom: 1rem;
  }

  p {
    color: #666;
  }
`;

const CtaSection = styled.div`
  background: ${colors.primary};
  padding: 4rem 1rem;
  border-radius: 24px;
  text-align: center;
  color: white;
  margin: 3rem 0;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
  }

  p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }
`;

const LandingPage = () => {
  const values = [
    {
      icon: <FaUserTie  />,
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
    }
  ];

  return (
    <Container fluid className="px-4">
      <HeroSection>
        <h1>Turn Your Kitchen into<br /><span>Income Source</span></h1>
        <p>Join Kenya's first decentralized food platform powered by Welt Tallis blockchain</p>
        <div className="d-flex gap-3 justify-content-center">
          <Button variant="light" size="lg" className="rounded-pill px-4">
            Start Cooking <FaUserTie  />
          </Button>
          <Button variant="outline-light" size="lg" className="rounded-pill px-4">
            Explore Meals
          </Button>
        </div>
      </HeroSection>

      <ValueGrid>
        {values.map((value, index) => (
          <ValueCard key={index}>
            {value.icon}
            <h3>{value.title}</h3>
            <p>{value.text}</p>
          </ValueCard>
        ))}
      </ValueGrid>

      <HowItWorks>
        <h2>How It <span>Works</span></h2>
        <Row className="g-4">
          {steps.map((step, index) => (
            <Col md={4} key={index}>
              <StepCard>
                <div className="number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </StepCard>
            </Col>
          ))}
        </Row>
      </HowItWorks>

      <CtaSection>
        <h2>Ready to Join the Food Revolution?</h2>
        <p>Start your culinary journey today with zero upfront costs</p>
        <div className="d-flex gap-3 justify-content-center">
          <Button variant="light" size="lg" className="rounded-pill px-4">
            Become a Chef
          </Button>
          <Button variant="outline-light" size="lg" className="rounded-pill px-4">
            Download App
          </Button>
        </div>
      </CtaSection>
    </Container>
  );
};

export default LandingPage;