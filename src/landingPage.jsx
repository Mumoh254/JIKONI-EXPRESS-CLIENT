import React, { useState } from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import {
    FiCamera,
    FiDollarSign,
    FiMapPin,
    FiPhone,
    FiMail,
    FiHelpCircle,
    FiCheckCircle,
    FiUsers,
} from 'react-icons/fi';
import { FaUserTie, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaApple, FaGooglePlay } from 'react-icons/fa';

import { Link, NavLink } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import food2Image from '/images/food2.png'; // Ensure this path is correct for your project
import Swal from 'sweetalert2'; // For elegant pop-ups

// --- Updated Color Variables ---
const colors = {
    primary: '#FF4532', // Jikoni Red - still vibrant but slightly refined
    secondary: '#00C853', // Jikoni Green - for accents
    darkText: '#2C3E50', // Darker, softer text for better readability
    lightGray: '#F9FAFB', // Very light background for sections
    mediumGray: '#E0E0E0', // Subtle borders/dividers
    white: '#FFFFFF',
    placeholderText: '#7F8C8D', // For muted text
    accentBlue: '#3498DB', // A new accent color for variety
};

// --- Animations ---
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
`;

const scaleUp = keyframes`
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
`;

// --- General Page Layout ---
const PageContainer = styled(Container)`
    font-family: 'Poppins', sans-serif; /* A clean, modern sans-serif font */
    background-color: ${colors.lightGray};
    padding: 0;
    overflow-x: hidden;
`;

// --- Styled Components ---

// Header Styling
const StyledHeader = styled.header`
    background: ${colors.white}; /* Clean white header */
    padding: 1.2rem 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 15px rgba(0,0,0,0.08); /* Softer shadow */
    position: sticky;
    top: 0;
    z-index: 1000;
    border-bottom: 1px solid ${colors.mediumGray}; /* Subtle bottom border */

    @media (max-width: 992px) {
        padding: 1rem 1.5rem;
        flex-wrap: wrap;
        justify-content: center;
        text-align: center;
    }

    .logo-container {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        @media (max-width: 992px) {
            margin-bottom: 1rem;
            width: 100%;
            justify-content: center;
        }
    }

    .logo-icon {
        width: 48px; /* Slightly larger */
        height: 48px;
        border-radius: 12px; /* More modern rounded square */
        background-color: ${colors.primary};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.6rem;
        color: ${colors.white};
        box-shadow: 0 4px 10px rgba(0,0,0,0.15); /* More prominent shadow for logo */
    }

    .brand-name {
        font-size: 1.8rem; /* Larger brand name */
        font-weight: 800;
        color: ${colors.darkText};
        span {
            color: ${colors.primary};
        }
        @media (max-width: 576px) {
            font-size: 1.6rem;
        }
    }

    nav {
        display: flex;
        gap: 2rem; /* Increased spacing */
        @media (max-width: 992px) {
            display: none;
        }
        a {
            color: ${colors.placeholderText};
            font-weight: 500;
            transition: color 0.3s ease, transform 0.2s ease;
            text-decoration: none;
            font-size: 1.05rem; /* Slightly larger nav links */
            &:hover {
                color: ${colors.primary};
                transform: translateY(-2px);
            }
            &.active {
                color: ${colors.primary};
                border-bottom: 3px solid ${colors.primary}; /* Thicker active indicator */
                padding-bottom: 5px;
            }
        }
    }

    .download-button {
        background-color: ${colors.primary};
        color: ${colors.white};
        padding: 0.7rem 1.8rem;
        border-radius: 8px; /* Modern rounded corners */
        font-weight: 600;
        transition: all 0.3s ease;
        border: none;
        font-size: 1rem;
        &:hover {
            background-color: #E6392B;
            transform: translateY(-3px); /* Subtle lift */
            box-shadow: 0 6px 15px rgba(0,0,0,0.2);
        }
        @media (max-width: 992px) {
            display: none;
        }
    }

    .mobile-menu-button {
        color: ${colors.darkText}; /* Darker icon for contrast */
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        display: none;
        &:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.3);
        }
        @media (max-width: 992px) {
            display: block;
            position: absolute;
            right: 1.5rem;
            top: 50%;
            transform: translateY(-50%);
        }
        @media (max-width: 768px) {
            position: static;
            margin-left: auto;
        }
    }
