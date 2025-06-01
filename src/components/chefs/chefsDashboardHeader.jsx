import React from 'react';
import { Button } from 'react-bootstrap';
import { BarChartLine, Scooter } from 'react-bootstrap-icons';

export default function ChefDashboardHeader({ setState }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 className="fw-bold mb-2" style={{ color: '#2c3e50' }}>Chef Dashboard</h1>
        <p className="text-muted mb-0">Manage your culinary creations and track performance</p>
      </div>
      
      <div className="d-flex gap-2">
        <Button 
          variant="info" 
          className="d-flex align-items-center rounded-pill px-4 py-2"
          onClick={() => setState(s => ({ ...s, showAnalytics: true }))}
          style={{
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            border: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
          }}
        >
          <BarChartLine className="me-2" /> Analytics
        </Button>
        
        <Button 
          variant="warning" 
          className="d-flex align-items-center rounded-pill px-4 py-2"
          onClick={() => setState(s => ({ ...s, showBikers: true }))}
          style={{
            background: 'linear-gradient(135deg, #f39c12 0%, #d35400 100%)',
            border: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(243, 156, 18, 0.3)'
          }}
        >
          <Scooter className="me-2" /> Available Riders
        </Button>
      </div>
    </div>
  );
}