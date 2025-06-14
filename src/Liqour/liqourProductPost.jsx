import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';

const colors = {
  primary: '#FF4532', // Jikoni Red, consistent with other components
  lightBackground: '#f8f9fa',
  cardBackground: '#ffffff',
  darkText: '#212529',
  placeholderText: '#6c757d',
  errorText: '#EF4444', // Red for errors
  buttonHover: '#E6392B', // Darker red on button hover
};

const inputStyle = {
  borderRadius: '8px',
  border: '1px solid #ccc',
  padding: '10px 12px',
  fontSize: '1rem',
  backgroundColor: '#fff',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
};

const buttonStyle = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    padding: '10px 20px',
    fontWeight: 600,
    borderRadius: '8px',
  },
  secondary: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    color: '#333',
    padding: '10px 20px',
    fontWeight: 600,
    borderRadius: '8px',
  },
};

// Custom Alert Modal component
const CustomAlertModal = ({ show, type, title, message, onClose }) => {
  const bgColor = type === 'success' ? '#d4edda' : '#f8d7da';
  const textColor = type === 'success' ? '#155724' : '#721c24';
  const borderColor = type === 'success' ? '#c3e6cb' : '#f5c6cb';
  const icon = type === 'success' ? '✔' : '✖';
  const iconColor = type === 'success' ? colors.secondary : colors.errorText;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Body style={{ backgroundColor: bgColor, borderRadius: '8px', padding: '30px' }}>
        <div className="text-center">
          <div style={{
            fontSize: '3rem',
            color: iconColor,
            marginBottom: '15px',
            lineHeight: '1',
          }}>
            {icon}
          </div>
          <h4 style={{ color: textColor, fontWeight: 'bold', marginBottom: '10px' }}>{title}</h4>
          <p style={{ color: textColor, fontSize: '1rem', marginBottom: '20px' }}>{message}</p>
          <Button
            onClick={onClose}
            style={{
              backgroundColor: iconColor,
              borderColor: iconColor,
              color: 'white',
              padding: '10px 25px',
              borderRadius: '5px',
              fontWeight: '600',
            }}
          >
            OK
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};


