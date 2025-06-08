// src/components/OrderDetails.js
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderDetails = ({ orders, updateOrderStatus }) => {
  const { orderId } = useParams();
const order = Array.isArray(orders) ? orders.find(o => o.id === orderId) : null;

  
  if (!order) {
    return (
      <div className="order-details">
        <h2>Order Not Found</h2>
        <Link to="/" className="btn back">
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </Link>
      </div>
    );
  }
  
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
  
  const getProgressSteps = () => {
    const steps = [
      { id: 'ordered', label: 'Order Placed', icon: 'fas fa-shopping-cart' },
      { id: 'preparing', label: 'Preparing', icon: 'fas fa-utensils' },
      { id: 'ready', label: 'Ready', icon: 'fas fa-check' },
      { id: 'picked', label: 'Picked Up', icon: 'fas fa-motorcycle' },
      { id: 'delivered', label: 'Delivered', icon: 'fas fa-home' }
    ];
    
    return steps.map(step => {
      let statusClass = '';
      if (order.status === 'delivered' && step.id === 'delivered') {
        statusClass = 'active';
      } else if (order.status === 'ready' && ['ordered', 'preparing', 'ready'].includes(step.id)) {
        statusClass = step.id === 'ready' ? 'active' : 'completed';
      } else if (order.status === 'preparing' && ['ordered', 'preparing'].includes(step.id)) {
        statusClass = step.id === 'preparing' ? 'active' : 'completed';
      } else if (order.status === 'pending' && step.id === 'ordered') {
        statusClass = 'active';
      }
      
      return (
        <div key={step.id} className={`progress-step ${statusClass}`}>
          <div className="step-icon">
            <i className={step.icon}></i>
          </div>
          <div className="step-label">{step.label}</div>
        </div>
      );
    });
  };
  
  return (
    <div className="order-details">
      <div className="order-header">
        <Link to="/" className="btn back">
          <i className="fas fa-arrow-left"></i> Back to Orders
        </Link>
        <h2>Order #{order.id}</h2>
        <div className={`order-status ${getStatusColor()}`}>
          <i className={getStatusIcon()}></i> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </div>
      </div>
      
      <div className="progress-tracker">
        {getProgressSteps()}
      </div>
      
      <div className="order-sections">
        <div className="order-section customer-info">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> {order.customer.name}</p>
          <p><strong>Phone:</strong> {order.customer.phone}</p>
          <button className="btn call">
            <i className="fas fa-phone"></i> Call Customer
          </button>
        </div>
        
        <div className="order-section delivery-info">
          <h3>Delivery Information</h3>
          <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
          <p><strong>Pickup Location:</strong> {order.pickupLocation}</p>
          <p><strong>Delivery Notes:</strong> {order.deliveryNotes}</p>
          <button className="btn map">
            <i className="fas fa-map-marked-alt"></i> View on Map
          </button>
        </div>
        
        <div className="order-section items-info">
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>KES {item.price}</td>
                  <td>KES {item.quantity * item.price}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="total-label">Total:</td>
                <td className="total-value">KES {order.total}</td>
              </tr>
            </tfoot>
          </table>
          <button className="btn print">
            <i className="fas fa-print"></i> Print Invoice
          </button>
        </div>
        
        {order.rider && (
          <div className="order-section rider-info">
            <h3>Rider Information</h3>
            <p><strong>Name:</strong> {order.rider.name}</p>
            <p><strong>Phone:</strong> {order.rider.phone}</p>
            <p><strong>Rating:</strong> <i className="fas fa-star"></i> {order.rider.rating}</p>
            <div className="rider-actions">
              <button className="btn call">
                <i className="fas fa-phone"></i> Call Rider
              </button>
              <button className="btn chat">
                <i className="fas fa-comment"></i> Message
              </button>
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
              <i className="fas fa-check"></i> Accept Order
            </button>
            <button 
              className="btn reject"
              onClick={() => updateOrderStatus(order.id, 'cancelled')}
            >
              <i className="fas fa-times"></i> Reject Order
            </button>
          </>
        )}
        
        {order.status === 'preparing' && (
          <button 
            className="btn cooking"
            onClick={() => updateOrderStatus(order.id, 'ready')}
          >
            <i className="fas fa-fire"></i> Mark as Ready for Pickup
          </button>
        )}
        
        {order.status === 'ready' && !order.rider && (
          <div className="ready-alert">
            <i className="fas fa-info-circle"></i>
            <p>Order is ready! Waiting for rider assignment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;