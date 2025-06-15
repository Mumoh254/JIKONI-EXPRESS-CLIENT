import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const colors = {
  primary: '#06b10f',
  lightBackground: '#f8f9fa',
  cardBackground: '#ffffff',
  darkText: '#212529',
  placeholderText: '#6c757d',
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

export default function FoodPostForm({ show, onHide, setFoods }) {
  const [chefId, setChefId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]); // State to hold selected files and their previews

  useEffect(() => {
    const userData = localStorage.getItem('chefId');
    if (userData) setChefId(userData);
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
      Swal.fire({
        icon: 'error',
        title: 'Image Limit Exceeded',
        text: `You can select up to 3 images. You have already selected ${selectedFiles.length}.`,
        confirmButtonColor: colors.primary,
      });
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

    if (selectedFiles.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Images Selected',
        text: 'Please select at least one image for your food post.',
        confirmButtonColor: colors.primary,
      });
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('chefId', chefId);
    formData.append('title', e.target.title.value);
    formData.append('price', e.target.price.value);
    formData.append('description', e.target.description.value);
    formData.append('mealType', e.target.mealType.value);
    formData.append('area', e.target.area.value);

    // Append each selected image file
    selectedFiles.forEach(fileData => {
      formData.append('images', fileData.file);
    });

    try {
      const response = await fetch("https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/create/food", {
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
        setFoods(data); // Or use setFoods((prev) => [...prev, data]) if appending
        onHide();
        // Clear selected files after successful submission
        selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
        setSelectedFiles([]); 
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

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
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
                  <Form.Control name="title" required placeholder="e.g. Spicy Chicken Tikka" style={inputStyle} />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label>Price (KES)</Form.Label>
                  <Form.Control name="price" type="number" min="1" required placeholder="e.g. 850" style={inputStyle} />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control name="description" as="textarea" rows={3} required placeholder="Describe your dish..." style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label>Meal Type</Form.Label>
                  <Form.Control name="mealType" as="select" required style={inputStyle}>
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
                  <Form.Label>Area</Form.Label>
                  <Form.Control name="area" required placeholder="e.g. Westlands, Nairobi" style={inputStyle} />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-4">
              <Form.Label>
                Food Images <span style={{ fontWeight: 500 }}>(Max 3)</span>
              </Form.Label>
              <Form.Control
                name="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange} // Use the new handler
                required={selectedFiles.length === 0} // Make required only if no files are selected
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

            <div className="chef-info" style={{
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
                  <strong>Chef Information</strong>
                  <div style={{ fontSize: '0.9rem', color: colors.placeholderText }}>
                    {chefId ? `Your chef ID: ${chefId}` : 'No chef information found'}
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
                  'Post Food'
                )}
              </Button>
            </motion.div>
          </Form>
        </motion.div>
      </Modal.Body>
    </Modal>
  );
}