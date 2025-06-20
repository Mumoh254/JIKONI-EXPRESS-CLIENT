import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { LuChefHat, LuScooter, LuShoppingCart } from 'react-icons/lu'; // Modern and sleek Lucide React icons
import { GiKenya } from 'react-icons/gi'; // Keeping GiKenya as it's unique
import styled, { css } from 'styled-components'; // Import css for conditional styling
import { RiMotorbikeFill } from 'react-icons/ri';
// --- Jikoni Express Color Palette (ensure this is consistent or imported globally) ---
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
    lightGrey: '#e0e0e0', // A soft light grey for subtle backgrounds
    darkGrey: '#4A5568', // Darker grey for secondary text
};

// --- Styled Components for Header ---

const HeaderContainer = styled.header`
    background: ${colors.cardBackground}; /* White background */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* Soft, modern shadow */
    position: sticky; /* Sticky header */
    top: 0;
    width: 100%;
    z-index: 999; /* Ensure it stays above most content */
    font-family: 'Inter', sans-serif; /* Consistent font */
    padding: 0.8rem 1rem; /* Adjusted padding */

    @media (min-width: 768px) {
        padding: 1rem 2rem; /* Larger padding on desktop */
    }
`;

const HeaderContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px; /* Max width for content, common for web apps */
    margin: 0 auto; /* Center content */
`;

const BrandSection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem; /* Space between icon and text */

    @media (min-width: 768px) {
        gap: 0.75rem;
    }
`;

const BrandIcon = styled.span`
    display: flex; /* Ensures icon is centered */
    align-items: center;
    justify-content: center;
    font-size: 1.8rem; /* Icon size */
    color: ${colors.primary}; /* Jikoni Red */
    filter: drop-shadow(0 2px 3px rgba(255, 69, 50, 0.2)); /* Subtle shadow for depth */

    @media (min-width: 768px) {
        font-size: 2.2rem;
    }
`;

const BrandTitle = styled.h1`
    margin: 0;
    font-size: 1.6rem; /* Title font size */
    font-weight: 800; /* Extra bold */
    letter-spacing: -0.04em; /* Tighten spacing */
    color: ${colors.darkText};

    span {
        color: ${colors.primary}; /* Default for 'Jikoni' */
    }

    .express-text {
        color: ${colors.darkText}; /* 'Express' darker for contrast */
        margin-left: 0.2rem; /* Small space */
    }

    @media (min-width: 768px) {
        font-size: 2rem;
    }
`;

const ActionButtonsGroup = styled.div`
    display: flex;
    gap: 0.5rem; /* Space between buttons */
    align-items: center;

    @media (min-width: 768px) {
        gap: 0.75rem;
    }
`;

// Styled component for the Bootstrap Button, allowing custom styles
const StyledButton = styled(Button)`
    border-radius: 9999px; /* Fully rounded pill shape */
    padding: 0.4rem 1rem; /* Compact padding */
    font-size: 0.85rem; /* Smaller font size */
    font-weight: 600;
    transition: all 0.2s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center; /* Center content horizontally */
    gap: 0.3rem; /* Space between icon and text */
    white-space: nowrap; /* Prevent text wrapping */

    /* Conditional styling for variants */
    ${props => props.$variant === 'primary' && css`
        background-color: ${colors.primary};
        color: ${colors.cardBackground};
        border-color: ${colors.primary};
        &:hover {
            background-color: ${colors.buttonHover};
            border-color: ${colors.buttonHover};
            transform: translateY(-1px);
        }
        &:active {
            transform: translateY(0);
        }
    `}

    ${props => props.$variant === 'outline-primary' && css`
        background-color: transparent;
        color: ${colors.primary};
        border-color: ${colors.primary};
        &:hover {
            background-color: ${colors.primary};
            color: ${colors.cardBackground};
        }
    `}

    ${props => props.$variant === 'outline-success' && css`
        background-color: transparent;
        color: ${colors.secondary};
        border-color: ${colors.secondary};
        &:hover {
            background-color: ${colors.secondary};
            color: ${colors.cardBackground};
        }
    `}

    ${props => props.$variant === 'danger' && css`
        background-color: ${colors.errorText};
        color: ${colors.cardBackground};
        border-color: ${colors.errorText};
        &:hover {
            background-color: #d13030;
            border-color: #d13030;
            transform: translateY(-1px);
        }
    `}

    ${props => props.$variant === 'warning' && css`
        background-color: #FFC107; /* Standard Bootstrap warning yellow */
        color: ${colors.darkText};
        border-color: #FFC107;
        &:hover {
            background-color: #e0a800;
            border-color: #e0a800;
            transform: translateY(-1px);
        }
    `}

    /* Icon styling within buttons */
    svg {
        font-size: 1.1rem; /* Icon size in buttons */
        margin-right: 0.2rem; /* Small space before text */
        
        @media (max-width: 767px) {
            margin-right: 0; /* Remove margin on mobile for icon-only buttons */
            font-size: 1.2rem; /* Slightly larger icon on mobile for standalone buttons */
        }
    }

    /* Hide text on small screens, show icon only */
    .button-text-mobile-hide {
        @media (max-width: 767px) {
            display: none;
        }
    }
`;

