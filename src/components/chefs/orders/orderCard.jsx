// src/components/OrderCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const OrderCard = ({ order, updateOrderStatus }) => {
  const getStatusColor = () => {
    switch(order.status) {
      case 'pending': return 'status-pending';
      case 'preparing': return 'status-preparing';
      case 'ready': return 'status-ready';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };
  
  const getStatusIcon = () => {
    switch(order.status) {
      case 'pending': return 'fas fa-clock';
      case 'preparing': return 'fas fa-utensils';
      case 'ready': return 'fas fa-check-circle';
      case 'delivered': return 'fas fa-truck';
      case 'cancelled': return 'fas fa-times-circle';
      default: return '';
    }
  };
  
  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-id">Order #{order.id}</div>
        <div className={`order-status ${getStatusColor()}`}>
          <i className={getStatusIcon()}></i> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </div>
      </div>
      
      <div className="order-details">
        <div className="customer-info">
          <h4><i className="fas fa-user"></i> {order.customer.name}</h4>
          <p><i className="fas fa-phone"></i> {order.customer.phone}</p>
        </div>
        
        <div className="location-info">
          <div className="location">
            <i className="fas fa-store"></i> 
            <span>{order.pickupLocation}</span>
          </div>
          <div className="location">
            <i className="fas fa-map-marker-alt"></i> 
            <span>{order.deliveryAddress}</span>
          </div>
          <button className="map-btn">
            <i className="fas fa-map"></i> View in Maps
          </button>
        </div>
        
        <div className="order-items">
          <h5>Items:</h5>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.quantity}x {item.name} - KES {item.price}
              </li>
            ))}
          </ul>
          <div className="order-total">
            Total: <strong>KES {order.total}</strong>
          </div>
        </div>
        
        <div className="order-time">
          <i className="fas fa-clock"></i> 
          {new Date(order.orderTime).toLocaleString()}
        </div>
        
        {order.rider && (
          <div className="rider-info">
            <h5>Rider:</h5>
            <p>{order.rider.name} ({order.rider.phone})</p>
            <div className="rider-rating">
              <i className="fas fa-star"></i> {order.rider.rating}
            </div>
          </div>
        )}
      </div>
      
      <div className="order-actions">
        {order.status === 'pending' && (
          <>
            <button 
              className="btn accept"
              onClick={() => updateOrderStatus(order.id, 'preparing')}
            >
              <i className="fas fa-check"></i> Accept
            </button>
            <button 
              className="btn reject"
              onClick={() => updateOrderStatus(order.id, 'cancelled')}
            >
              <i className="fas fa-times"></i> Reject
            </button>
          </>
        )}
        
        {order.status === 'preparing' && (
          <button 
            className="btn cooking"
            onClick={() => updateOrderStatus(order.id, 'ready')}
          >
            <i className="fas fa-fire"></i> Mark as Ready
          </button>
        )}
        
        {order.status === 'ready' && (
          <div className="ready-actions">
            <button className="btn call">
              <i className="fas fa-phone"></i> Call Rider
            </button>
            <button className="btn print">
              <i className="fas fa-print"></i> Print Invoice
            </button>
          </div>
        )}
        
        <Link to={`/order/${order.id}`} className="btn details">
          <i className="fas fa-info-circle"></i> View Details
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;