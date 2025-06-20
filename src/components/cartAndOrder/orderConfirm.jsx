import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Alert, Form,
  ListGroup, Badge, Spinner
} from 'react-bootstrap';
import {
  FiMapPin, FiClock, FiUser, FiArrowLeftCircle, FiCheckCircle, FiShoppingCart, FiCreditCard, FiDollarSign, FiAlertTriangle, FiCalendar, FiLock
} from 'react-icons/fi'; // Added FiCalendar and FiLock for card fields
import styled, { keyframes, css } from 'styled-components'; // Import styled-components and keyframes
import { TbTruckDelivery } from "react-icons/tb";

// --- Jikoni Express Color Palette ---
const colors = {
  primary: '#FF4532', // Jikoni Red
  secondary: '#00C853', // Jikoni Green (Used for accents)
  darkText: '#1A202C', // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for inputs/page
  cardBackground: '#FFFFFF', // White for the modal background
  borderColor: '#D1D9E6', // Light border for inputs
  errorText: '#EF4444', // Red for errors
  placeholderText: '#A0AFC0', // Muted text for placeholders
  buttonHover: '#E6392B', // Darker red on button hover
  disabledButton: '#CBD5E1', // Gray for disabled buttons
  gradientStart: '#FF6F59', // Lighter red for gradient
  successGreen: '#28A745', // For positive feedback (can use secondary instead)
  // New: Specific light green for input labels
  lightGreenAccent: '#E6F4EA', // A softer, more pastel green
  greenText: '#007A3B', // A slightly darker, richer green for text
  greenBorder: '#00C853', // Jikoni Green for borders
};

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// --- Styled Components ---

const StyledContainer = styled(Container)`
  padding-top: 3rem;
  padding-bottom: 3rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const StyledCard = styled(Card)`
  border: none;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden; /* Ensure header/footer rounded corners */
`;

const CardHeader = styled(Card.Header)`
  background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.gradientStart} 100%);
  color: ${colors.cardBackground};
  border-bottom: none;
  padding: 2rem 2.5rem;
  text-align: center;
  position: relative; /* For the subtle background icon */
  overflow: hidden;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;

  h2 {
    font-weight: 700;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  p {
    font-size: 1.1rem;
    opacity: 0.9;
  }
`;

const HeaderIcon = styled.span`
  font-size: 3.2rem;
  color: rgba(255, 255, 255, 0.8);
`;

const CardBody = styled(Card.Body)`
  padding: 2.5rem;
  background-color: ${colors.cardBackground};
`;

const SectionTitle = styled.h5`
  color: ${colors.darkText};
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.3rem;
`;

const LocationBox = styled.div`
  display: flex;
  align-items: flex-start; /* Align icon to top of text */
  background-color: ${colors.lightBackground};
  padding: 1.25rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  animation: ${slideInUp} 0.5s ease-out forwards;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); /* Subtle inner shadow */

  svg {
    font-size: 1.8rem;
    margin-right: 1rem;
    flex-shrink: 0;
  }
  p {
    margin-bottom: 0.2rem;
    font-weight: 600;
    color: ${colors.darkText};
  }
  small {
    color: ${colors.placeholderText};
    font-size: 0.85rem;
  }
`;

const UserLocationIcon = styled(FiMapPin)`
  color: ${colors.primary};
`;

const ChefLocationIcon = styled(FiMapPin)`
  color: ${colors.secondary};
`;

const StyledAlert = styled(Alert)`
  border-radius: 10px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
`;

const StyledListGroup = styled(ListGroup)`
  border-radius: 12px;
  overflow: hidden;
  margin-top: 1.5rem; /* Space above the list */

  .list-group-item {
    background-color: ${colors.lightBackground};
    border: none;
    border-bottom: 1px solid ${colors.borderColor};
    padding: 1rem 1.5rem;
    font-size: 1rem;
    color: ${colors.darkText};

    &:last-child {
      border-bottom: none;
    }
  }

  .list-group-item div:first-child {
    font-weight: 500;
  }

  .list-group-item .text-muted {
    font-size: 0.9rem;
    margin-top: 0.2rem;
  }
