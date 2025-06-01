
// ChefDashboardHeader.js
import React from 'react';
import { Button } from 'react-bootstrap';
import { BarChartLine, Scooter, ArrowReturnLeft } from 'react-bootstrap-icons';

export default function ChefDashboardHeader({ setState, exitChefMode }) {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
      <div className="text-center text-md-start mb-3 mb-md-0">
        <h1 className="fw-bold mb-2" style={{ color: '#2c3e50', fontSize: isMobile ? '1.8rem' : '2rem' }}>
          Chef Dashboard
        </h1>
        <p className="text-muted mb-0" style={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
          Manage your culinary creations and track performance
        </p>
      </div>
      
      <div className={`d-flex ${isMobile ? 'flex-wrap justify-content-center' : 'gap-2'}`}>
        <Button 
          variant="info" 
          className={`d-flex align-items-center rounded-pill px-3 py-2 mb-2 ${isMobile ? 'me-2' : ''}`}
          onClick={() => setState(s => ({ ...s, showAnalytics: true }))}
          style={{
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            border: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
            fontSize: isMobile ? '0.9rem' : '1rem'
          }}
        >
          <BarChartLine className="me-1 me-md-2" /> 
          {isMobile ? 'Stats' : 'Analytics'}
        </Button>
        
        <Button 
          variant="warning" 
          className={`d-flex align-items-center rounded-pill px-3 py-2 mb-2 ${isMobile ? 'me-2' : ''}`}
          onClick={() => setState(s => ({ ...s, showBikers: true }))}
          style={{
            background: 'linear-gradient(135deg, #f39c12 0%, #d35400 100%)',
            border: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(243, 156, 18, 0.3)',
            fontSize: isMobile ? '0.9rem' : '1rem'
          }}
        >
          <Scooter className="me-1 me-md-2" /> 
          {isMobile ? 'Riders' : 'Available Riders'}
        </Button>

        <Button 
          variant="danger" 
          className="d-flex align-items-center rounded-pill px-3 py-2 mb-2"
          onClick={exitChefMode}
          style={{
            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            border: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
            fontSize: isMobile ? '0.9rem' : '1rem'
          }}
        >
          <ArrowReturnLeft className="me-1 me-md-2" /> 
          {isMobile ? 'Exit' : 'Exit Chef Mode'}
        </Button>
      </div>
    </div>
  );
}