`;

// Main Hero Section (Completely redesigned for impact)
const MainHeroSection = styled.section`
    background: ${colors.white}; /* Clean white background */
    padding: 8rem 1rem; /* More generous padding */
    text-align: left; /* Text aligns to the left */
    animation: ${fadeIn} 1s ease-out;
    overflow: hidden; /* Ensure image overflow doesn't cause scroll */

    @media (max-width: 768px) {
        padding: 6rem 1rem;
        text-align: center; /* Center on mobile */
    }

    .hero-content {
        display: flex;
        flex-direction: row;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;

        @media (max-width: 992px) {
            flex-direction: column; /* Stack on smaller screens */
        }
    }

    .text-column {
        flex: 1;
        padding-right: 3rem; /* Space between text and image */
        animation: ${slideInLeft} 1s ease-out;

        @media (max-width: 992px) {
            padding-right: 0;
            margin-bottom: 2rem;
        }
    }

    h1 {
        font-size: 3.8rem; /* Larger, more impactful heading */
        font-weight: 800;
        margin-bottom: 1.5rem;
        line-height: 1.2;
        color: ${colors.darkText};
        span {
            color: ${colors.primary};
        }
        @media (min-width: 768px) {
            font-size: 4.5rem;
        }
        @media (max-width: 576px) {
            font-size: 2.8rem;
        }
    }

    p {
        font-size: 1.2rem; /* Larger body text */
        max-width: 600px; /* Constrain width for readability */
        margin-bottom: 3rem;
        color: ${colors.placeholderText}; /* Soft gray for body copy */
        line-height: 1.6;

        @media (max-width: 992px) {
            margin: 0 auto 2rem; /* Center on mobile */
        }
        @media (max-width: 576px) {
            font-size: 1rem;
        }
    }

    .hero-buttons {
        display: flex;
        gap: 1.5rem; /* More space between buttons */
        flex-wrap: wrap; /* Allow wrapping on small screens */

        @media (max-width: 992px) {
            justify-content: center;
        }

        .btn {
            padding: 1rem 2.5rem; /* Generous button padding */
            font-size: 1.1rem;
            font-weight: 600;
            border-radius: 10px; /* Softly rounded buttons */
            transition: all 0.3s ease;
            min-width: 200px; /* Ensure minimum width */
            text-align: center;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem; /* Space for icons */

            &:hover {
                transform: translateY(-5px); /* More pronounced lift */
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
        }
        .btn-primary-filled {
            background-color: ${colors.primary};
            border: 2px solid ${colors.primary};
            color: ${colors.white};
            &:hover {
                background-color: #E6392B;
                border-color: #E6392B;
            }
        }
        .btn-secondary-outline {
            background-color: transparent;
            border: 2px solid ${colors.mediumGray}; /* Subtle border */
            color: ${colors.darkText};
            &:hover {
                background-color: ${colors.lightGray};
                border-color: ${colors.darkText};
            }
        }
    }

    .image-column {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: ${slideInRight} 1s ease-out;

        @media (max-width: 992px) {
            width: 100%; /* Full width on mobile */
        }

        img {
            max-width: 100%;
            height: auto;
            border-radius: 15px; /* Subtle rounded corners for image */
            box-shadow: 0 15px 40px rgba(0,0,0,0.25); /* Stronger shadow for depth */
        }
    }
`;

// Features Section Styling
const FeaturesSection = styled.section`
    padding: 6rem 1rem; /* More padding */
    background: ${colors.lightGray}; /* Light gray background */
    text-align: center;
    animation: ${fadeIn} 1s ease-out;

    @media (min-width: 768px) {
        padding: 8rem 1rem;
    }

    h2 {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 1rem;
        color: ${colors.darkText};
        span {
            color: ${colors.primary};
        }
        @media (max-width: 768px) {
            font-size: 2.5rem;
        }
    }

    p.subtitle {
        font-size: 1.1rem;
        color: ${colors.placeholderText};
        max-width: 700px;
        margin: 0 auto 4rem;
        line-height: 1.7;
    }

    .feature-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2.5rem; /* Generous padding */
        background: ${colors.white};
        border-radius: 15px; /* More rounded */
        box-shadow: 0 8px 30px rgba(0,0,0,0.08); /* Softer, deeper shadow */
        transition: all 0.4s ease; /* Slower, smoother transition */
        height: 100%;
        margin-bottom: 2rem; /* Consistent spacing in grid */

        &:hover {
            transform: translateY(-12px); /* More pronounced lift */
            box-shadow: 0 15px 45px rgba(0,0,0,0.15);
        }

        .icon-wrapper {
            padding: 1.5rem; /* Larger icon area */
            border-radius: 50%;
            margin-bottom: 2rem; /* More space below icon */
            display: flex;
            align-items: center;
            justify-content: center;
            width: 90px;
            height: 90px;
            box-shadow: 0 6px 15px rgba(0,0,0,0.15); /* More prominent shadow */
            svg {
                font-size: 3.5rem; /* Larger icons */
                color: ${colors.white};
            }
            &.primary-bg { background-color: ${colors.primary}; }
            &.secondary-bg { background-color: ${colors.secondary}; }
            &.accent-bg { background-color: ${colors.accentBlue}; } /* New accent color */
        }

        h4 {
            font-size: 1.8rem; /* Larger heading */
            font-weight: 700;
            margin-bottom: 1rem;
            color: ${colors.darkText};
        }

        p {
            color: ${colors.placeholderText};
            font-size: 1.05rem; /* Slightly larger body text */
            line-height: 1.8;
        }
    }