export default function LiquorPostForm({ show, onHide, setLiquorProducts }) { // Renamed prop to setLiquorProducts
  const [vendorId, setVendorId] = useState(''); // Changed chefId to vendorId
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]); // State to hold selected files and their previews

  // State for Custom Alert Modal
  const [alert, setAlert] = useState({
    show: false,
    type: '',
    title: '',
    message: '',
  });

  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };

  const hideAlert = () => {
    setAlert({ ...alert, show: false });
  };


  useEffect(() => {
    // Assuming 'chefId' from localStorage is now your 'vendorId'
    const userData = localStorage.getItem('chefId'); 
    if (userData) setVendorId(userData);
  }, []);

  // Clean up object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [selectedFiles]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 3) {
      showAlert(
        'error',
        'Image Limit Exceeded',
        `You can select up to 3 images. You have already selected ${selectedFiles.length}.`
      );
      // Clear the input to allow re-selection without showing too many
      e.target.value = ''; 
      return;
    }

    const newSelectedFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedFiles(prevFiles => [...prevFiles, ...newSelectedFiles]);
    // Clear the input value so that selecting the same file again triggers onChange
    e.target.value = ''; 
  };

  const handleRemoveImage = (indexToRemove) => {
    setSelectedFiles(prevFiles => {
      const updatedFiles = prevFiles.filter((_, index) => index !== indexToRemove);
      URL.revokeObjectURL(prevFiles[indexToRemove].preview); // Clean up memory
      return updatedFiles;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!vendorId) { // Changed chefId to vendorId
      showAlert(
        'error',
        'Authentication Required',
        'Vendor information not found. Please log in again.'
      );
      setIsSubmitting(false);
      return;
    }

    if (selectedFiles.length === 0) {
      showAlert(
        'error',
        'No Images Selected',
        'Please select at least one image for your liquor product.'
      );
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.target); // Use FormData directly from the form
    formData.append('vendorId', vendorId); // Append vendorId
    formData.append('userId', vendorId); // Assuming vendorId can also act as userId for now based on backend snippet

    // Remove the mealType field as it's no longer relevant
    formData.delete('mealType');

    // Append each selected image file
    selectedFiles.forEach(fileData => {
      formData.append('images', fileData.file);
    });

    try {
      const response = await fetch("http://localhost:8000/apiV1/smartcity-ke/create/liquor-listing", { // Updated API endpoint
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        showAlert(
          'success',
          'Liquor Product Created!',
          'Your product is now available for sale.'
        );
        setLiquorProducts(data); // Renamed setFoods to setLiquorProducts
        onHide();
        // Clear selected files after successful submission
        selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
        setSelectedFiles([]); 
        e.target.reset();
      } else {
        showAlert(
          'error',
          'Error',
          data.message || 'Failed to create liquor product'
        );
      }
    } catch (error) {
      console.error(error);
      showAlert(
        'error',
        'Connection Error',
        'Unable to reach the server. Please try again'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton style={{
          backgroundColor: colors.primary,
          color: 'white',
          border: 'none',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          padding: '20px 25px'
        }}>
          <Modal.Title style={{ fontWeight: 700, fontSize: '1.5rem' }}>
            Create New Liquor Product Listing {/* Updated title */}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ backgroundColor: colors.lightBackground, padding: '0' }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.4 }}
          >
            <Form onSubmit={handleSubmit} encType="multipart/form-data" style={{
              backgroundColor: colors.cardBackground,
              padding: '30px',
              borderRadius: '0 0 12px 12px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.05)'
            }}>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label>Title</Form.Label>
                    <Form.Control name="title" required placeholder="e.g. Premium Scotch Whisky" style={inputStyle} /> {/* Updated placeholder */}
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label>Price (KES)</Form.Label>
                    <Form.Control name="price" type="number" min="1" required placeholder="e.g. 5000" style={inputStyle} /> {/* Updated placeholder */}
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-4">
                <Form.Label>Description</Form.Label>
                <Form.Control name="description" as="textarea" rows={3} required placeholder="Describe your liquor product, its notes, and origin..." style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} /> {/* Updated placeholder */}
              </Form.Group>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label>Brand</Form.Label>
                    <Form.Control name="brand" required placeholder="e.g. Glenfiddich" style={inputStyle} /> {/* New field: Brand */}
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label>Alcohol Percentage (ABV)</Form.Label>
                    <Form.Control name="alcoholPercentage" type="number" step="0.1" min="0" max="100" required placeholder="e.g. 40.0" style={inputStyle} /> {/* New field: Alcohol Percentage */}
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label>Volume (ml)</Form.Label>
                    <Form.Control name="volume" type="number" min="1" required placeholder="e.g. 750" style={inputStyle} /> {/* New field: Volume */}
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label>Category</Form.Label> {/* Changed Meal Type to Category */}
                    <Form.Control name="category" as="select" required style={inputStyle}>
                      <option value="">Select category</option>
                      <option value="Whisky">Whisky</option>
                      <option value="Vodka">Vodka</option>
                      <option value="Gin">Gin</option>
                      <option value="Rum">Rum</option>
                      <option value="Wine">Wine</option>
                      <option value="Beer">Beer</option>
                      <option value="Tequila">Tequila</option>
                      <option value="Brandy">Brandy</option>
                      <option value="Liqueur">Liqueur</option>
                      <option value="Champagne">Champagne</option>
                    </Form.Control>
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label>Liquor Type</Form.Label>
                    <Form.Control name="liquorType" required placeholder="e.g. Single Malt, Dry Gin" style={inputStyle} /> {/* New field: Liquor Type */}
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label>Area</Form.Label> {/* Kept Area as per backend, will use its value for 'city' */}
                    <Form.Control name="area" required placeholder="e.g. Westlands, Nairobi" style={inputStyle} />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-4">
                <Form.Label>
                  Product Images <span style={{ fontWeight: 500 }}>(Max 3)</span> {/* Updated label */}
                </Form.Label>
                <Form.Control
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  required={selectedFiles.length === 0}
                  style={{ ...inputStyle, padding: '12px', cursor: 'pointer' }}
                />
              </Form.Group>

              {/* Image Preview Block */}
              {selectedFiles.length > 0 && (
                <div className="mb-4 d-flex flex-wrap gap-3 p-3 border rounded" style={{ borderColor: colors.borderColor, backgroundColor: colors.lightBackground }}>
                  {selectedFiles.map((fileData, index) => (
                    <div key={fileData.preview} style={{ position: 'relative', width: '100px', height: '100px', border: `1px solid ${colors.borderColor}`, borderRadius: '8px', overflow: 'hidden' }}>
                      <img
                        src={fileData.preview}
                        alt={`Preview ${index}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Button
                        variant="danger"
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          width: '25px',
                          height: '25px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0',
                          fontSize: '0.8rem',
                          lineHeight: '1',
                          backgroundColor: colors.errorText,
                          borderColor: colors.errorText,
                        }}
                      >
                        X
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="vendor-info" style={{ // Changed chef-info to vendor-info
                backgroundColor: colors.lightBackground,
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '25px',
                borderLeft: `4px solid ${colors.primary}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: `${colors.primary}20`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    <svg width="20" height="20" fill={colors.primary}>
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div>
                    <strong>Vendor Information</strong> {/* Changed Chef Information to Vendor Information */}
                    <div style={{ fontSize: '0.9rem', color: colors.placeholderText }}>
                      {vendorId ? `Your Vendor ID: ${vendorId}` : 'No vendor information found'} {/* Updated text */}
                    </div>
                  </div>
                </div>
              </div>

              <motion.div className="d-flex justify-content-end mt-4" whileHover={{ scale: 1.02 }}>
                <Button variant="outline-secondary" onClick={onHide} className="me-3" disabled={isSubmitting} style={buttonStyle.secondary}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting} style={buttonStyle.primary}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Posting...
                    </>
                  ) : (
                    'Post Liquor Product' // Updated button text
                  )}
                </Button>
              </motion.div>
            </Form>
          </motion.div>
        </Modal.Body>
      </Modal>
      {/* Custom Alert Modal */}
      <CustomAlertModal
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={hideAlert}
      />
    </>
  );
}
