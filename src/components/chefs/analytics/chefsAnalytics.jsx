import React from 'react';
import { Offcanvas, ProgressBar } from 'react-bootstrap';

export default function AnalyticsSidebar({ show, onHide, orders }) {
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const preparingOrders = orders.filter(o => o.status === 'preparing').length;
  const totalEarnings = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  
  return (
    <Offcanvas show={show} onHide={onHide} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Chef Analytics</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="mb-4">
          <h5>Total Earnings</h5>
          <h2 className="text-success">KES {totalEarnings}</h2>
        </div>
        
        <div className="mb-4">
          <h5>Completed Orders</h5>
          <h3>{completedOrders} <span className="text-muted fs-6">/ {totalOrders}</span></h3>
        </div>
        
        <div className="mb-4">
          <h5>Order Status Distribution</h5>
          <ProgressBar className="mb-2">
            <ProgressBar 
              variant="success" 
              now={(completedOrders / totalOrders) * 100} 
              label={`${Math.round((completedOrders / totalOrders) * 100)}%`} 
            />
            <ProgressBar 
              variant="warning" 
              now={(preparingOrders / totalOrders) * 100} 
              label={`${Math.round((preparingOrders / totalOrders) * 100)}%`} 
            />
          </ProgressBar>
          
          <div className="d-flex mt-2">
            <div className="me-3">
              <span className="badge bg-success me-1"></span>
              <span>Delivered: {completedOrders}</span>
            </div>
            <div>
              <span className="badge bg-warning me-1"></span>
              <span>Preparing: {preparingOrders}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h5>Top Performing Foods</h5>
          <ul className="list-group">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Chicken Biryani
              <span className="badge bg-primary rounded-pill">24 orders</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Beef Pilau
              <span className="badge bg-primary rounded-pill">18 orders</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Vegetable Curry
              <span className="badge bg-primary rounded-pill">15 orders</span>
            </li>
          </ul>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}