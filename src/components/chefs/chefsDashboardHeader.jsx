// src/components/chefsDashboardHeader.js
import React, { useState } from 'react';
import { Button, Nav, Navbar, Offcanvas, Badge, Dropdown } from 'react-bootstrap';
import { Bell, Gear, List, BarChart, Person, ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import NotificationsPanel from './orders/notificationPanel'; // Assuming this path is correct

export default function ChefDashboardHeader({
  setShowAnalytics,
  setShowBikers,
  setShowProfile,
  notifications,
  markNotificationAsRead
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const unreadNotifications = (notifications || []).filter(n => !n.read).length;

  return (
    <Navbar
      expand="lg"
      className="mb-4 p-3 rounded shadow-sm chef-dashboard-navbar" // Add a class for overall styling
    >
      <div className="d-flex align-items-center">
        <Button
          variant="light"
          className="me-3 chef-dashboard-back-button" // Add a class
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="me-1" /> Back to App
        </Button>
        <Navbar.Brand className="d-flex align-items-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center chef-brand-icon-bg" // Add a class
            style={{ width: '40px', height: '40px' }} // Keep size inline if fixed
          >
            <Person size={24} />
          </div>
          <span className="ms-2 fw-bold fs-5 chef-brand-text">
            Chef Dashboard
          </span>
        </Navbar.Brand>
      </div>

      <Navbar.Toggle aria-controls="offcanvasNavbar" className="border-0 chef-navbar-toggle">
        <List />
      </Navbar.Toggle>

      <Navbar.Offcanvas
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
        placement="end"
        className="chef-offcanvas" // Add a class
      >
        <Offcanvas.Header closeButton className="chef-offcanvas-header">
          <Offcanvas.Title id="offcanvasNavbarLabel" className="chef-offcanvas-title">
            Chef Dashboard
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="justify-content-end flex-grow-1 pe-3">
            <Nav.Item className="mb-2 mb-lg-0">
              <Button
                variant="outline-primary"
                className="d-flex align-items-center position-relative w-100 chef-nav-button chef-notifications-button" // Add classes
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="me-1" />
                Notifications
                {unreadNotifications > 0 && (
                  <Badge
                    pill
                    bg="danger"
                    className="position-absolute top-0 start-100 translate-middle chef-notification-badge" // Add a class
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </Nav.Item>
            <Nav.Item className="mb-2 mb-lg-0">
              <Button
                variant="outline-secondary"
                className="d-flex align-items-center w-100 chef-nav-button chef-analytics-button" // Add classes
                onClick={setShowAnalytics}
              >
                <BarChart className="me-1" /> Analytics
              </Button>
            </Nav.Item>
            <Nav.Item className="mb-2 mb-lg-0">
              <Button
                variant="outline-secondary"
                className="d-flex align-items-center w-100 chef-nav-button chef-riders-button" // Add classes
                onClick={setShowBikers}
              >
                <Person className="me-1" /> Riders
              </Button>
            </Nav.Item>
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle
                variant="outline-secondary"
                className="d-flex align-items-center w-100 chef-nav-button chef-settings-dropdown-toggle" // Add classes
              >
                <Gear className="me-1" /> Settings
              </Dropdown.Toggle>
              <Dropdown.Menu className="chef-settings-dropdown-menu">
                <Dropdown.Item onClick={setShowProfile} className="chef-dropdown-item">
                  Chef Profile
                </Dropdown.Item>
                <Dropdown.Item className="chef-dropdown-item">Availability Settings</Dropdown.Item>
                <Dropdown.Item className="chef-dropdown-item">Payment Settings</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Offcanvas.Body>
      </Navbar.Offcanvas>

      <NotificationsPanel
        show={showNotifications}
        onHide={() => setShowNotifications(false)}
        notifications={notifications}
        markNotificationAsRead={markNotificationAsRead}
      />
    </Navbar>
  );
}