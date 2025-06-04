import React, { useState } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import {
  FiPlusCircle, FiTag, FiShoppingBag, FiPercent, FiBox, FiDollarSign,
  FiFileText, FiStar, FiImage, FiZap
} from 'react-icons/fi'; // Icons for various inputs
import styled, { keyframes } from 'styled-components';
import axios from 'axios'; // Import axios for API call
import Swal from 'sweetalert2'; // Import SweetAlert2 for notifications

// --- Jikoni Express Color Palette ---
const colors = {
  primary: '#FF4532', // Jikoni Red
  secondary: '#00C853', // Jikoni Green
  darkText: '#1A202C', // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for inputs/page
  cardBackground: '#FFFFFF', // White for the modal background
  borderColor: '#D1D9E6', // Light border for inputs
  errorText: '#EF4444', // Red for errors
  placeholderText: '#A0AEC0', // Muted text for placeholders
  buttonHover: '#E6392B', // Darker red on button hover
  disabledButton: '#CBD5E1', // Gray for disabled buttons
  gradientStart: '#FF6F59', // Lighter red for gradient
  successGreen: '#28A745', // For positive feedback
};

// --- Animations ---
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const StyledModalHeader = styled(Modal.Header)`
  background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.gradientStart} 100%);
  color: ${colors.cardBackground};
  border-bottom: none;
  padding: 1.8rem 2.5rem;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  position: relative;
  overflow: hidden;

  .modal-title {
    font-weight: 700;
    font-size: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .btn-close {
    filter: invert(1) grayscale(100%) brightness(200%);
    font-size: 1.2rem;
    &:hover {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }
`;

const StyledModalBody = styled(Modal.Body)`
  padding: 2.5rem;
  background-color: ${colors.cardBackground};
  animation: ${slideIn} 0.5s ease-out;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`;

const FormGroup = styled(Form.Group)`
  margin-bottom: 1.75rem;
  position: relative;

  label {
    font-weight: 600;
    color: ${colors.darkText};
    margin-bottom: 0.6rem;
    display: block;
    font-size: 0.98rem;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 68%;
  left: 1rem;
  transform: translateY(-50%);
  color: ${colors.placeholderText};
  font-size: 1.2rem;
`;

const InputField = styled(Form.Control)`
  width: 100%;
  padding: 0.95rem 1rem 0.95rem 3rem;
  border: 1px solid ${colors.borderColor};
  border-radius: 10px;
  font-size: 1.05rem;
  color: ${colors.darkText};
  background-color: ${colors.lightBackground};
  transition: all 0.3s ease;

  &::placeholder {
    color: ${colors.placeholderText};
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2);
    background-color: ${colors.cardBackground};
  }

  &[as="textarea"] {
    min-height: 100px;
    padding-top: 1rem;
    padding-bottom: 1rem;
    line-height: 1.5;
  }
`;

const SelectField = styled(Form.Select)`
  width: 100%;
  padding: 0.95rem 1rem 0.95rem 3rem;
  border: 1px solid ${colors.borderColor};
  border-radius: 10px;
  font-size: 1.05rem;
  color: ${colors.darkText};
  background-color: ${colors.lightBackground};
  appearance: none;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2);
    background-color: ${colors.cardBackground};
  }
`;

const SubmitButton = styled(Button)`
  width: 100%;
  padding: 1rem;
  background: ${colors.primary};
  color: ${colors.cardBackground};
  border: none;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;

  &:hover {
    background: ${colors.buttonHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 69, 50, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    background: ${colors.disabledButton};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const HeaderIcon = styled.span`
  font-size: 2.8rem;
  color: ${colors.cardBackground};
