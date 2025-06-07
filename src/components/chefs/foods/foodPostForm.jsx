import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const colors = {
  primary: '#FF4532', // Jikoni Red
  secondary: '#00C853', // Jikoni Green
  darkText: '#1A202C', // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for the page
  cardBackground: '#FFFFFF', // White for the form card
  borderColor: '#D1D9E6', // Light border for inputs
  errorText: '#EF4444', // Red for errors
  placeholderText: '#A0AEC0', // Muted text for placeholders
  buttonHover: '#E6392B', // Darker red on button hover
  disabledButton: '#CBD5E1', // Gray for disabled buttons
};

const inputStyle = {
  borderColor: colors.borderColor,
  borderRadius: '8px',
  padding: '12px 15px',
  transition: 'all 0.3s ease',
  '&:focus': {
    borderColor: colors.primary,
    boxShadow: `0 0 0 3px ${colors.primary}33`,
    transform: 'scale(1.01)'
  }
};

const buttonStyle = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: '8px',
    padding: '10px 24px',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: colors.buttonHover,
      borderColor: colors.buttonHover,
      transform: 'translateY(-2px)'
    },
    '&:active': {
      transform: 'translateY(1px)'
    }
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: colors.borderColor,
    color: colors.darkText,
    borderRadius: '8px',
    padding: '10px 24px',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: colors.lightBackground,
      transform: 'translateY(-2px)'
    }
  }
};

export default function FoodPostForm({ show, onHide, setFoods }) {
  const [chefId, setChefId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch chef ID from local storage
    const userData = localStorage.getItem('chefId');
    if (userData) {
       setChefId(userData);
     
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target);
    const images = formData.getAll('images');
    
    // Validate chef ID
    if (!chefId) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Required',
        text: 'Chef information not found. Please log in again.',
        confirmButtonColor: colors.primary,
      });
      setIsSubmitting(false);
      return;
    }
    
    // Set chef ID in form data
    formData.append('chefId', chefId);
    
    // Validate image count
    if (images.length > 3) {
      Swal.fire({
        icon: 'error',
        title: 'Image Limit Exceeded',
        text: 'Maximum of 3 images allowed',
        confirmButtonColor: colors.primary,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/apiV1/smartcity-ke/create/food", {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Food Created!',
          text: 'Your dish is now available for orders',
          showConfirmButton: false,
          timer: 1500,
          background: colors.lightBackground,
          customClass: {
            popup: 'animated bounceIn'
          }
        });
        setFoods(data);
        onHide();
        e.target.reset();
      } else {
        Swal.fire({
          title: 'Error',
          text: data.message || 'Failed to create food',
          icon: 'error',
          confirmButtonColor: colors.primary,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Connection Error',
        text: 'Unable to reach the server. Please try again',
        icon: 'error',
        confirmButtonColor: colors.primary,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg"
    
    >
      <Modal.Header 
        closeButton
        style={{ 
          backgroundColor: colors.primary,
          color: 'white',
          border: 'none',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          padding: '20px 25px'
        }}
      >
        <Modal.Title style={{ fontWeight: 700, fontSize: '1.5rem' }}>
          Create New Food Post
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ backgroundColor: colors.lightBackground, padding: '0' }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.4 }}
        >
          <Form 
            onSubmit={handleSubmit} 
            encType="multipart/form-data"
            style={{ 
              backgroundColor: colors.cardBackground, 
              padding: '30px',
              borderRadius: '0 0 12px 12px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.05)'
            }}
          >
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label style={{ color: colors.darkText, fontWeight: 600, marginBottom: '8px' }}>
                    Title
                  </Form.Label>
                  <Form.Control 
                    name="title" 
                    required 
                    placeholder="e.g. Spicy Chicken Tikka"
                    style={inputStyle}
                  />
                </Form.Group>
              </div>
              
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label style={{ color: colors.darkText, fontWeight: 600, marginBottom: '8px' }}>
                    Price (KES)
                  </Form.Label>
                  <Form.Control 
                    name="price" 
                    type="number" 
                    min="1" 
                    required 
                    placeholder="e.g. 850"
                    style={inputStyle}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-4">
              <Form.Label style={{ color: colors.darkText, fontWeight: 600, marginBottom: '8px' }}>
                Description
              </Form.Label>
              <Form.Control 
                name="description" 
                as="textarea" 
                rows={3} 
                required 
                placeholder="Describe your dish..."
                style={{ 
                  ...inputStyle,
                  minHeight: '120px',
                  resize: 'vertical'
                }}
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label style={{ color: colors.darkText, fontWeight: 600, marginBottom: '8px' }}>
                    Meal Type
                  </Form.Label>
                  <Form.Control 
                    name="mealType" 
                    required 
                    as="select"
                    style={inputStyle}
                  >
                    <option value="">Select meal type</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Snack">Snack</option>
                  </Form.Control>
                </Form.Group>
              </div>
              
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label style={{ color: colors.darkText, fontWeight: 600, marginBottom: '8px' }}>
                    Area
                  </Form.Label>
                  <Form.Control 
                    name="area" 
                    required 
                    placeholder="e.g. Westlands, Nairobi"
                    style={inputStyle}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-4">
              <Form.Label style={{ color: colors.darkText, fontWeight: 600, marginBottom: '8px' }}>
                Food Images <span style={{ color: colors.placeholderText, fontWeight: 500 }}>(Max 3)</span>
              </Form.Label>
              <div className="file-upload-container">
                <Form.Control 
                  name="images" 
                  type="file" 
                  multiple 
                  accept="image/*"
                  required
                  style={{ 
                    ...inputStyle,
                    padding: '12px',
                    cursor: 'pointer'
                  }}
                />
                <div className="upload-hint" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginTop: '8px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                    <path d="M19 13V19H5V13H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13H19ZM13 12H16L12 8L8 12H11V16H13V12Z" fill={colors.placeholderText}/>
                  </svg>
                  <Form.Text style={{ color: colors.placeholderText, fontSize: '0.85rem' }}>
                    Drag & drop or click to upload (max 3 images)
                  </Form.Text>
                </div>
              </div>
            </Form.Group>

            <div className="chef-info" style={{
              backgroundColor: colors.lightBackground,
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '25px',
              borderLeft: `4px solid ${colors.primary}`
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                color: colors.darkText
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: `${colors.primary}20`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={colors.primary}>
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Chef Information</div>
                  <div style={{ fontSize: '0.85rem', color: colors.placeholderText }}>
                    {chefId ? `Your chef ID: ${chefId}` : 'No chef information found'}
                  </div>
                </div>
              </div>
            </div>

            <motion.div 
              className="d-flex justify-content-end mt-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button 
                variant="outline-secondary" 
                onClick={onHide} 
                className="me-3"
                disabled={isSubmitting}
                style={buttonStyle.secondary}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={isSubmitting}
                style={buttonStyle.primary}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ marginRight: '8px' }}>
                      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                    </svg>
                    Create Food
                  </>
                )}
              </Button>
            </motion.div>
          </Form>
        </motion.div>
      </Modal.Body>
    </Modal>
  );
}