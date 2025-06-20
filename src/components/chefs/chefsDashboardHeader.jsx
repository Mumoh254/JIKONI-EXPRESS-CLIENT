import React, { useState, useEffect } from 'react';
import { Button, Navbar, Offcanvas, Badge, Dropdown, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// --- Jikoni Express Color Palette --- (Keep this at the top or in a separate file)
const colors = {
    primary: '#FF4532',       // Jikoni Red
    secondary: '#00C853',     // Jikoni Green
    darkText: '#1A202C',      // Dark text (nearly black)
    lightText: '#6C757D',     // Muted text
    cardBackground: '#FFFFFF',// White for card background and header
    borderColor: '#E0E6ED',   // Lighter border for sleekness
    errorText: '#dc3545',     // Standard Bootstrap danger color
    disabledState: '#D1D9E6', // For offline toggle background or muted states
    lightBackground: '#F0F2F5',// A very light grey for subtle backgrounds/hovers
    textPrimary: '#343A40',    // A slightly softer dark text
};

// --- Mock NotificationsPanel Component (for demonstration purposes) ---
// In a real application, you would import your actual NotificationsPanel.
const NotificationsPanel = ({ show, onHide, notifications, markNotificationAsRead }) => {
    // Defining colors here again for this specific mock, in a real app, it would be shared
    const panelColors = { // Renamed to avoid conflict with global colors
        primary: '#FF4532',
        darkText: '#1A202C',
        lightText: '#6C757D',
        cardBackground: '#FFFFFF',
        lightBackground: '#F0F2F5',
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: '350px' }}>
            <Offcanvas.Header closeButton style={{ backgroundColor: panelColors.primary, color: 'white', borderBottom: 'none', padding: '1.25rem 1.5rem' }}>
                <Offcanvas.Title style={{ fontWeight: '700', fontSize: '1.5rem' }}>Notifications</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body style={{ backgroundColor: panelColors.cardBackground, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                {(notifications && notifications.length > 0) ? (
                    notifications.map((notification) => (
                        <div key={notification.id} style={{
                            padding: '1rem',
                            marginBottom: '0.75rem',
                            backgroundColor: notification.read ? panelColors.lightBackground : '#FFF3F0', // Light red for unread
                            borderRadius: '8px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            borderLeft: notification.read ? 'none' : `4px solid ${panelColors.primary}`,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            transition: 'background-color 0.2s ease',
                            opacity: notification.read ? 0.8 : 1,
                        }}
                        onClick={() => markNotificationAsRead(notification.id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ color: panelColors.darkText, fontSize: '1rem' }}>{notification.title}</strong>
                                {!notification.read && <Badge bg="primary">New</Badge>}
                            </div>
                            <p style={{ color: panelColors.lightText, fontSize: '0.9rem', margin: 0 }}>{notification.message}</p>
                            <small style={{ color: panelColors.lightText, fontSize: '0.75rem', textAlign: 'right' }}>{notification.timestamp}</small>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: panelColors.lightText, padding: '2rem' }}>
                        <p>No new notifications.</p>
                    </div>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
};


// --- ChefDetailsModal Component --- (Moved above ChefMainHeader)
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
            <Modal.Header style={{ backgroundColor: colors.primary, color: 'white', borderBottom: 'none', padding: '1.5rem' }} closeButton>
                <Modal.Title style={{ fontWeight: '600', fontSize: '1.5rem' }}>
                    {/* PersonCircle Icon (inline SVG) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Chef Profile
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ padding: '25px', backgroundColor: colors.cardBackground }}>
                    <Form.Group className="mb-3" controlId="chefName">
                        <Form.Label style={{ fontWeight: '600', color: colors.textPrimary, marginBottom: '8px', fontSize: '0.9rem' }}>Full Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter your name" name="chefName" value={formData.chefName || ''} onChange={handleChange} style={{ borderRadius: '8px', border: `1px solid ${colors.borderColor}`, padding: '0.75rem 1rem', fontSize: '1rem' }}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="chefEmail">
                        <Form.Label style={{ fontWeight: '600', color: colors.textPrimary, marginBottom: '8px', fontSize: '0.9rem' }}>Email Address</Form.Label>
                        <Form.Control type="email" placeholder="Enter your email" name="chefEmail" value={formData.chefEmail || ''} onChange={handleChange} style={{ borderRadius: '8px', border: `1px solid ${colors.borderColor}`, padding: '0.75rem 1rem', fontSize: '1rem' }}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="chefPhone">
                        <Form.Label style={{ fontWeight: '600', color: colors.textPrimary, marginBottom: '8px', fontSize: '0.9rem' }}>Phone Number</Form.Label>
                        <Form.Control type="text" placeholder="Enter your phone number" name="chefPhone" value={formData.chefPhone || ''} onChange={handleChange} style={{ borderRadius: '8px', border: `1px solid ${colors.borderColor}`, padding: '0.75rem 1rem', fontSize: '1rem' }}/>
                    </Form.Group>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '25px', marginBottom: '20px', padding: '1rem', backgroundColor: colors.lightBackground, borderRadius: '8px' }}>
                        <Form.Check
                            type="switch"
                            id="chefAvailabilitySwitch"
                            label="Availability"
                            name="chefAvailable"
                            checked={formData.chefAvailable || false}
                            onChange={handleChange}
                            // Inline styling for the switch to mimic styled-component behavior
                            style={{
                                // These custom properties are only for Bootstrap 5's custom switches.
                                // If your Bootstrap version is older or these don't render,
                                // you might need custom CSS classes for the switch thumb.
                                '--bs-form-switch-bg-image': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='rgba%280, 0, 0, 0.25%29'/%3e%3c/svg%3e")`,
                                '--bs-form-switch-checked-bg-image': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e")`,
                                '--bs-form-switch-focus-shadow': 'none',
                                '--bs-form-switch-checked-bg': colors.secondary, // Green for checked
                                width: '50px',
                                height: '28px',
                                backgroundColor: formData.chefAvailable ? colors.secondary : colors.disabledState,
                                border: 'none',
                                transition: 'background-color 0.3s ease-in-out',
                                cursor: 'pointer',
                                position: 'relative',
                            }}
                        />
                        <span style={{ fontWeight: '600', color: formData.chefAvailable ? colors.secondary : colors.errorText, marginLeft: 'auto' }}>
                            {formData.chefAvailable ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: `1px solid ${colors.borderColor}`, backgroundColor: colors.lightBackground, padding: '1rem 1.5rem' }}>
                    <Button variant="light" onClick={onHide} style={{ borderRadius: '8px', fontWeight: '600', padding: '0.6rem 1.2rem' }}>Cancel</Button>
                    <Button variant="primary" type="submit" style={{ borderRadius: '8px', fontWeight: '600', padding: '0.6rem 1.2rem' }}>Save Changes</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

// --- Custom Toggle Component for Profile Dropdown --- (Keep this before ChefMainHeader)
const CustomProfileToggle = React.forwardRef(({ onClick, chefAvatarUrl, chefAvailable }, ref) => (
    <div
        ref={ref}
        onClick={e => { e.preventDefault(); onClick(e); }}
        style={{ position: 'relative', cursor: 'pointer' }}
    >
        <img
            src={chefAvatarUrl || 'https://placehold.co/42x42/DDDDDD/A0AEC0?text=C'}
            alt="Chef Profile"
            style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        />
        <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: chefAvailable ? colors.secondary : colors.errorText,
            border: `2px solid ${colors.cardBackground}`,
            position: 'absolute',
            bottom: '0',
            right: '0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
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
                alignItems: 'center', // Ensures vertical alignment
                padding: '12px 25px',
                backgroundColor: colors.cardBackground,
                borderBottom: `1px solid ${colors.borderColor}`,
                fontFamily: 'Inter, sans-serif',
                minHeight: '70px',
                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out', // Basic transition
            }}>
                {/* Brand Logo */}
                <Navbar.Brand onClick={handleDashboardClick} style={{
                    color: colors.primary,
                    fontSize: '26px',
                    fontWeight: '800',
                    letterSpacing: '-0.5px',
                    cursor: 'pointer',
                }}>
                    Jikoni Express Chef
                </Navbar.Brand>

                {/* Right Actions - Notification, Profile Dropdown, Hamburger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Notification Icon */}
                    <div
                        style={{
                            position: 'relative',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '50%',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.lightBackground}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => setShowNotifications(true)}
                    >
                        {/* Bell Icon (inline SVG) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.darkText }}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                        {unreadNotifications > 0 && (
                            <Badge pill bg="danger" style={{
                                position: 'absolute',
                                top: '0px',
                                right: '0px',
                                fontSize: '0.65rem',
                                padding: '0.35em 0.55em',
                                // Pulse effect requires CSS @keyframes or JavaScript animation library.
                                // Not possible with pure inline styles.
                            }}>
                                {unreadNotifications}
                            </Badge>
                        )}
                    </div>

                    {/* Profile Dropdown for Desktop */}
                    <Dropdown align="end" className="d-none d-lg-block">
                        <Dropdown.Toggle as={CustomProfileToggle} id="profile-dropdown" chefAvatarUrl={chefAvatarUrl} chefAvailable={chefAvailable} />
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={handleShowChefDetails}>
                                {/* GearFill Icon (inline SVG) */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.22a2 2 0 0 0 .73 2.73l.04.02a2 2 0 0 1 .91 1.07l.1.43a2 2 0 0 1 0 2l-.1.43a2 2 0 0 1-.91 1.07l-.04.02a2 2 0 0 0-.73 2.73l.78 1.22a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.22a2 2 0 0 0-.73-2.73l-.04-.02a2 2 0 0 1-.91-1.07l-.1-.43a2 2 0 0 1 0-2l.1-.43a2 2 0 0 1 .91-1.07l.04-.02a2 2 0 0 0 .73-2.73l-.78-1.22a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> Profile Settings
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleLogout}>
                                {/* BoxArrowRight Icon (inline SVG) */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg> Logout
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Hamburger Toggle for Mobile/Tablet */}
                    <Navbar.Toggle aria-controls="offcanvasNavbar" onClick={handleOffcanvasToggle} className="d-lg-none" style={{ border: 'none', backgroundColor: 'transparent', padding: '0' }}>
                        {/* List Icon (inline SVG) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.darkText }}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                    </Navbar.Toggle>
                </div>

                {/* Offcanvas Menu for Mobile/Tablet */}
                <Offcanvas
                    id="offcanvasNavbar"
                    aria-labelledby="offcanvasNavbarLabel"
                    placement="end"
                    show={showOffcanvas}
                    onHide={handleOffcanvasClose}
                    style={{ width: '300px' }}
                >
                    <Offcanvas.Header closeButton style={{ backgroundColor: colors.primary, color: 'white', borderBottom: 'none', padding: '1rem 1.5rem' }}>
                        <Offcanvas.Title id="offcanvasNavbarLabel" style={{ fontWeight: '600', fontSize: '1rem' }}>
                            Jikoni Chef
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body style={{ backgroundColor: colors.cardBackground, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '1rem', marginBottom: '1rem' }}>
                            <img
                                src={chefAvatarUrl || 'https://placehold.co/55x55/DDDDDD/A0AEC0?text=C'}
                                alt="Chef Profile"
                                style={{
                                    width: '55px',
                                    height: '55px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                }}
                            />
                            <div>
                                <h5 style={{ color: colors.darkText, margin: 0, fontWeight: '600', fontSize: '1.1rem' }}>{chefName}</h5>
                                <p style={{ color: chefAvailable ? colors.secondary : colors.errorText, margin: '4px 0 0', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    <span>●</span> {chefAvailable ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>

                        <hr style={{ borderColor: colors.borderColor, margin: '0 1rem 1rem' }} />

                        {/* Offcanvas Nav Items */}
                        <div
                            onClick={handleDashboardClick}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '0.9rem 1rem',
                                fontWeight: '500',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                color: colors.darkText,
                                marginBottom: '5px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.lightBackground; e.currentTarget.style.color = colors.primary; e.currentTarget.querySelector('svg').style.color = colors.primary; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.darkText; e.currentTarget.querySelector('svg').style.color = colors.lightText; }}
                        >
                            {/* Grid3x3GapFill Icon (inline SVG) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.lightText }}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg> Dashboard
                        </div>
                        <div
                            onClick={() => { setShowNotifications(true); handleOffcanvasClose(); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '0.9rem 1rem',
                                fontWeight: '500',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                color: colors.darkText,
                                marginBottom: '5px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.lightBackground; e.currentTarget.style.color = colors.primary; e.currentTarget.querySelector('svg').style.color = colors.primary; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.darkText; e.currentTarget.querySelector('svg').style.color = colors.lightText; }}
                        >
                            {/* Bell Icon (inline SVG) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                            Notifications
                            {unreadNotifications > 0 && (
                                <Badge pill bg="danger" className="notification-badge">
                                    {unreadNotifications}
                                </Badge>
                            )}
                        </div>
                        <div
                            onClick={handleShowChefDetails}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '0.9rem 1rem',
                                fontWeight: '500',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                color: colors.darkText,
                                marginBottom: '5px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.lightBackground; e.currentTarget.style.color = colors.primary; e.currentTarget.querySelector('svg').style.color = colors.primary; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.darkText; e.currentTarget.querySelector('svg').style.color = colors.lightText; }}
                        >
                            {/* GearFill Icon (inline SVG) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.22a2 2 0 0 0 .73 2.73l.04.02a2 2 0 0 1 .91 1.07l.1.43a2 2 0 0 1 0 2l-.1.43a2 2 0 0 1-.91 1.07l-.04.02a2 2 0 0 0-.73 2.73l.78 1.22a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.22a2 2 0 0 0-.73-2.73l-.04-.02a2 2 0 0 1-.91-1.07l-.1-.43a2 2 0 0 1 0-2l.1-.43a2 2 0 0 1 .91-1.07l.04-.02a2 2 0 0 0 .73-2.73l-.78-1.22a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> Profile Settings
                        </div>

                        <div
                            onClick={handleLogout}
                            style={{
                                marginTop: 'auto',
                                background: colors.lightBackground,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '0.9rem 1rem',
                                fontWeight: '500',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                color: colors.darkText
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E6E8EB'; e.currentTarget.style.color = colors.primary; e.currentTarget.querySelector('svg').style.color = colors.primary; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.lightBackground; e.currentTarget.style.color = colors.darkText; e.currentTarget.querySelector('svg').style.color = colors.lightText; }}
                        >
                            {/* BoxArrowRight Icon (inline SVG) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg> Logout
                        </div>
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
        </>
    );
}