`;

// Secondary Hero Section (Turn Your Kitchen into Income Source)
const SecondaryHeroSection = styled.div`
    background: linear-gradient(135deg, ${colors.darkText} 0%, rgba(44,62,80,0.8) 100%),
                url(${food2Image});
    background-size: cover;
    background-position: center;
    color: ${colors.white};
    padding: 6rem 1rem; /* More padding */
    text-align: center;
    margin: 0; /* Full width */
    box-shadow: inset 0 0 50px rgba(0,0,0,0.5); /* Inner shadow for depth */
    animation: ${fadeIn} 1s ease-out;

    @media (max-width: 768px) {
        padding: 4rem 1rem;
    }

    h2 { /* Changed from h1 to h2 for semantic hierarchy */
        font-size: 3.5rem; /* Larger, more impactful */
        font-weight: 800;
        margin-bottom: 1.5rem;
        line-height: 1.2;
        text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
        span {
            color: ${colors.primary};
        }
        @media (min-width: 768px) {
            font-size: 4rem;
        }
        @media (max-width: 576px) {
            font-size: 2.5rem;
        }
    }

    p {
        font-size: 1.2rem;
        max-width: 900px;
        margin: 0 auto 3rem;
        color: rgba(255,255,255,0.9);
        line-height: 1.7;
        @media (max-width: 576px) {
            font-size: 1rem;
        }
    }

    .hero-buttons {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        @media (min-width: 576px) {
            flex-direction: row;
            justify-content: center;
        }
        .btn {
            padding: 1rem 2.5rem;
            font-size: 1.1rem;
            font-weight: 600;
            border-radius: 10px;
            transition: all 0.3s ease;
            min-width: 250px;
            text-align: center;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;

            &:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            }
        }
        .btn-light-styled {
            background-color: ${colors.white};
            border: 2px solid ${colors.white};
            color: ${colors.primary};
            &:hover {
                background-color: ${colors.lightGray};
                border-color: ${colors.lightGray};
            }
        }
        .btn-outline-light-styled {
            background-color: transparent;
            border: 2px solid ${colors.white};
            color: ${colors.white};
            &:hover {
                background-color: rgba(255,255,255,0.15);
            }
        }
    }
