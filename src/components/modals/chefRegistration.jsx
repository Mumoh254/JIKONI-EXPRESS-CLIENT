


import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Spinner, Alert, Badge,
  Modal, Form, Offcanvas,  Stack  , ListGroup, Tabs, Tab , ButtonGroup, Carousel, ProgressBar
} from 'react-bootstrap';
import {
  GeoAlt,  Star, StarHalf   ,Cart,  Scooter,
  CheckCircle, EggFried, FilterLeft,    StarFill, CartPlus, Person, Clock,  Instagram, Facebook, Twitter , Plus,  Dash, Trash, Pencil, Bell
} from 'react-bootstrap-icons';


  const ChefRegistrationModal = ({ show, onClose, onSubmit }) => (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Chef Registration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          onSubmit({
            bio: formData.get('bio'),
            speciality: formData.get('speciality'),
            experienceYears: parseInt(formData.get('experienceYears')),
            certifications: formData.get('certifications').split(','),
            location: formData.get('location'),
            city: formData.get('city'),
            latitude: parseFloat(formData.get('latitude')),
            longitude: parseFloat(formData.get('longitude'))
          });
        }}>
          <Form.Group className="mb-3">
            <Form.Label>Bio</Form.Label>
            <Form.Control name="bio" as="textarea" rows={3} required />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Specialty</Form.Label>
            <Form.Select name="speciality" required>
              <option value="African Cuisine">African Cuisine</option>
              <option value="Continental">Continental</option>
              <option value="Fusion">Fusion</option>
            </Form.Select>
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Years of Experience</Form.Label>
            <Form.Control name="experienceYears" type="number" min="0" required />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Certifications (comma separated)</Form.Label>
            <Form.Control name="certifications" placeholder="HACCP, Food Safety" />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control name="location" required />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control name="city" defaultValue="Nairobi" required />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Latitude</Form.Label>
            <Form.Control name="latitude" type="number" step="any" required />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Longitude</Form.Label>
            <Form.Control name="longitude" type="number" step="any" required />
          </Form.Group>
  
          <Button type="submit" variant="primary" className="w-100">
            Register as Chef
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );

  export   default  ChefRegistrationModal