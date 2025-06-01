import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export default function EditFoodModal({ show, food, onHide, onUpdate }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch(`/api/foods/${food.id}`, {
        method: "PUT",
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onUpdate(data);
        onHide();
      }
    } catch (error) {
      console.error('Error updating food:', error);
    }
  };

  if (!food) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit {food.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control 
              name="title" 
              defaultValue={food.title} 
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              name="description" 
              as="textarea" 
              rows={3} 
              defaultValue={food.description} 
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Price (KES)</Form.Label>
            <Form.Control 
              name="price" 
              type="number" 
              min="1" 
              defaultValue={food.price} 
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Meal Type</Form.Label>
            <Form.Control 
              name="mealType" 
              defaultValue={food.mealType} 
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Update Images</Form.Label>
            <Form.Control name="images" type="file" multiple />
          </Form.Group>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Food
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}