`;

// Animated Value Card (Renamed to `BenefitCard` for clarity)
const BenefitCard = styled.div`
    background: ${colors.white};
    border-radius: 15px;
    padding: 2.5rem;
    text-align: center;
    transition: all 0.4s ease;
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    opacity: 0;
    animation: ${scaleUp} 0.8s ease-out ${props => props.delay}s forwards; /* Scale up animation */
    margin-bottom: 2rem;

    &:hover {
        transform: translateY(-10px) scale(1.02); /* Lift and slight scale */
        box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    }

    svg {
        font-size: 4rem; /* Even larger icons */
        color: ${colors.primary};
        margin-bottom: 1.8rem;
    }

    h3 {
        color: ${colors.darkText};
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }

    p {
        color: ${colors.placeholderText};
        font-size: 1.05rem;
        line-height: 1.8;
    }
`;

// Benefit Grid
const BenefitGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem; /* More gap */
    padding: 6rem 1rem;
    max-width: 1200px;
    margin: 0 auto;

    @media (min-width: 768px) {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        padding: 8rem 1rem;
    }
`;

// Animated Step Card
const StepCard = styled.div`
    background: ${colors.white};
    border-radius: 15px;
    padding: 2.5rem 2rem;
    text-align: center;
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    transition: all 0.4s ease;
    opacity: 0;
    animation: ${fadeIn} 1s ease-out ${props => props.delay}s forwards;
    height: 100%;
    margin-bottom: 2rem;

    &:hover {
        transform: translateY(-10px);
        box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    }

    .step-number {
        width: 75px; /* Larger circle */
        height: 75px;
        background: ${colors.primary};
        color: ${colors.white};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 2rem;
        font-weight: 700;
        font-size: 2.2rem; /* Larger number */
        box-shadow: 0 6px 15px rgba(0,0,0,0.2);
    }

    h4 {
        color: ${colors.darkText};
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }

    p {
        color: ${colors.placeholderText};
        font-size: 1.05rem;
        line-height: 1.8;
    }
`;

// How It Works Section
const HowItWorksSection = styled.section`
    background: ${colors.lightGray};
    padding: 6rem 1rem;
    text-align: center;
    animation: ${fadeIn} 1s ease-out;

    @media (min-width: 768px) {
        padding: 8rem 1rem;
    }

    h2 {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 1rem;
        color: ${colors.darkText};
        span {
            color: ${colors.primary};
        }
        @media (max-width: 768px) {
            font-size: 2.5rem;
        }
    }

    p.subtitle {
        font-size: 1.1rem;
        color: ${colors.placeholderText};
        max-width: 700px;
        margin: 0 auto 4rem;
        line-height: 1.7;
    }
`;

