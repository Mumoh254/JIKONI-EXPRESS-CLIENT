import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';

export default function FoodPostForm({ show, onHide, setFoods }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch("http://localhost:8000/apiV1/smartcity-ke/create/food", {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Food created successfully!',
          showConfirmButton: false,
          timer: 1500
        });
        setFoods(data);
        onHide();
        e.target.reset();
      } else {
        Swal.fire('Error', data.message || 'Failed to create food', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Network error. Please try again', 'error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create New Food</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control name="title" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control name="description" as="textarea" rows={3} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Price (KES)</Form.Label>
            <Form.Control name="price" type="number" min="1" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Meal Type</Form.Label>
            <Form.Control name="mealType" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Food Images</Form.Label>
            <Form.Control name="images" type="file" multiple required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Area</Form.Label>
            <Form.Control name="area" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Chef ID</Form.Label>
            <Form.Control name="chefId" required />
          </Form.Group>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Food
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}