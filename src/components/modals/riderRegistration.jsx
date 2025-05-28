

import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Spinner, Alert, Badge,
  Modal, Form, Offcanvas,  Stack  , ListGroup, Tabs, Tab , ButtonGroup, Carousel, ProgressBar
} from 'react-bootstrap';
import {
  GeoAlt,  Star, StarHalf   ,Cart,  Scooter,
  CheckCircle, EggFried, FilterLeft,    StarFill, CartPlus, Person, Clock,  Instagram, Facebook, Twitter , Plus,  Dash, Trash, Pencil, Bell
} from 'react-bootstrap-icons';


const RiderRegistration = ({ show, onClose, onSubmit }) => (
  <Modal show={show} onHide={onClose} centered>
    <Modal.Header closeButton>
      <Modal.Title>Rider Registration</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form
        onSubmit={e => {
          e.preventDefault();
          onSubmit(Object.fromEntries(new FormData(e.target)));
        }}
      >
        <Form.Group className="mb-3">
          <Form.Label>National ID</Form.Label>
          <Form.Control name="nationalId" type="text" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>City</Form.Label>
          <Form.Control name="city" type="text" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Area</Form.Label>
          <Form.Control name="area" type="text" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Neighborhood</Form.Label>
          <Form.Control name="neighborhood" type="text" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Vehicle Type</Form.Label>
          <Form.Select name="vehicle" required>
            <option>Bicycle</option>
            <option>Motorcycle</option>
            <option>Car</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Registration Number Plate</Form.Label>
          <Form.Control name="registrationPlate" type="text" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Preferred Work Hours</Form.Label>
          <Form.Control name="workHours" type="text" placeholder="e.g. 9am - 5pm" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Service Area</Form.Label>
          <Form.Control name="serviceArea" type="text" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            name="terms"
            type="checkbox"
            label="I agree to the Terms and Conditions"
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" block>
          Register
        </Button>
      </Form>
    </Modal.Body>
  </Modal>
);

export  default   RiderRegistration