// Call to Action Section
const CtaSection = styled.section`
    background: linear-gradient(135deg, ${colors.primary} 0%, #E6392B 100%); /* Stronger red gradient */
    padding: 6rem 1rem;
    text-align: center;
    color: ${colors.white};
    margin: 0; /* Full width */
    box-shadow: inset 0 0 50px rgba(0,0,0,0.5); /* Inner shadow */
    animation: ${fadeIn} 1s ease-out;

    @media (min-width: 768px) {
        padding: 8rem 1rem;
    }

    h2 {
        font-size: 3.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        line-height: 1.2;
        text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
        @media (min-width: 768px) {
            font-size: 4rem;
        }
        @media (max-width: 576px) {
            font-size: 2.5rem;
        }
    }

    p {
        font-size: 1.2rem;
        margin-bottom: 3rem;
        opacity: 0.95;
        max-width: 900px;
        margin-left: auto;
        margin-right: auto;
        line-height: 1.7;
        @media (max-width: 576px) {
            font-size: 1rem;
        }
    }

    .cta-buttons {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        @media (min-width: 576px) {
            flex-direction: row;
            justify-content: center;
        }
        .btn {
            padding: 1rem 2.5rem;
            font-size: 1.1rem;
            font-weight: 600;
            border-radius: 10px;
            transition: all 0.3s ease;
            min-width: 250px;
            text-align: center;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;

            &:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            }
        }
        .btn-light-styled {
            background-color: ${colors.white};
            border: 2px solid ${colors.white};
            color: ${colors.primary};
            &:hover {
                background-color: ${colors.lightGray};
                border-color: ${colors.lightGray};
            }
        }
        .btn-outline-light-styled {
            background-color: transparent;
            border: 2px solid ${colors.white};
            color: ${colors.white};
            &:hover {
                background-color: rgba(255,255,255,0.15);
            }
        }
    }
`;

// Footer Styling
const StyledFooter = styled.footer`
    background: ${colors.darkText}; /* Darker background for footer */
    color: ${colors.placeholderText};
    padding: 4rem 1.5rem 2rem;
    box-shadow: 0 -5px 20px rgba(0,0,0,0.2);
    animation: ${fadeIn} 0.8s ease-out;

    .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr;
        gap: 3rem; /* More space */

        @media (min-width: 768px) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media (min-width: 992px) {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    .footer-column {
        h4 {
            color: ${colors.white};
            font-size: 1.4rem; /* Larger heading */
            margin-bottom: 1.8rem; /* More space */
            position: relative;
            padding-bottom: 0.8rem; /* Thicker underline */

            &:after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 60px; /* Longer underline */
                height: 3px; /* Thicker underline */
                background: ${colors.primary};
            }
        }

        p {
            font-size: 0.98rem;
            line-height: 1.8;
            margin-bottom: 1.5rem;
        }

        .company-info {
            display: flex;
            flex-direction: column;
            gap: 1.2rem; /* More space */

            div {
                display: flex;
                align-items: flex-start;
                gap: 1rem; /* More space */

                svg {
                    margin-top: 0.2rem;
                    flex-shrink: 0;
                    font-size: 1.2rem; /* Slightly larger icon */
                    color: ${colors.primary}; /* Primary color for icons */
                }
            }
        }

        .footer-links {
            display: flex;
            flex-direction: column;
            gap: 1rem;

            a {
                color: ${colors.placeholderText};
                transition: color 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.7rem;
                text-decoration: none;
                font-size: 0.98rem;

                &:hover {
                    color: ${colors.white};
                    transform: translateX(5px); /* Slide on hover */
                }

                svg {
                    font-size: 1.2rem;
                    color: ${colors.primary};
                }
            }
        }

        .social-links {
            display: flex;
            gap: 1.2rem;
            margin-top: 2rem;

            a {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 45px; /* Larger social icons */
                height: 45px;
                border-radius: 50%;
                background: rgba(255,255,255,0.15); /* Slightly more prominent background */
                color: ${colors.white};
                transition: all 0.3s ease;
                text-decoration: none;
                font-size: 1.3rem; /* Larger icons */

                &:hover {
                    background: ${colors.primary};
                    transform: translateY(-5px) scale(1.1); /* Lift and scale */
                }
            }
        }
    }

    .copyright {
        text-align: center;
        padding-top: 3rem;
        margin-top: 3rem;
        border-top: 1px solid rgba(255,255,255,0.1);
        font-size: 0.9rem;

        p {
            margin-bottom: 0.8rem;
        }
    }
`;