`;

const CATEGORIES = [
  "Vodka", "Whiskey", "Gin", "Rum", "Tequila", "Brandy", "Liqueurs",
  "Beer", "Wine", "Cider", "Cocktail Mixers", "Non-Alcoholic Beverages"
];

const BASE_API_URL = "YOUR_BACKEND_API_BASE_URL"; // IMPORTANT: Replace with your actual backend API base URL

const ListLiquorProductModal = ({ show, onClose }) => {
  const [submitting, setSubmitting] = useState(false);

  const showAlert = (type, message) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.target);
    const photoUrls = formData.get('photoUrls').split(',').map(url => url.trim()).filter(url => url !== '');

    const productData = {
      // id: Date.now(), // Consider generating ID on backend or using a UUID for robustness
      title: formData.get('title'),
      brand: formData.get('brand'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price')),
      alcoholPercentage: parseFloat(formData.get('alcoholPercentage')),
      volume: parseFloat(formData.get('volume')),
      description: formData.get('description'),
      // rating: parseFloat(formData.get('rating')) || 0, // Optional rating from vendor, default to 0
      // createdAt: new Date().toISOString(), // Backend should handle this
      photoUrls: photoUrls.length > 0 ? photoUrls : ["https://via.placeholder.com/300x300?text=No+Image"], // Provide a default if no URL
    };

    // Basic validation
    if (!productData.title || !productData.brand || !productData.category || isNaN(productData.price) || !productData.description) {
      showAlert('error', 'Please fill in all required fields correctly.');
      setSubmitting(false);
      return;
    }

    try {
      // You might need to send a vendor ID or token with this request
      // const token = localStorage.getItem('token'); // Assuming you store a vendor token
      const response = await axios.post(`${BASE_API_URL}/products/liquor`, productData, {
        // headers: {
        //   Authorization: `Bearer ${token}`
        // }
      });
      showAlert('success', 'Liquor product listed successfully!');
      console.log('Product listed:', response.data);
      onClose(); // Close modal on success
      e.target.reset(); // Clear form
    } catch (error) {
      console.error('Error listing liquor product:', error.response?.data || error.message);
      showAlert('error', error.response?.data?.message || 'Failed to list product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <StyledModalHeader closeButton>
        <Modal.Title>
          <HeaderIcon><FiPlusCircle /></HeaderIcon>
          List New Liquor Product
        </Modal.Title>
      </StyledModalHeader>
      <StyledModalBody>
        <p className="text-muted text-center mb-4">
          Add a new liquor product to your store on Jikoni Express. Fill in all details carefully!
        </p>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <FormGroup>
                <Form.Label>Product Title</Form.Label>
                <IconWrapper><FiTag /></IconWrapper>
                <InputField name="title" type="text" placeholder="e.g., Grey Goose Vodka" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Brand</Form.Label>
                <IconWrapper><FiShoppingBag /></IconWrapper>
                <InputField name="brand" type="text" placeholder="e.g., Grey Goose" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Category</Form.Label>
                <IconWrapper><FiBox /></IconWrapper>
                <SelectField name="category" required>
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </SelectField>
              </FormGroup>

              <FormGroup>
                <Form.Label>Price (KSH)</Form.Label>
                <IconWrapper><FiDollarSign /></IconWrapper>
                <InputField name="price" type="number" step="0.01" min="0" placeholder="e.g., 4500.00" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Alcohol Percentage (%)</Form.Label>
                <IconWrapper><FiPercent /></IconWrapper>
                <InputField name="alcoholPercentage" type="number" step="0.1" min="0" max="100" placeholder="e.g., 40.0" required />
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup>
                <Form.Label>Volume (ml)</Form.Label>
                <IconWrapper><FiZap /></IconWrapper> {/* Or FiBox for volume */}
                <InputField name="volume" type="number" min="1" placeholder="e.g., 1000 (for 1 Liter)" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Description</Form.Label>
                <IconWrapper><FiFileText /></IconWrapper>
                <InputField name="description" as="textarea" rows={4} placeholder="Crafted from the finest French ingredients. Exceptionally smooth..." required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Photo URLs (comma separated)</Form.Label>
                <IconWrapper><FiImage /></IconWrapper>
                <InputField
                  name="photoUrls"
                  type="text"
                  placeholder="e.g., url1.jpg, url2.png"
                  defaultValue="https://www.oaks.delivery/wp-content/uploads/image-49-300x300.png" // Default image for demo
                />
              </FormGroup>

              {/* Optional: Vendor could set an initial rating, or backend could start at 0 */}
              {/* <FormGroup>
                <Form.Label>Initial Rating (0-5)</Form.Label>
                <IconWrapper><FiStar /></IconWrapper>
                <InputField name="rating" type="number" step="0.1" min="0" max="5" placeholder="e.g., 4.6" />
              </FormGroup> */}
            </div>
          </div>

          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Listing Product...</span>
              </>
            ) : (
              'Add Liquor Product'
            )}
          </SubmitButton>
        </Form>
      </StyledModalBody>
    </Modal>
  );
};

export default ListLiquorProductModal;