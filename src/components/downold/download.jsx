import { useEffect, useState, useRef } from 'react';
import { getUserNameFromToken } from '../../handler/tokenDecorder';

// Jikoni Express Color Palette
const colors = {
  primary: '#FF4532',       // Jikoni Red
  secondary: '#00C853',     // Jikoni Green
  darkText: '#1A202C',      // Dark text for headings
  lightBackground: '#F0F2F5', // Light background
  cardBackground: '#FFFFFF', // White for cards
  borderColor: '#D1D9E6',   // Light border
  errorText: '#EF4444',     // Error red
  placeholderText: '#A0AEC0', // Muted text
  buttonHover: '#E6392B',   // Darker red on hover
  disabledButton: '#CBD5E1', // Disabled button
};

const Download = () => {
  const [username, setUserName] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPrompt = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Auto-refresh logic to force prompt
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
      
      // Immediately show prompt when page loads
      setTimeout(() => {
        if (deferredPrompt.current) {
          handleInstall();
        }
      }, 1000);
    };

    checkInstalled();
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      deferredPrompt.current = null;
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [initialLoad]);

  const handleInstall = async () => {
    if (!deferredPrompt.current) {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      return;
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
    const BASE_URL = "https://your-api-endpoint.com/apiV1/jikoni-express";

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

  if (initialLoad) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>JIKONI EXPRESS</h1>
          <p style={styles.subtitle}>Food Delivery Revolution</p>
        </div>

        <div style={styles.content}>
          <h2 style={styles.greeting}>Hello {username || 'User'}!</h2>
          <p style={styles.instruction}>Install the app for the best experience:</p>
          
          <button
            style={isInstalled ? styles.installedButton : styles.installButton}
            onClick={handleInstall}
            disabled={isInstalled}
          >
            {isInstalled ? '✓ App Installed' : 'Install App Now'}
          </button>
          
          <div style={styles.features}>
            <h3 style={styles.featuresTitle}>JIKONI EXPRESS FEATURES:</h3>
            <ul style={styles.featureList}>
              <li>Instant food delivery from local chefs</li>
              <li>Real-time order tracking</li>
              <li>Exclusive chef specials</li>
              <li>Secure in-app payments</li>
              <li>Naivas voucher rewards</li>
            </ul>
          </div>
        </div>
        
        <div style={styles.developerSection}>
          <h3 style={styles.developerTitle}>DEVELOPED BY</h3>
          <div style={styles.developerCard}>
            <h4 style={styles.company}>WELT TALLIS</h4>
            <p style={styles.tagline}>Where culinary innovation meets digital excellence</p>
            <div style={styles.contactInfo}>
              <p>📧 infoweltallis@gmail.com</p>
              <p>📱 0740 045 355</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styling using Jikoni Express color palette
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: colors.lightBackground,
    padding: '20px',
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
    maxWidth: '500px',
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    background: colors.primary,
    color: 'white',
    padding: '25px',
    textAlign: 'center',
  },
  title: {
    margin: '0',
    fontWeight: '700',
    letterSpacing: '0.5px',
    fontSize: '28px',
  },
  subtitle: {
    margin: '8px 0 0',
    fontSize: '16px',
    opacity: '0.9',
  },
  content: {
    padding: '30px',
    textAlign: 'center',
  },
  greeting: {
    fontSize: '22px',
    color: colors.darkText,
    margin: '0 0 10px',
  },
  instruction: {
    fontSize: '16px',
    color: colors.darkText,
    marginBottom: '25px',
  },
  installButton: {
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    padding: '14px 30px',
    fontSize: '18px',
    fontWeight: '600',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    margin: '10px 0',
    width: '100%',
    maxWidth: '300px',
  },
  installedButton: {
    backgroundColor: colors.secondary,
    color: 'white',
    border: 'none',
    padding: '14px 30px',
    fontSize: '18px',
    fontWeight: '600',
    borderRadius: '12px',
    margin: '10px 0',
    width: '100%',
    maxWidth: '300px',
    cursor: 'not-allowed',
  },
  features: {
    marginTop: '30px',
    textAlign: 'left',
    borderTop: `1px solid ${colors.borderColor}`,
    paddingTop: '20px',
  },
  featuresTitle: {
    color: colors.primary,
    fontSize: '18px',
    marginBottom: '15px',
  },
  featureList: {
    paddingLeft: '20px',
    color: colors.darkText,
    lineHeight: '1.6',
  },
  developerSection: {
    backgroundColor: colors.darkText,
    color: 'white',
    padding: '25px',
    textAlign: 'center',
  },
  developerTitle: {
    color: colors.secondary,
    fontSize: '16px',
    marginBottom: '15px',
    fontWeight: '600',
  },
  developerCard: {
 
    borderRadius: '12px',
    padding: '20px',
  },
  company: {
    color: colors.primary,
    fontSize: '22px',
    margin: '0 0 10px',
    fontWeight: '700',
  },
  tagline: {
    fontSize: '14px',
    opacity: '0.9',
    marginBottom: '15px',
  },
  contactInfo: {
    fontSize: '14px',
    lineHeight: '1.6',
  }
};

export default Download;