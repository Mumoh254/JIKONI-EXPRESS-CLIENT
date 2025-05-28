import styled from 'styled-components';
import { FiDownloadCloud, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import React, { useEffect, useRef, useState } from 'react';
import { getUserNameFromToken } from '../../handler/tokenDecorder';
const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
`;

const Header = styled.h1`
  color: #FF4532;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  font-family: 'Pacifico', cursive;
  
  span {
    color: #2d3436;
    display: block;
    font-size: 1.2rem;
    margin-top: 0.5rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
`;

const InstallButton = styled.button`
  background: ${props => props.installed ? '#2ECC71' : '#FF4532'};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0 auto 3rem;
  transition: all 0.3s ease;
  cursor: ${props => props.installed ? 'default' : 'pointer'};
  
  &:hover {
    transform: ${props => props.installed ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.installed ? 'none' : '0 4px 15px rgba(255,69,50,0.3)'};
  }
`;

const ProfileSection = styled.div`
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 16px;
  margin-bottom: 2rem;

  img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #FF4532;
    margin-bottom: 1.5rem;
  }

  h2 {
    color: #2d3436;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    margin-bottom: 1rem;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;

  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
    
    svg {
      color: #FF4532;
    }
  }
`;

const CompanySection = styled.div`
  text-align: center;
  padding: 2rem;
  background: linear-gradient(45deg, #FF4532, #FF6B4A);
  border-radius: 16px;
  color: white;

  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.9;
  }
`;

const Download = () => {
 const [username, setUserName] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPrompt = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Auto-refresh logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('refreshed')) {
      params.set('refreshed', 'true');
      window.location.search = params.toString();
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
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
      
      if ((isIOS && isSafari && navigator.standalone) || isStandalone) {
        setIsInstalled(true);
      }
    };

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      console.log('📦 beforeinstallprompt event captured');
      deferredPrompt.current = e;
      setIsInstalled(false);
    };

    checkInstalled();
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      deferredPrompt.current = null;
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', () => {});
    };
  }, [initialLoad]);

  const handleInstall = async () => {
    if (!deferredPrompt.current) {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return alert('App is already installed!');
      }
      return alert('Install prompt not available - try refreshing');
    }

    try {
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ App installed successfully');
        setIsInstalled(true);
        trackInstall();
      }
    } catch (error) {
      console.error('Installation error:', error);
    } finally {
      deferredPrompt.current = null;
    }
  };

  const trackInstall = async () => {
    const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

    try {
      const response = await fetch(`${BASE_URL}/track-install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username }),
      });

      if (!response.ok) throw new Error('Tracking failed');
      console.log('✅ Installation tracked');
    } catch (error) {
      console.error('Tracking error:', error);
    }
  };

  if (initialLoad) return null; // Prevent flash of content before refresh


  return (
    <Container>
      <Header>
        Welcome to Jikoni Express
        <span>{username ? username : 'Valued User'}</span>
      </Header>

      <InstallButton 
        onClick={handleInstall}
        installed={isInstalled}
      >
        <FiDownloadCloud size={24} />
        {isInstalled ? 'App Installed ✓' : 'Install Jikoni Express'}
      </InstallButton>

      <ProfileSection>
        <img src="/images/dev.png" alt="Developer" />
        <h2>Peter Mumo</h2>
        <p>CEO & Founder, Welt Tallis</p>
        <p>Lead Developer, Jikoni Express</p>
        
        <ContactInfo>
          <div>
            <FiMail />
            <span>peteritumo2030@gmail.com</span>
          </div>
          <div>
            <FiPhone />
            <span>+254740045355</span>
          </div>
        </ContactInfo>
      </ProfileSection>

      <CompanySection>
        <h3>Powered by Welt Tallis Group</h3>
        <p>Innovating through technology for better urban living</p>
      </CompanySection>
    </Container>
  );
};

export default Download;