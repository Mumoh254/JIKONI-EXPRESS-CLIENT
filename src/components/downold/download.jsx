import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { getUserNameFromToken } from '../../handler/tokenDecorder';

// Import Icons
import {
  FaMobileAlt,      // General app download
  FaApple,          // Apple App Store
  FaGooglePlay,     // Google Play Store
  FaCheckCircle,    // Installed status
  FaRocket,         // Fast delivery
  FaMapMarkerAlt,   // Real-time tracking
  FaCrown,          // Exclusive specials
  FaCreditCard,     // Secure payments
  FaGift,           // Rewards
  FaEnvelope,       // Email
  FaPhoneAlt        // Phone
} from 'react-icons/fa';

// --- Jikoni Express Color Palette (Balanced & Sleek) ---
const colors = {
  primary: '#FF4532',         // Jikoni Red - Bold Accent
  secondary: '#00C853',       // Jikoni Green - Success/Contrast
  tertiary: '#3498DB',        // Vibrant Blue - Another accent
  quaternary: '#F39C12',      // Warm Yellow - Another accent
  darkText: '#2C3E50',        // Deep Charcoal - Main text
  lightText: '#7F8C8D',       // Muted Grey - Secondary text
  backgroundLight: '#F8F9FA', // Off-White - General background
  cardBackground: '#FFFFFF',  // Pure White - Card background
  borderLight: '#ECEFF1',     // Very Light Grey - Subtle borders
  shadow: 'rgba(0,0,0,0.08)', // Subtle Shadow
  buttonHover: '#E6392B',     // Slightly darker red for hover
  disabledButton: '#CFD8DC',  // Light grey for disabled state
};

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseEffect = keyframes`
  0% { transform: scale(1); box-shadow: 0 4px 10px ${colors.shadow}; }
  50% { transform: scale(1.01); box-shadow: 0 6px 15px ${colors.shadow}; }
  100% { transform: scale(1); box-shadow: 0 4px 10px ${colors.shadow}; }
`;

// --- Styled Components ---

const DownloadContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${colors.backgroundLight};
  padding: 20px;
  font-family: 'Poppins', sans-serif;
  animation: ${fadeIn} 0.6s ease-out;
  overflow: hidden;
`;

const DownloadCard = styled.div`
  background-color: ${colors.cardBackground};
  border-radius: 12px; /* Sleeker, less rounded */
  box-shadow: 0 8px 25px ${colors.shadow}; /* Clean, crisp shadow */
  max-width: 420px; /* Significantly smaller card */
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid ${colors.borderLight}; /* Fine, subtle border */
  animation: ${slideUp} 0.7s ease-out forwards; /* Card slides in */
`;

const HeaderSection = styled.div`
  background-color: ${colors.primary}; /* Solid Red Header */
  color: white;
  padding: 25px 20px; /* Reduced padding */
  text-align: center;
  position: relative;
  overflow: hidden;
  border-bottom: 3px solid ${colors.secondary}; /* Green accent strip */
`;

const AppIcon = styled.div`
  background-color: rgba(255,255,255,0.15); /* Very subtle transparency */
  color: white;
  width: 60px; /* Smaller icon */
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem; /* Adjusted icon size */
  margin: 0 auto 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-weight: 800; /* Bold, but not overly aggressive */
  letter-spacing: 0.5px;
  font-size: 28px; /* Compact title size */
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 14px; /* Compact subtitle */
  opacity: 0.9;
`;

const ContentSection = styled.div`
  padding: 25px; /* Compact padding */
  text-align: center;
  background-color: ${colors.cardBackground};
`;

const Greeting = styled.h2`
  font-size: 20px; /* Compact greeting */
  color: ${colors.darkText};
  margin: 0 0 10px;
  font-weight: 700;
`;

const Instruction = styled.p`
  font-size: 14px; /* Compact instruction text */
  color: ${colors.lightText};
  margin-bottom: 25px;
  line-height: 1.5;