const LandingPage = () => {
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    const features = [
        {
            icon: <FiCheckCircle />,
            title: "Decentralized & Fair",
            text: "Direct connections, fairer prices for producers, and transparent transactions. No hidden fees, just honest food and clear dealings."
        },
        {
            icon: <FiUsers />,
            title: "Community Powered",
            text: "Support local businesses and farmers directly. Our network thrives on community participation and trust."
        },
        {
            icon: <FiDollarSign />,
            title: "Secure & Transparent",
            text: "Blockchain technology ensures every transaction is secure, verifiable, and transparent from origin to table."
        }
    ];

    const benefits = [
        {
            icon: <FaUserTie />,
            title: "Become a Home Chef",
            text: "Turn your passion into profit. Start earning immediately by sharing your unique culinary skills with your community."
        },
        {
            icon: <FiCamera />,
            title: "Showcase Your Dishes",
            text: "Effortlessly post stunning photos of your dishes, set your own prices, and manage orders with an intuitive interface."
        },
        {
            icon: <FiDollarSign />,
            title: "Instant Secure Earnings",
            text: "Get paid securely and instantly through our innovative Welt Tallis blockchain payment system, minimizing delays and fees."
        }
    ];

    const steps = [
        {
            number: '1',
            title: "Create Your Profile",
            text: "Sign up as a chef or liquor seller. Set up your profile, add your details, and prepare to join the network."
        },
        {
            number: '2',
            title: "List Your Offerings",
            text: "Upload enticing photos and descriptions of your delicious meals or premium liquor products. Set your prices and availability."
        },
        {
            number: '3',
            title: "Receive Orders",
            text: "Customers browse your listings and place orders. Get real-time notifications and manage your incoming requests easily."
        },
        {
            number: '4',
            title: "Fulfill & Deliver",
            text: "Prepare your food or package your liquor. Coordinate with customers for pickup or delivery, ensuring a smooth experience."
        },
        {
            number: '5',
            title: "Get Paid Instantly",
            text: "Once the transaction is complete, your earnings are deposited directly into your Welt Tallis blockchain wallet. It's fast and secure."
        },
        {
            number: '6',
            title: "Grow Your Business",
            text: "Leverage customer reviews and ratings to build your reputation and expand your reach within the Jikoni Express community."
        }
    ];

    return (
        <PageContainer fluid>

            {/* Header */}
            <StyledHeader>
                <div className="logo-container">
                    <div className="logo-icon">
                        <span>JE</span>
                    </div>
                    <h1 className="brand-name">Jikoni <span>Express</span></h1>
                </div>
                <nav>
                    <NavLink to="#features">Features</NavLink>
                    <Link to="/culture/foods">Food Marketplace</Link> {/* Link to food listings */}
                    <Link to="/jikoni-express/liqour-shots">Liquor Store</Link> {/* Link to liquor */}
                    <NavLink to="#how-it-works">How it Works</NavLink>
                    <NavLink to="#contact">Contact</NavLink>
                </nav>
                <Button
                    onClick={() => setShowDownloadModal(true)} // Open modal instead of alert
                    className="download-button"
                >
                    Download App
                </Button>
                <button className="mobile-menu-button focus:outline-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                </button>
            </StyledHeader>

            {/* Main Hero Section - Redesigned */}
            <MainHeroSection>
                <div className="hero-content">
                    <div className="text-column">
                        <h1>
                            Africa's <br /><span>First Decentralized</span> <br />Food & Liquor Delivery
                        </h1>
                        <p>
                            Experience the future of culinary and beverage access. Jikoni Express connects you directly to local kitchens, fresh produce, and premium liquor sellers, powered by a secure, transparent, and community-driven network in Kenya and beyond.
                        </p>
                        <div className="hero-buttons">
                            <Button
                                onClick={() => setShowDownloadModal(true)} // Open modal for app download
                                className="btn-primary-filled"
                            >
                                <FaApple /> Get Our App
                            </Button>
                            <Link to="/culture/foods"> {/* Link to general food listings */}
                                <Button className="btn-secondary-outline">
                                    Explore Foods
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="image-column">
                        <img src={food2Image} alt="Delicious food and liquor" />
                    </div>
                </div>
            </MainHeroSection>

            {/* Features Section */}
            <FeaturesSection id="features">
                <h2>Why Choose <span>Jikoni Express</span>?</h2>
                <p className="subtitle">
                    We're building a new ecosystem for food and beverage, empowering local communities and ensuring transparency.
                </p>
                <Row className="g-5"> {/* Increased gutter */}
                    {features.map((feature, index) => (
                        <Col md={4} key={index}>
                            <div className="feature-card">
                                <div className={`icon-wrapper ${index === 0 ? 'primary-bg' : index === 1 ? 'secondary-bg' : 'accent-bg'}`}>
                                    {feature.icon}
                                </div>
                                <h4>{feature.title}</h4>
                                <p>{feature.text}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </FeaturesSection>

            {/* Secondary Hero Section (Turn Your Kitchen into Income Source) */}
            <SecondaryHeroSection>
                <h2>Turn Your Kitchen into <br /><span>An Income Source</span></h2>
                <p>Join Kenya's first decentralized food and liquor platform powered by Welt Tallis blockchain and unlock new opportunities.</p>
                <div className="hero-buttons">
                    <Button
                        onClick={() => Swal.fire({
                            title: 'Become a Chef',
                            text: 'Ready to share your culinary skills? Sign up and start earning!',
                            icon: 'info',
                            confirmButtonText: 'Join Now!',
                            confirmButtonColor: colors.primary
                        })}
                        className="btn-light-styled"
                    >
                        <FaUserTie /> Become a Chef
                    </Button>
                    <Link to="/jikoni-express/liqour-shots"> {/* Direct link to liquor page */}
                        <Button variant="outline-light" className="btn-outline-light-styled">
                            Explore Liquor Shots
                        </Button>
                    </Link>
                </div>
            </SecondaryHeroSection>

            {/* Benefits Grid */}
            <BenefitGrid>
                {benefits.map((benefit, index) => (
                    <BenefitCard key={index} delay={index * 0.15}> {/* Staggered animation */}
                        {benefit.icon}
                        <h3>{benefit.title}</h3>
                        <p>{benefit.text}</p>
                    </BenefitCard>
                ))}
            </BenefitGrid>

            {/* How It Works Section - Redesigned for Clarity */}
            <HowItWorksSection id="how-it-works">
                <h2>How It <span>Works</span></h2>
                <p className="subtitle">
                    Whether you're a chef, a liquor seller, or a customer, our platform makes it easy to connect and transact securely.
                </p>
                <Row className="g-5"> {/* Increased gutter */}
                    {steps.map((step, index) => (
                        <Col xs={12} md={6} lg={4} key={index}>
                            <StepCard delay={index * 0.1}> {/* Staggered animation */}
                                <div className="step-number" style={{ backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary }}>{step.number}</div>
                                <h4>{step.title}</h4>
                                <p>{step.text}</p>
                            </StepCard>
                        </Col>
                    ))}
                </Row>
            </HowItWorksSection>

            {/* Call to Action Section */}
            <CtaSection>
                <h2>Ready to Taste the Future?</h2>
                <p>Join the growing Jikoni Express community and experience the next generation of decentralized food and liquor delivery. Sign up or download the app today!</p>
                <div className="cta-buttons">
                    <Button
                        variant="light"
                        className="btn-light-styled"
                        onClick={() => Swal.fire({
                            title: 'Sign Up',
                            text: 'Start your journey with Jikoni Express today!',
                            icon: 'info',
                            confirmButtonText: 'Register',
                            confirmButtonColor: colors.primary
                        })}
                    >
                        Sign Up Now!
                    </Button>
                    <Button
                        variant="outline-light"
                        className="btn-outline-light-styled"
                        onClick={() => setShowDownloadModal(true)} // Open modal for app download
                    >
                        Download the App
                    </Button>
                </div>
            </CtaSection>

            {/* Footer */}
            <StyledFooter id="contact">
                <div className="footer-content">
                    <div className="footer-column">
                        <h4>About Jikoni Express</h4>
                        <p>
                            Jikoni Express is revolutionizing Kenya's food and beverage culture through decentralized technology.
                            We connect home chefs, liquor sellers, and food enthusiasts in a transparent, community-driven marketplace.
                        </p>
                        <div className="social-links">
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4>Company</h4>
                        <div className="footer-links">
                            <a href="#features">Features</a>
                            <a href="#how-it-works">How it Works</a>
                            <a href="#team">Our Team</a>
                            <a href="#careers">Careers</a>
                            <a href="#blog">Blog</a>
                            <a href="#press">Press</a>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4>Legal</h4>
                        <div className="footer-links">
                            <a href="#terms">Terms of Service</a>
                            <a href="#privacy">Privacy Policy</a>
                            <a href="#cookie">Cookie Policy</a>
                            <a href="#licenses">Licenses</a>
                            <a href="#compliance">Compliance</a>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4>Contact Us</h4>
                        <div className="company-info">
                            <div>
                                <FiMapPin />
                                <span>Jikoni Express Limited, Nairobi, Kenya</span>
                            </div>
                            <div>
                                <FiPhone />
                                <span>+254 700 123 456</span>
                            </div>
                            <div>
                                <FiMail />
                                <span>info@jikoniexpress.co.ke</span>
                            </div>
                            <div>
                                <FiHelpCircle />
                                <span>support@jikoniexpress.co.ke</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="copyright">
                    <p>&copy; {new Date().getFullYear()} Jikoni Express Limited. All rights reserved.</p>
                    <p>Powered by Welt Tallis Blockchain Technology</p>
                </div>
            </StyledFooter>

            {/* Download App Modal */}
            <Modal show={showDownloadModal} onHide={() => setShowDownloadModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: colors.darkText, fontWeight: '700' }}>Download Jikoni Express App</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <p style={{ fontSize: '1.1rem', color: colors.placeholderText, marginBottom: '2rem' }}>
                        Get the full Jikoni Express experience on your mobile device!
                    </p>
                    <div className="d-flex flex-column gap-3 align-items-center">
                        <Button
                            variant="dark"
                            className="w-75 py-3 rounded-pill d-flex align-items-center justify-content-center download-app-link"
                            href="https://www.apple.com/app-store/" // Replace with actual app store link
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ backgroundColor: '#000', color: '#fff', border: 'none', fontSize: '1.1rem', fontWeight: 'bold' }}
                        >
                            <FaApple className="me-2" style={{ fontSize: '1.5rem' }} /> App Store
                        </Button>
                        <Button
                            variant="success"
                            className="w-75 py-3 rounded-pill d-flex align-items-center justify-content-center download-app-link"
                            href="https://play.google.com/store" // Replace with actual play store link
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ backgroundColor: '#4CAF50', color: '#fff', border: 'none', fontSize: '1.1rem', fontWeight: 'bold' }}
                        >
                            <FaGooglePlay className="me-2" style={{ fontSize: '1.5rem' }} /> Google Play
                        </Button>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-center">
                    <Button variant="outline-secondary" onClick={() => setShowDownloadModal(false)} className="rounded-pill px-4">Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Global Styles for Modal and Link Buttons */}
            <style jsx global>{`
                .modal-content {
                    border-radius: 1rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .modal-header {
                    border-bottom: none;
                    padding-bottom: 0;
                }
                .modal-footer {
                    border-top: none;
                    padding-top: 0;
                }
                .download-app-link {
                    transition: all 0.3s ease;
                }
                .download-app-link:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
            `}</style>

        </PageContainer>
    );
};

export default LandingPage;