`;

const SummaryItem = styled(ListGroup.Item)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalSummaryItem = styled(SummaryItem)`
  font-weight: 700 !important;
  font-size: 1.25rem !important;
  background-color: ${colors.cardBackground} !important;
  color: ${colors.darkText} !important;
  padding: 1.5rem !important;
  border-top: 2px solid ${colors.borderColor} !important; /* Emphasize total */

  span:last-child {
    color: ${colors.primary};
    font-size: 1.5rem;
  }
`;

const StyledFormSelect = styled(Form.Select)`
  padding: 0.85rem 1.25rem;
  border-radius: 10px;
  border: 1px solid ${colors.borderColor};
  background-color: ${colors.lightBackground};
  font-size: 1rem;
  color: ${colors.darkText};
  transition: all 0.3s ease;
  appearance: none; /* Hide default arrow */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 0.75em 0.75em;

  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2);
    background-color: ${colors.cardBackground};
  }
`;

const StyledFormControl = styled(Form.Control)`
  padding: 0.85rem 1.25rem;
  border-radius: 10px;
  border: 1px solid ${colors.borderColor};
  background-color: ${colors.lightBackground};
  font-size: 1rem;
  color: ${colors.darkText};
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2);
    background-color: ${colors.cardBackground};
  }

  // Green border and shadow for valid inputs
  ${props => props.$isValidated && css`
    border-color: ${colors.greenBorder} !important;
    box-shadow: 0 0 0 3px ${colors.secondary}30 !important;
  `}
`;

// Accent for form labels that have green light
const FormLabelAccent = styled(Form.Label)`
  font-weight: 600;
  color: ${colors.darkText};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem; // Add a bit more space below label

  ${props => props.$addGreenLight && css`
    background-color: ${colors.lightGreenAccent};
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    color: ${colors.greenText};
    font-size: 0.9rem;
    border: 1px solid ${colors.greenBorder};
    box-shadow: 0 2px 5px rgba(0, 200, 83, 0.1);
  `}