`;

const InstallButton = styled.button`
  background-color: ${props => props.disabled ? colors.disabledButton : colors.primary};
  color: ${props => props.disabled ? colors.darkText : 'white'};
  border: none;
  padding: 12px 25px; /* Very compact padding */
  font-size: 16px; /* Compact text size */
  font-weight: 600;
  border-radius: 8px; /* Sleek, less rounded */
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease-in-out;
  margin: 10px auto;
  width: 100%;
  max-width: 240px; /* Very compact button */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 10px ${colors.shadow};

  &:not(:disabled):hover {
    background-color: ${colors.buttonHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 15px ${colors.shadow};
  }

  ${props => !props.disabled && css`
    animation: ${pulseEffect} 2s infinite ease-in-out;
  `}
`;

const FeaturesSection = styled.div`
  margin-top: 30px; /* Compact space */
  text-align: left;
  border-top: 1px solid ${colors.borderLight};
  padding-top: 20px;
`;

const FeaturesTitle = styled.h3`
  color: ${colors.darkText};
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 700;
  text-transform: uppercase;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding-left: 0;
  color: ${colors.lightText};
  line-height: 1.6;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 10px; /* Compact space */
  font-size: 14px; /* Very compact feature text */
  font-weight: 500;
  animation: ${fadeIn} 0.5s ease-out forwards; /* Simple fade in */

  svg {
    font-size: 18px; /* Compact icon size */
    margin-right: 10px;
    flex-shrink: 0;
    /* Use a mix of colors for features */
    &:nth-child(1) { color: ${colors.primary}; }      // Red
    &:nth-child(2) { color: ${colors.secondary}; }    // Green
    &:nth-child(3) { color: ${colors.tertiary}; }     // Blue
    &:nth-child(4) { color: ${colors.quaternary}; }  // Yellow
    &:nth-child(5) { color: ${colors.primary}; }      // Red (loop back)
  }
`;

const DeveloperSection = styled.div`
  background-color: ${colors.darkText};
  color: white;
  padding: 25px; /* Compact padding */
  text-align: center;
  border-top: 2px solid ${colors.secondary}; /* Green accent */
`;

const DeveloperTitle = styled.h3`
  color: ${colors.secondary};
  font-size: 16px;
  margin-bottom: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const DeveloperCard = styled.div`
  background-color: rgba(255,255,255,0.05); /* Very subtle transparency */
  border-radius: 8px;
  padding: 15px; /* Compact padding */
  border: 1px solid rgba(255,255,255,0.1);
`;

const CompanyName = styled.h4`
  color: ${colors.primary};
  font-size: 20px; /* Compact size */
  margin: 0 0 8px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const Tagline = styled.p`
  font-size: 13px; /* Very compact size */
  opacity: 0.9;
  margin-bottom: 15px;
  line-height: 1.5;
`;

const ContactInfo = styled.div`
  font-size: 13px; /* Very compact size */
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  p {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
    
    svg {
      color: ${colors.primary};
      font-size: 16px;
    }
  }
`;

const Download = () => {
  const [username, setUserName] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPrompt = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Auto-refresh logic to force prompt
  useEffect(() => {
    const isDownloadPage = window.location.pathname.includes('/jikoni/express/download');
    const params = new URLSearchParams(window.location.search);

    if (isDownloadPage && !params.has('refreshed')) {
      params.set('refreshed', 'true');
      window.history.replaceState({}, '', `?${params.toString()}`);
      window.location.reload();
    } else {
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (!initialLoad) {
      const userData = getUserNameFromToken();
      if (userData) setUserName(userData.name);
    }
  }, [initialLoad]);

  useEffect(() => {
    if (initialLoad) return;

    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      if (isStandalone || (isIOS && isSafari && navigator.standalone)) {
        setIsInstalled(true);
      }
    };

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      console.log('📦 beforeinstallprompt event captured');
      deferredPrompt.current = e;
      setIsInstalled(false);

      setTimeout(() => {
        if (deferredPrompt.current && !isInstalled) {
          handleInstall();
        }
      }, 500);
    };

    checkInstalled();

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      deferredPrompt.current = null;
      console.log('✅ App installed successfully (appinstalled event)');
      trackInstall();
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [initialLoad, isInstalled]);

  const handleInstall = async () => {
    if (isInstalled) {
      console.log('App is already installed.');
      return;
    }

    if (!deferredPrompt.current) {
      alert("To install, use your browser's 'Add to Home Screen' option.");
      return;
    }

    try {
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Installation error during prompt:', error);
    } finally {
      deferredPrompt.current = null;
    }
  };

  const trackInstall = async () => {
    const BASE_URL = "https://your-api-endpoint.com/apiV1/jikoni-express"; // REMINDER: Update this API endpoint

    try {
      const response = await fetch(`${BASE_URL}/track-install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username || 'Guest' }),
      });

      if (!response.ok) throw new Error('Tracking failed');
      console.log('✅ Installation tracked');
    } catch (error) {
      console.error('Tracking error:', error);
    }
  };

  if (initialLoad) {
    return null;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  return (
    <DownloadContainer>
      <DownloadCard>
        <HeaderSection>
          <AppIcon>
            <FaMobileAlt />
          </AppIcon>
          <Title>JIKONI EXPRESS</Title>
          <Subtitle>Your Local Culinary & Liquor Hub</Subtitle>
        </HeaderSection>

        <ContentSection>
          <Greeting>Hello {username || 'Jikoni Lover'}!</Greeting>
          <Instruction>
            Unlock the full experience by installing our app directly to your home screen.
            It's fast, free, and gives you instant access!
          </Instruction>

          {isInstalled ? (
            <InstallButton disabled>
              <FaCheckCircle /> App Installed
            </InstallButton>
          ) : (
            <>
              {isIOS ? (
                <InstallButton onClick={handleInstall}>
                  <FaApple /> Install for iOS
                </InstallButton>
              ) : (
                <InstallButton onClick={handleInstall}>
                  <FaGooglePlay /> Install for Android
                </InstallButton>
              )}
            </>
          )}

          <FeaturesSection>
            <FeaturesTitle>App Highlights</FeaturesTitle>
            <FeatureList>
              <FeatureItem><FaRocket /> Instant food & liquor delivery</FeatureItem>
              <FeatureItem><FaMapMarkerAlt /> Real-time order tracking</FeatureItem>
              <FeatureItem><FaCrown /> Exclusive chef specials</FeatureItem>
              <FeatureItem><FaCreditCard /> Secure in-app payments</FeatureItem>
              <FeatureItem><FaGift /> Earn rewards with every order</FeatureItem>
            </FeatureList>
          </FeaturesSection>
        </ContentSection>

        <DeveloperSection>
          <DeveloperTitle>Powered by</DeveloperTitle>
          <DeveloperCard>
            <CompanyName>WELT TALLIS</CompanyName>
            <Tagline>Where culinary innovation meets digital excellence</Tagline>
            <ContactInfo>
              <p><FaEnvelope /> infoweltallis@gmail.com</p>
              <p><FaPhoneAlt /> +254 740 045 355</p>
            </ContactInfo>
          </DeveloperCard>
        </DeveloperSection>
      </DownloadCard>
    </DownloadContainer>
  );
};

export default Download;