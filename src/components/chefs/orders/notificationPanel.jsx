// src/components/NotificationsPanel.js
import React, { useEffect, useRef } from 'react';
import { Offcanvas, ListGroup, Badge, Button } from 'react-bootstrap';
import { Bell, CheckCircle } from 'react-bootstrap-icons';

// Color palette (as you have it)
const colors = {
  primary: '#FF4532', // Jikoni Red
  secondary: '#00C853', // Jikoni Green
  darkText: '#1A202C',
  lightBackground: '#F0F2F5',
  cardBackground: '#FFFFFF',
  borderColor: '#D1D9E6',
  errorText: '#EF4444',
  placeholderText: '#A0AEC0',
  buttonHover: '#E6392B',
  disabledButton: '#CBD5E1',
};

const NotificationsPanel = ({ show, onHide, notifications, markNotificationAsRead }) => {
  const audioRef = useRef(null);
  const unreadNotifications = (notifications || []).filter(n => !n.read).length;

  // Play sound when new notification arrives
  useEffect(() => {
    // Only play sound if there are unread notifications and the panel is not showing
    // This prevents the sound from playing every time the panel re-renders
    if (audioRef.current && unreadNotifications > 0 && !show) {
      audioRef.current.play();

      // Trigger system notification
      if (Notification.permission === 'granted') {
        new Notification('New Order!', {
          body: `You have ${unreadNotifications} new order${unreadNotifications > 1 ? 's' : ''} to prepare`,
          icon: '/jikoni-logo.png',
          vibrate: [200, 100, 200],
        });
      }
    }
  }, [unreadNotifications, show]); // Add 'show' to dependency array

  // Request notification permission on first load
  useEffect(() => {
    if (!('Notification' in window)) return;

    if (Notification.permission !== 'granted' &&
        Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      {/* Hidden audio element for notifications */}
      <audio ref={audioRef}>
        <source src="/notification-sound.mp3" type="audio/mpeg" />
      </audio>

      <Offcanvas
        show={show}
        onHide={onHide}
        placement="end"
        style={{ backgroundColor: colors.lightBackground }}
      >
        <Offcanvas.Header
          closeButton
          closeVariant="white"
          style={{
            backgroundColor: colors.primary,
            color: 'white',
            borderBottom: `1px solid ${colors.borderColor}`
          }}
        >
          <Offcanvas.Title className="d-flex align-items-center">
            <Bell className="me-2" /> Notifications
            {unreadNotifications > 0 && (
              <Badge
                bg="light"
                className="ms-2"
                style={{ color: colors.primary }}
              >
                {unreadNotifications}
              </Badge>
            )}
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body style={{ padding: 0 }}>
          <div
            className="d-flex justify-content-end p-3"
            style={{
              backgroundColor: colors.cardBackground,
              borderBottom: `1px solid ${colors.borderColor}`
            }}
          >
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => notifications.forEach(n => markNotificationAsRead(n.id))}
              disabled={unreadNotifications === 0}
              style={{
                color: colors.primary,
                borderColor: colors.primary,
                backgroundColor: 'transparent',
                fontWeight: '500',
                borderRadius: '20px',
                padding: '4px 16px',
                transition: 'all 0.2s',
                ...(unreadNotifications > 0 && {
                  ':hover': {
                    backgroundColor: colors.primary,
                    color: 'white'
                  }
                })
              }}
            >
              Mark all as read
            </Button>
          </div>

          {(notifications?.length || 0) === 0 ? (
            <div
              className="text-center py-5"
              style={{ backgroundColor: colors.cardBackground }}
            >
              <div
                className="rounded-circle d-inline-flex p-4 mb-3"
                style={{ backgroundColor: colors.lightBackground }}
              >
                <Bell size={48} style={{ color: colors.placeholderText }} />
              </div>
              <h5
                className="mb-2"
                style={{ color: colors.darkText }}
              >
                No Notifications
              </h5>
              <p style={{ color: colors.placeholderText }}>
                Your notifications will appear here
              </p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {notifications.map(notification => (
                <ListGroup.Item
                  key={notification.id}
                  action
                  onClick={() => markNotificationAsRead(notification.id)}
                  style={{
                    padding: '16px',
                    borderLeft: notification.read ? 'none' : `3px solid ${colors.primary}`,
                    backgroundColor: notification.read
                      ? colors.cardBackground
                      : 'rgba(255, 69, 50, 0.05)',
                    borderBottom: `1px solid ${colors.borderColor}`,
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: colors.lightBackground
                        }}
                      >
                        <Bell
                          size={20}
                          style={{ color: notification.read ? colors.placeholderText : colors.primary }}
                        />
                      </div>
                    </div>

                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <h6
                          className="mb-1"
                          style={{
                            color: colors.darkText,
                            fontWeight: notification.read ? 'normal' : '600'
                          }}
                        >
                          {notification.title}
                        </h6>
                        <small style={{ color: colors.placeholderText }}>
                          {notification.time}
                        </small>
                      </div>

                      <p
                        className="mb-0 mt-1"
                        style={{ color: colors.darkText }}
                      >
                        {notification.message}
                      </p>

                      {!notification.read && (
                        <small
                          className="d-flex align-items-center mt-2"
                          style={{
                            color: colors.primary,
                            fontWeight: '500'
                          }}
                        >
                          <CheckCircle className="me-1" size={14} />
                          New order
                        </small>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default NotificationsPanel;