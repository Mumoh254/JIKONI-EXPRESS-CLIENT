import React, { useState, useEffect } from 'react';
import { Button, Navbar, Offcanvas, Badge, Dropdown, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// --- Jikoni Express Color Palette ---
const colors = {
    primary: '#FF4532',       // Jikoni Red
    secondary: '#00C853',     // Jikoni Green
    darkText: '#1A202C',      // Deep Charcoal for main text
    lightText: '#A0AEC0',     // Soft Gray for muted text
    cardBackground: '#FFFFFF',// Pure White for elements background
    borderColor: '#E0E6ED',   // Light border for sleekness
    errorText: '#dc3545',     // Standard Bootstrap danger color
    disabledState: '#D1D9E6', // For offline toggle background or muted states
    lightBackground: '#F0F2F5', // A very light grey for subtle backgrounds/hovers
    textPrimary: '#343A40',    // A slightly softer dark text
    
   
    // Chart-specific colors for maximum variation and bluish tones (kept for potential future use or other components)
    chartBlue1: '#4285F4',      // Google Blue
    chartBlue2: '#67B7DC',      // Sky Blue
    chartGreen1: '#34A853',     // Google Green
    chartGreen2: '#00C853',     // Jikoni Green
    chartRed1: '#EA4335',       // Google Red
    chartRed2: '#FF4532',       // Jikoni Red
    chartYellow1: '#FBBC04',    // Google Yellow
    chartPurple1: '#8E44AD',    // Wisteria
    chartTurquoise: '#1ABC9C',  // Turquoise
    chartDarkBlue: '#2C3E50',   // Midnight Blue
    chartOrange: '#E67E22',    // Carrot Orange
    chartLightGrey: '#BDC3C7',  // Silver
    chartDarkGrey: '#7F8C8D',   // Asbestos
    chartViolet: '#9B59B6',     // Amethyst
};

// --- Mock NotificationsPanel Component (for demonstration purposes) ---
const NotificationsPanel = ({ show, onHide, notifications, markNotificationAsRead }) => {
    // Re-defining relevant colors locally for this mock, typically these would be imported or passed down.
    const panelColors = {
        primary: colors.primary,
        darkText: colors.darkText,
        lightText: colors.lightText,
        cardBackground: colors.cardBackground,
        lightBackground: colors.lightBackground,
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: '350px' }}>
            <Offcanvas.Header closeButton style={{ backgroundColor: panelColors.primary, color: 'white', borderBottom: 'none', padding: '1.5rem 1.75rem' }}>
                <Offcanvas.Title style={{ fontWeight: '700', fontSize: '1.75rem', letterSpacing: '-0.5px' }}>Notifications</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body style={{ backgroundColor: panelColors.cardBackground, padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                {(notifications && notifications.length > 0) ? (
                    notifications.map((notification) => (
                        <div key={notification.id} style={{
                            padding: '1rem',
                            marginBottom: '0.8rem',
                            backgroundColor: notification.read ? panelColors.lightBackground : '#FFF0E8', // Lighter red tint for unread
                            borderRadius: '10px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            borderLeft: notification.read ? 'none' : `5px solid ${panelColors.primary}`,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.6rem',
                            transition: 'all 0.3s ease-in-out',
                            opacity: notification.read ? 0.7 : 1,
                            transform: notification.read ? 'scale(0.98)' : 'scale(1)',
                        }}
                        onClick={() => markNotificationAsRead(notification.id)}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.15)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = notification.read ? 'scale(0.98)' : 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ color: panelColors.darkText, fontSize: '1.1rem' }}>{notification.title}</strong>
                                {!notification.read && <Badge bg="danger" style={{ animation: 'pulse 1.5s infinite', borderRadius: '5px' }}>New</Badge>}
                            </div>
                            <p style={{ color: panelColors.lightText, fontSize: '0.95rem', margin: 0 }}>{notification.message}</p>
                            <small style={{ color: panelColors.lightText, fontSize: '0.8rem', textAlign: 'right' }}>{notification.timestamp}</small>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: panelColors.lightText, padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100% - 70px)' }}>
                         {/* Icon for no notifications */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={panelColors.borderColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                        <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>You're all caught up!</p>
                        <p style={{ fontSize: '0.9rem', color: panelColors.lightText }}>No new notifications to show.</p>
                    </div>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
};

// --- ChefDetailsModal Component ---
const ChefDetailsModal = ({ show, onHide, chefDetails, onUpdateChefDetails }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (show) {
            setFormData({
                chefName: chefDetails?.chefName ?? '',
                chefEmail: chefDetails?.chefEmail ?? '',
                chefPhone: chefDetails?.chefPhone ?? '',
                chefAvailable: chefDetails?.chefAvailable ?? false,
            });
        }
    }, [chefDetails, show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (typeof onUpdateChefDetails === 'function') {
            onUpdateChefDetails(formData);
        }
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header style={{ backgroundColor: colors.primary, color: 'white', borderBottom: 'none', padding: '1.5rem', borderRadius: '15px 15px 0 0' }} closeButton>
                <Modal.Title style={{ fontWeight: '700', fontSize: '1.6rem', display: 'flex', alignItems: 'center' }}>
                    {/* PersonCircle Icon (inline SVG) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-3"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Chef Profile Settings
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ padding: '30px', backgroundColor: colors.cardBackground, borderRadius: '0 0 15px 15px' }}>
                    <Form.Group className="mb-3" controlId="chefName">
                        <Form.Label style={{ fontWeight: '600', color: colors.textPrimary, marginBottom: '8px', fontSize: '0.95rem' }}>Full Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter your name" name="chefName" value={formData.chefName || ''} onChange={handleChange} 
                            style={{ borderRadius: '10px', border: `1px solid ${colors.borderColor}`, padding: '0.8rem 1.2rem', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' }}
                            onFocus={(e) => e.target.style.boxShadow = `0 0 0 0.25rem ${colors.primary}40`}
                            onBlur={(e) => e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="chefEmail">
                        <Form.Label style={{ fontWeight: '600', color: colors.textPrimary, marginBottom: '8px', fontSize: '0.95rem' }}>Email Address</Form.Label>
                        <Form.Control type="email" placeholder="Enter your email" name="chefEmail" value={formData.chefEmail || ''} onChange={handleChange} 
                            style={{ borderRadius: '10px', border: `1px solid ${colors.borderColor}`, padding: '0.8rem 1.2rem', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' }}
                            onFocus={(e) => e.target.style.boxShadow = `0 0 0 0.25rem ${colors.primary}40`}
                            onBlur={(e) => e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="chefPhone">
                        <Form.Label style={{ fontWeight: '600', color: colors.textPrimary, marginBottom: '8px', fontSize: '0.95rem' }}>Phone Number</Form.Label>
                        <Form.Control type="text" placeholder="Enter your phone number" name="chefPhone" value={formData.chefPhone || ''} onChange={handleChange} 
                            style={{ borderRadius: '10px', border: `1px solid ${colors.borderColor}`, padding: '0.8rem 1.2rem', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' }}
                            onFocus={(e) => e.target.style.boxShadow = `0 0 0 0.25rem ${colors.primary}40`}
                            onBlur={(e) => e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}
                        />
                    </Form.Group>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '30px', marginBottom: '20px', padding: '1.2rem', background: colors.lightBackground, borderRadius: '10px', boxShadow: 'inset 0 1px 5px rgba(0,0,0,0.05)' }}>
                        <Form.Check
                            type="switch"
                            id="chefAvailabilitySwitch"
                            label="Availability"
                            name="chefAvailable"
                            checked={formData.chefAvailable || false}
                            onChange={handleChange}
                            style={{
                                '--bs-form-switch-bg-image': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='rgba%280, 0, 0, 0.25%29'/%3e%3c/svg%3e")`,
                                '--bs-form-switch-checked-bg-image': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e")`,
                                '--bs-form-switch-focus-shadow': 'none',
                                '--bs-form-switch-checked-bg': colors.secondary, // Green for checked
                                width: '60px', // Increased width for better touch target
                                height: '32px', // Increased height
                                backgroundColor: formData.chefAvailable ? colors.secondary : colors.disabledState,
                                border: 'none',
                                transition: 'background-color 0.3s ease-in-out',
                                cursor: 'pointer',
                                position: 'relative',
                            }}
                        />
                        <span style={{ fontWeight: '700', color: formData.chefAvailable ? colors.secondary : colors.errorText, marginLeft: 'auto', fontSize: '1.1rem' }}>
                            {formData.chefAvailable ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: `1px solid ${colors.borderColor}`, backgroundColor: colors.lightBackground, padding: '1rem 1.75rem', borderRadius: '0 0 15px 15px' }}>
                    <Button variant="outline-secondary" onClick={onHide} style={{ borderRadius: '10px', fontWeight: '600', padding: '0.7rem 1.5rem', transition: 'all 0.3s ease' }}>Cancel</Button>
                    <Button variant="primary" type="submit" style={{ backgroundColor: colors.primary, border: 'none', borderRadius: '10px', fontWeight: '600', padding: '0.7rem 1.5rem', boxShadow: '0 4px 10px rgba(255, 69, 50, 0.3)', transition: 'all 0.3s ease' }}
                        onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 15px rgba(255, 69, 50, 0.5)'}
                        onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 10px rgba(255, 69, 50, 0.3)'}
                    >
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

// --- Custom Toggle Component for Profile Dropdown ---
const CustomProfileToggle = React.forwardRef(({ onClick, chefAvatarUrl, chefAvailable }, ref) => (
    <div
        ref={ref}
        onClick={e => { e.preventDefault(); onClick(e); }}
        style={{ position: 'relative', cursor: 'pointer', outline: 'none' }}
    >
        <img
            src={chefAvatarUrl || 'https://placehold.co/48x48/DDDDDD/A0AEC0?text=C'} // Slightly larger avatar
            alt="Chef Profile"
            style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${chefAvailable ? colors.secondary : colors.errorText}`, // Status border
                boxShadow: `0 0 0 2px ${colors.cardBackground}, 0 4px 15px rgba(0,0,0,0.15)`, // Enhanced shadow and inner border
                transition: 'all 0.3s ease',
                filter: 'grayscale(0%)', // Ensure color
            }}
            onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = `0 0 0 2px ${colors.cardBackground}, 0 6px 20px rgba(0,0,0,0.25)`;
            }}
            onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = `0 0 0 2px ${colors.cardBackground}, 0 4px 15px rgba(0,0,0,0.15)`;
            }}
        />
        {/* Status Indicator Dot (more subtle, as border is primary indicator) */}
        <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: chefAvailable ? colors.secondary : colors.errorText,
            border: `2px solid ${colors.cardBackground}`,
            position: 'absolute',
            bottom: '0px', // Adjusted to align better with border
            right: '0px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            transform: 'scale(1)',
            transition: 'transform 0.2s ease-out',
            animation: chefAvailable ? 'statusGlow 1.5s infinite alternate' : 'none', // Subtle glow for online
        }}></div>
    </div>
));

export default function ChefMainHeader({
    notifications,
    markNotificationAsRead,
    chefName = 'Chef',
    chefAvatarUrl,
    chefAvailable = true,
    chefDetails = {},
    onUpdateChefDetails,
}) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showChefDetailsModal, setShowChefDetailsModal] = useState(false);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const navigate = useNavigate();
    const unreadNotifications = (notifications || []).filter(n => !n.read).length;

    const handleOffcanvasToggle = () => setShowOffcanvas(prev => !prev);
    const handleOffcanvasClose = () => setShowOffcanvas(false);

    const handleShowChefDetails = () => {
        setShowChefDetailsModal(true);
        handleOffcanvasClose();
    };

    const handleLogout = () => {
        console.log('Logout Clicked'); // Replace with actual logout logic
        handleOffcanvasClose();
        // navigate('/logout'); // Example usage, uncomment if you have a logout route
    };

    const handleDashboardClick = () => {
        navigate('/chef-dashboard');
        handleOffcanvasClose();
    };

    return (
        <>
            {/* Main Navbar Header */}
            <Navbar expand={false} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 30px', // Increased padding
                backgroundColor: colors.cardBackground,
                borderBottom: `1px solid ${colors.borderColor}`,
                fontFamily: 'Inter, sans-serif',
                minHeight: '80px', // Increased height
                boxShadow: '0 6px 20px rgba(0,0,0,0.08)', // Stronger shadow for floating effect
                backdropFilter: 'blur(5px)', // Subtle blur for futuristic feel (might not work in all iframes)
                position: 'sticky',
                top: 0,
                zIndex: 1000,
            }}>
                {/* Brand Logo */}
                <Navbar.Brand onClick={handleDashboardClick} style={{
                    color: colors.darkText, // Darker text for brand
                    fontSize: '28px', // Larger font size
                    fontWeight: '800', // Extra bold
                    letterSpacing: '-0.8px',
                    cursor: 'pointer',
                    textShadow: '0 2px 5px rgba(0,0,0,0.1)', // Subtle text shadow
                    transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = colors.primary}
                onMouseLeave={(e) => e.target.style.color = colors.darkText}
                >
                    <span style={{ color: colors.primary }}>Jikoni</span> <span style={{ color: colors.chartBlue1 }}>Express</span> Chef
                </Navbar.Brand>

                {/* Right Actions - Notification, Profile Dropdown, Hamburger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}> {/* Increased gap */}
                    {/* Notification Icon */}
                    <div
                        style={{
                            position: 'relative',
                            cursor: 'pointer',
                            padding: '10px', // Larger click area
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            transition: 'background-color 0.2s ease, transform 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.lightBackground; e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                        onClick={() => setShowNotifications(true)}
                    >
                        {/* Bell Icon (inline SVG) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.darkText }}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                        {unreadNotifications > 0 && (
                            <Badge pill bg="danger" style={{
                                position: 'absolute',
                                top: '0px',
                                right: '0px',
                                fontSize: '0.7rem', // Slightly larger badge
                                padding: '0.4em 0.6em',
                                animation: 'pulse 1.5s infinite', // Pulse animation
                                boxShadow: '0 0 0 2px rgba(255, 69, 50, 0.4)',
                            }}>
                                {unreadNotifications}
                            </Badge>
                        )}
                    </div>

                    {/* Profile Dropdown for Desktop */}
                    <Dropdown align="end" className="d-none d-lg-block">
                        <Dropdown.Toggle as={CustomProfileToggle} id="profile-dropdown" chefAvatarUrl={chefAvatarUrl} chefAvailable={chefAvailable} />
                        <Dropdown.Menu style={{ borderRadius: '12px', boxShadow: '0 8px 25px rgba(0,0,0,0.15)', padding: '0.5rem 0' }}>
                            <Dropdown.Item onClick={handleShowChefDetails} style={{ padding: '0.8rem 1.2rem', transition: 'background-color 0.2s ease, color 0.2s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.lightBackground; e.currentTarget.style.color = colors.primary; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'inherit'; }}
                            >
                                {/* GearFill Icon (inline SVG) */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ verticalAlign: 'middle' }}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.22a2 2 0 0 0 .73 2.73l.04.02a2 2 0 0 1 .91 1.07l.1.43a2 2 0 0 1 0 2l-.1.43a2 2 0 0 1-.91 1.07l-.04.02a2 2 0 0 0-.73 2.73l.78 1.22a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.22a2 2 0 0 0-.73-2.73l-.04-.02a2 2 0 0 1-.91-1.07l-.1-.43a2 2 0 0 1 0-2l.1-.43a2 2 0 0 1 .91-1.07l.04-.02a2 2 0 0 0 .73-2.73l-.78-1.22a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> Profile Settings
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleLogout} style={{ padding: '0.8rem 1.2rem', transition: 'background-color 0.2s ease, color 0.2s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.errorText; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'inherit'; }}
                            >
                                {/* BoxArrowRight Icon (inline SVG) */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ verticalAlign: 'middle' }}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg> Logout
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Hamburger Toggle for Mobile/Tablet */}
                    <Navbar.Toggle aria-controls="offcanvasNavbar" onClick={handleOffcanvasToggle} className="d-lg-none" style={{ border: 'none', backgroundColor: 'transparent', padding: '0', outline: 'none' }}>
                        {/* List Icon (inline SVG) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.darkText }}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                    </Navbar.Toggle>
                </div>

                {/* Offcanvas Menu for Mobile/Tablet */}
                <Offcanvas
                    id="offcanvasNavbar"
                    aria-labelledby="offcanvasNavbarLabel"
                    placement="end"
                    show={showOffcanvas}
                    onHide={handleOffcanvasClose}
                    style={{ width: '320px', backgroundColor: colors.cardBackground }} // Changed from colors.darkText to colors.cardBackground (white)
                >
                    <Offcanvas.Header closeButton style={{ backgroundColor: colors.primary, color: 'white', borderBottom: 'none', padding: '1.5rem 1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}> {/* Changed from gradient to solid primary */}
                        <Offcanvas.Title id="offcanvasNavbarLabel" style={{ fontWeight: '700', fontSize: '1.2rem', letterSpacing: '0.5px' }}>
                        <span
                        style={{
                          
                        }}>   Jikoni     Express  </span>  Chef
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body style={{ backgroundColor: colors.cardBackground, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}> {/* Changed from backgroundLight to cardBackground (white) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '1.2rem', marginBottom: '1rem', background: colors.cardBackground, borderRadius: '15px', boxShadow: '0 6px 15px rgba(0,0,0,0.1)' }}>
                            <img
                                src={chefAvatarUrl || 'https://placehold.co/60x60/DDDDDD/A0AEC0?text=C'} // Larger avatar
                                alt="Chef Profile"
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: `4px solid ${chefAvailable ? colors.secondary : colors.errorText}`, // Thicker status border
                                    boxShadow: `0 0 0 3px ${colors.cardBackground}, 0 5px 15px rgba(0,0,0,0.15)`, // Enhanced shadow
                                }}
                            />
                            <div>
                                <h5 style={{ color: colors.darkText, margin: 0, fontWeight: '700', fontSize: '1.2rem' }}>{chefName}</h5>
                                <p style={{ color: chefAvailable ? colors.secondary : colors.errorText, margin: '5px 0 0', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                    <span style={{ fontSize: '1.5em' }}>●</span> {chefAvailable ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>

                        <hr style={{ borderColor: colors.borderColor, margin: '0 0 1rem', borderTopWidth: '2px' }} />

                        {/* Offcanvas Nav Items */}
                        <div
                            onClick={handleDashboardClick}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '18px',
                                padding: '1rem 1.2rem',
                                fontWeight: '600',
                                borderRadius: '10px',
                                transition: 'all 0.25s ease-in-out',
                                cursor: 'pointer',
                                color: colors.darkText,
                                marginBottom: '8px',
                                background: colors.cardBackground,
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.lightBackground; e.currentTarget.style.color = colors.primary; e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.querySelector('svg').style.color = colors.primary; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.cardBackground; e.currentTarget.style.color = colors.darkText; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.querySelector('svg').style.color = colors.lightText; }}
                        >
                            {/* Grid3x3GapFill Icon (inline SVG) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.lightText, transition: 'color 0.25s ease-in-out' }}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg> Dashboard
                        </div>
                        <div
                            onClick={() => { setShowNotifications(true); handleOffcanvasClose(); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '18px',
                                padding: '1rem 1.2rem',
                                fontWeight: '600',
                                borderRadius: '10px',
                                transition: 'all 0.25s ease-in-out',
                                cursor: 'pointer',
                                color: colors.darkText,
                                marginBottom: '8px',
                                background: colors.cardBackground,
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.lightBackground; e.currentTarget.style.color = colors.primary; e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.querySelector('svg').style.color = colors.primary; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.cardBackground; e.currentTarget.style.color = colors.darkText; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.querySelector('svg').style.color = colors.lightText; }}
                        >
                            {/* Bell Icon (inline SVG) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.lightText, transition: 'color 0.25s ease-in-out' }}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                            Notifications
                            {unreadNotifications > 0 && (
                                <Badge pill bg="danger" style={{
                                    marginLeft: 'auto',
                                    animation: 'pulse 1.5s infinite',
                                    boxShadow: '0 0 0 2px rgba(255, 69, 50, 0.4)',
                                }}>
                                    {unreadNotifications}
                                </Badge>
                            )}
                        </div>
                        <div
                            onClick={handleShowChefDetails}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '18px',
                                padding: '1rem 1.2rem',
                                fontWeight: '600',
                                borderRadius: '10px',
                                transition: 'all 0.25s ease-in-out',
                                cursor: 'pointer',
                                color: colors.darkText,
                                marginBottom: '8px',
                                background: colors.cardBackground,
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.lightBackground; e.currentTarget.style.color = colors.primary; e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.querySelector('svg').style.color = colors.primary; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.cardBackground; e.currentTarget.style.color = colors.darkText; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.querySelector('svg').style.color = colors.lightText; }}
                        >
                            {/* GearFill Icon (inline SVG) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ color: colors.lightText, transition: 'color 0.25s ease-in-out' }}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.22a2 2 0 0 0 .73 2.73l.04.02a2 2 0 0 1 .91 1.07l.1.43a2 2 0 0 1 0 2l-.1.43a2 2 0 0 1-.91 1.07l-.04.02a2 2 0 0 0-.73 2.73l.78 1.22a2 2 0 = 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.22a2 2 0 0 0-.73-2.73l-.04-.02a2 2 0 0 1-.91-1.07l-.1-.43a2 2 0 0 1 0-2l.1-.43a2 2 0 0 1 .91-1.07l.04-.02a2 2 0 0 0 .73-2.73l-.78-1.22a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> Profile Settings
                        </div>

                        <Button
                            onClick={handleLogout}
                            variant="primary" // Use primary for strong action
                            className="w-100" // Full width button
                            style={{
                                marginTop: 'auto', // Push to bottom
                                backgroundColor: colors.primary, // Changed from gradient to solid primary
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '700',
                                padding: '0.8rem 1.5rem',
                                fontSize: '1.1rem',
                                boxShadow: '0 4px 15px rgba(255, 69, 50, 0.4)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                            onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 20px rgba(255, 69, 50, 0.6)'}
                            onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 15px rgba(255, 69, 50, 0.4)'}
                        >
                            {/* BoxArrowRight Icon (inline SVG) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg> Logout
                        </Button>
                    </Offcanvas.Body>
                </Offcanvas>
            </Navbar>

            {/* Reusable Modals and Panels */}
            <NotificationsPanel
                show={showNotifications}
                onHide={() => setShowNotifications(false)}
                notifications={notifications}
                markNotificationAsRead={markNotificationAsRead}
            />
            <ChefDetailsModal
                show={showChefDetailsModal}
                onHide={() => setShowChefDetailsModal(false)}
                chefDetails={chefDetails}
                onUpdateChefDetails={onUpdateChefDetails}
            />
            {/* Component-specific global styles for animations */}
            <style jsx>{`
                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(255, 69, 50, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(255, 69, 50, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(255, 69, 50, 0);
                    }
                }
                @keyframes statusGlow {
                    0% { box-shadow: 0 0 0px 0px ${colors.secondary}AA; }
                    50% { box-shadow: 0 0 8px 3px ${colors.secondary}AA; }
                    100% { box-shadow: 0 0 0px 0px ${colors.secondary}AA; }
                }

                .transform-hover {
                  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
                }
                .transform-hover:hover {
                  transform: translateY(-8px) scale(1.02); /* More pronounced lift */
                  box-shadow: 0 15px 35px rgba(0,0,0,0.28) !important; /* Deeper shadow */
                }
                /* Custom styles for Bootstrap form-switch to override defaults for a custom look */
                .form-switch .form-check-input {
                    background-image: var(--bs-form-switch-bg-image);
                    background-position: left center;
                    border-radius: 50%; /* Make the switch thumb circular */
                    width: 2em; /* Adjust width if needed */
                    height: 1em; /* Adjust height if needed */
                    margin-right: 0.5em;
                }
                .form-switch .form-check-input:checked {
                    background-position: right center;
                }
            `}</style>
        </>
    );
}