const CartBadge = styled.span`
    position: absolute;
    top: -5px; /* Adjust badge position */
    right: -5px; /* Adjust badge position */
    transform: translate(50%, -50%);
    background-color: ${colors.errorText}; /* Red for cart count */
    color: ${colors.cardBackground};
    border-radius: 9999px; /* Fully rounded */
    padding: 2px 7px; /* Small padding */
    font-size: 0.7rem; /* Small font size */
    font-weight: 700;
    min-width: 20px; /* Ensure circular shape for single digits */
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Subtle shadow */
    z-index: 10; /* Ensure badge is above button */
`;


// --- Header Component ---
function Header({ state, setState }) { // Assuming state and setState are passed as props
    // Example: how you might get state/setState from a context if this were a child component
    // const { state, setState } = useContext(YourAppContext);
    // Or if it's the root App component, state would be managed directly.

    const cartItemCount = state.cart ? state.cart.reduce((sum, i) => sum + i.quantity, 0) : 0;

    return (
        <HeaderContainer>
            <HeaderContent>
                {/* Logo and Brand Title */}
                <BrandSection>
                    <BrandIcon>
                        <GiKenya />
                    </BrandIcon>
                    <BrandTitle>
                        <span>Jikoni</span>
                        <span className="express-text">Express</span>
                    </BrandTitle>
                </BrandSection>

                {/* Action Buttons */}
                <ActionButtonsGroup>
                    {!state.isChefMode && !state.isRiderMode && (
                        <>
                            <StyledButton
                                $variant="outline-primary" // Use the custom prop for styled-components
                                onClick={() => setState(s => ({ ...s, showChefReg: true }))}
                            >
                                <LuChefHat />
                                <span className="button-text-mobile-hide">Chef</span>
                            </StyledButton>
                            <StyledButton
                                $variant="outline-success"
                                onClick={() => setState(s => ({ ...s, showRiderReg: true }))}
                            >
                                <LuScooter />
                                <span className="button-text-mobile-hide">Rider</span>
                            </StyledButton>
                        </>
                    )}
                    {state.isChefMode && (
                        <StyledButton
                            $variant="danger"
                            onClick={() => {
                                localStorage.removeItem('chefId'); // Example of exiting mode
                                setState(s => ({ ...s, isChefMode: false }));
                            }}
                        >
                            <span className="button-text-mobile-hide">Exit Chef Mode</span>
                            <span className="d-md-none">Exit</span> {/* Show "Exit" on small screens */}
                        </StyledButton>
                    )}
                    {state.isRiderMode && ( // Added Rider Exit Mode for completeness
                        <StyledButton
                            $variant="danger"
                            onClick={() => {
                                localStorage.removeItem('riderId'); // Example of exiting mode
                                setState(s => ({ ...s, isRiderMode: false }));
                            }}
                        >
                            <span className="button-text-mobile-hide">Exit Rider Mode</span>
                            <span className="d-md-none">Exit</span>
                        </StyledButton>
                    )}

                    {/* Cart Button */}
                    <StyledButton
                        $variant="warning"
                        onClick={() => setState(s => ({ ...s, showCart: true }))}
                        style={{ position: 'relative' }} /* Required for absolute badge positioning */
                    >
                        <LuShoppingCart />
                        <span className="button-text-mobile-hide">Cart</span>
                        {cartItemCount > 0 && (
                            <CartBadge>
                                {cartItemCount}
                                <span className="visually-hidden">items in cart</span>
                            </CartBadge>
                        )}
                    </StyledButton>
                </ActionButtonsGroup>
            </HeaderContent>
        </HeaderContainer>
    );
}

export default Header;