`;


const ConfirmButton = styled(Button)`
  background: ${colors.primary};
  border-color: ${colors.primary};
  font-weight: 600;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;

  &:hover {
    background: ${colors.buttonHover};
    border-color: ${colors.buttonHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 69, 50, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    background: ${colors.disabledButton};
    border-color: ${colors.disabledButton};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const BackButton = styled(Button)`
  background: none;
  border: 2px solid ${colors.borderColor};
  color: ${colors.darkText};
  font-weight: 600;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${colors.lightBackground};
    border-color: ${colors.darkText};
    color: ${colors.darkText};
  }
`;

const CardFooter = styled(Card.Footer)`
  background-color: ${colors.cardBackground};
  border-top: none;
  padding: 1.5rem 2.5rem 2.5rem;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
`;

const DELIVERY_BASE_FEE = 50; // Base delivery fee in KSh
const DELIVERY_PER_KM = 15;   // Per kilometer charge
const HANDLING_FEE = 100;     // Handling fee in KSh

const OrderConfirmation = ({ cart, location, onConfirm, onBack, chefLocation }) => {
  const [locationError, setLocationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(''); // Used for M-Pesa

  // New states for card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(DELIVERY_BASE_FEE);


  // Validation states for card fields
  const [isCardNumberValid, setIsCardNumberValid] = useState(false);
  const [isCardNameValid, setIsCardNameValid] = useState(false);
  const [isExpiryDateValid, setIsExpiryDateValid] = useState(false);
  const [isCvcValid, setIsCvcValid] = useState(false);

const subtotal = (cart || []).reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

  const total = subtotal + deliveryFee + HANDLING_FEE;

  // Validation functions (simple for demonstration)
  const validateCardNumber = (num) => /^\d{16}$/.test(num); // Basic 16 digits
  const validateCardName = (name) => name.trim().length > 2;
  const validateExpiryDate = (date) => /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(date) && new Date(2000 + parseInt(date.split('/')[1]), parseInt(date.split('/')[0]) - 1) >= new Date(); // MM/YY and not expired
  const validateCvc = (code) => /^\d{3,4}$/.test(code); // 3 or 4 digits

  useEffect(() => {
    setIsCardNumberValid(validateCardNumber(cardNumber));
  }, [cardNumber]);

  useEffect(() => {
    setIsCardNameValid(validateCardName(cardName));
  }, [cardName]);

useEffect(() => {
  setIsExpiryDateValid(validateExpiryDate(expiryDate));
}, [expiryDate]);

  useEffect(() => {
    setIsCvcValid(validateCvc(cvc));
  }, [cvc]);


  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Calculate delivery fee based on distance
  useEffect(() => {
    if (location && chefLocation) {
      const distance = calculateDistance(
        location.lat,
        location.lng,
        chefLocation.lat,
        chefLocation.lng
      );

      // Round to nearest 0.5 km and calculate fee
      const roundedDistance = Math.round(distance * 2) / 2;
      const fee = DELIVERY_BASE_FEE + (roundedDistance * DELIVERY_PER_KM);
      setDeliveryFee(fee);
    } else {
      // If locations are not available, default to base fee
      setDeliveryFee(DELIVERY_BASE_FEE);
    }
  }, [location, chefLocation]);


  const handleConfirmOrder = () => {
    setIsLoading(true);

    // Frontend validation for card details
    if (paymentMethod === 'card' && (!isCardNumberValid || !isCardNameValid || !isExpiryDateValid || !isCvcValid)) {
      alert('Please fill in all card details correctly.');
      setIsLoading(false);
      return;
    }

    console.log("Confirming order with data:", {
      cart,
      deliveryLocation: location,
      chefLocation,
      paymentMethod,
      phoneNumber: paymentMethod === 'mpesa' ? phoneNumber : undefined,
      cardNumber: paymentMethod === 'card' ? `**** **** **** ${cardNumber.slice(-4)}` : undefined, // Log last 4 digits only
      cardName: paymentMethod === 'card' ? cardName : undefined,
      expiryDate: paymentMethod === 'card' ? expiryDate : undefined,
      cvc: paymentMethod === 'card' ? '***' : undefined, // Never log full CVC
      subtotal,
      deliveryFee,
      handlingFee: HANDLING_FEE,
      total
    });

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onConfirm();
    }, 1500);
  };

  const isFormValid = () => {
    if (!location) return false; // Location must be available

    if (paymentMethod === 'mpesa') {
      return phoneNumber.length > 0;
    } else if (paymentMethod === 'card') {
      return isCardNumberValid && isCardNameValid && isExpiryDateValid && isCvcValid;
    }
    return false; // Default for other payment methods if any
  };


  return (
    <StyledContainer>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <StyledCard>
            <CardHeader>
              <HeaderIcon><FiCheckCircle /></HeaderIcon>
              <h2>Confirm Your Order</h2>
              <p>Just one more step to deliciousness!</p>
            </CardHeader>

            <CardBody>
              {/* Delivery Location Section */}
              <SectionTitle>
                <FiMapPin /> Delivery To
              </SectionTitle>
              {location ? (
                <LocationBox>
                  <UserLocationIcon />
                  <div>
                    <p>{location.address}</p>
                    <small>Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}</small>
                  </div>
                </LocationBox>
              ) : (
                <StyledAlert variant="warning">
                  <FiClock /> <span>Fetching your delivery location...</span>
                </StyledAlert>
              )}
              {locationError && (
                <StyledAlert variant="danger">
                  <FiAlertTriangle /> {locationError}
                </StyledAlert>
              )}

              {/* Chef Location Section */}
              <SectionTitle className="mt-4">
                <FiUser /> From Chef Location
              </SectionTitle>
              {chefLocation ? (
                <LocationBox>
                  <ChefLocationIcon />
                  <div>
                    <p>{chefLocation.area}</p>
                    <small>Lat: {chefLocation.lat.toFixed(6)}, Lng: {chefLocation.lng.toFixed(6)}</small>
                  </div>
                </LocationBox>
              ) : (
                <StyledAlert variant="warning">
                  <FiClock /> <span>Fetching chef location...</span>
                </StyledAlert>
              )}

              {/* Order Summary Section */}
              <SectionTitle className="mt-4">
                <FiShoppingCart /> Order Summary
              </SectionTitle>
              <StyledListGroup variant="flush">
              {(cart || []).map(item => (
  <SummaryItem key={item.id}>
    <div>
      {item.title}
      {item.isPreOrder && (
        <Badge bg="info" className="ms-2">
          Pre-Order
        </Badge>
      )}
                      <span className="text-muted d-block">x {item.quantity}</span>
                    </div>
                    <div>
                      KSh {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </SummaryItem>
                ))}

                <SummaryItem>
                  <span>Subtotal</span>
                  <span>KSh {subtotal.toFixed(2)}</span>
                </SummaryItem>

                <SummaryItem>
                  <span>Delivery Fee <TbTruckDelivery size={16} color={colors.secondary} /></span>
                  <span>KSh {deliveryFee.toFixed(2)}</span>
                </SummaryItem>

                <SummaryItem>
                  <span>Handling Fee <FiDollarSign size={16} color={colors.secondary} /></span>
                  <span>KSh {HANDLING_FEE.toFixed(2)}</span>
                </SummaryItem>

                <TotalSummaryItem>
                  <span>Total</span>
                  <span>KSh {total.toFixed(2)}</span>
                </TotalSummaryItem>
              </StyledListGroup>

              {/* Payment Method Section */}
              <SectionTitle className="mt-4">
                <FiCreditCard /> Payment Method
              </SectionTitle>
              <Form.Group className="mb-3">
                <StyledFormSelect
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Credit/Debit Card</option>
                  {/* You can add more payment options here */}
                </StyledFormSelect>
              </Form.Group>

              {paymentMethod === 'mpesa' && (
                <Form.Group className="mb-3">
                  <FormLabelAccent>M-Pesa Phone Number</FormLabelAccent>
                  <StyledFormControl
                    type="tel"
                    placeholder="e.g., 07XX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </Form.Group>
              )}

              {/* Card Payment Fields with Green Touch */}
              {paymentMethod === 'card' && (
                <>
                  <Form.Group className="mb-3">
                    <FormLabelAccent $addGreenLight={isCardNumberValid}>
                      Card Number
                    </FormLabelAccent>
                    <StyledFormControl
                      type="text"
                      placeholder="e.g., 1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))} // Remove spaces for validation
                      maxLength={16}
                      isInvalid={!isCardNumberValid && cardNumber.length > 0}
                      isValid={isCardNumberValid}
                      $isValidated={isCardNumberValid} // Apply green styling when valid
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid 16-digit card number.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <FormLabelAccent $addGreenLight={isCardNameValid}>
                      Cardholder Name
                    </FormLabelAccent>
                    <StyledFormControl
                      type="text"
                      placeholder="e.g., Jane Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      isInvalid={!isCardNameValid && cardName.length > 0}
                      isValid={isCardNameValid}
                      $isValidated={isCardNameValid} // Apply green styling when valid
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter the cardholder's name.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <CardGrid className="mb-3">
                    <Form.Group as={Col}>
                      <FormLabelAccent $addGreenLight={isExpiryDateValid}>
                        <FiCalendar size={16} /> Expiry Date (MM/YY)
                      </FormLabelAccent>
                      <StyledFormControl
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        maxLength={5} // MM/YY (5 characters including '/')
                        isInvalid={!isExpiryDateValid && expiryDate.length > 0}
                        isValid={isExpiryDateValid}
                        $isValidated={isExpiryDateValid} // Apply green styling when valid
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Enter a valid MM/YY format (e.g., 12/26) and not expired.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col}>
                      <FormLabelAccent $addGreenLight={isCvcValid}>
                        <FiLock size={16} /> CVC
                      </FormLabelAccent>
                      <StyledFormControl
                        type="text"
                        placeholder="e.g., 123"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        maxLength={4}
                        isInvalid={!isCvcValid && cvc.length > 0}
                        isValid={isCvcValid}
                        $isValidated={isCvcValid} // Apply green styling when valid
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Enter a valid 3 or 4-digit CVC.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </CardGrid>
                </>
              )}
            </CardBody>

            <CardFooter>
              <div className="d-grid gap-3">
                <ConfirmButton
                  onClick={handleConfirmOrder}
                  disabled={isLoading || !location || !isFormValid()} // Updated disabled logic
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle size={20} /> Confirm Order
                    </>
                  )}
                </ConfirmButton>

                <BackButton
                  onClick={onBack}
                  disabled={isLoading}
                >

                  <FiArrowLeftCircle size={20} /> Back to Cart



                  
                </BackButton>
              </div>
            </CardFooter>
          </StyledCard>
        </Col>
      </Row>
    </StyledContainer>
  );
};

export default OrderConfirmation;