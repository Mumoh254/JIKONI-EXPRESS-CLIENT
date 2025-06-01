import React from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function FoodItemsTable({ foods, loading, setState, deleteFood }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Fetching food items...</p>
      </div>
    );
  }

  if (!foods.length) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No food items available.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ width: '100px' }}>Item</th>
            <th>Details</th>
            <th className="d-none d-md-table-cell">Description</th>
            <th>Price</th>
            <th className="d-none d-sm-table-cell">Type</th>
            <th className="d-none d-lg-table-cell">Posted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {foods.map(food => (
            <tr key={food.id}>
              <td>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img
                    src={food.photoUrls[0]}
                    alt={food.title}
                    className="img-fluid"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                  {food.photoUrls.length > 1 && (
                    <span className="badge bg-dark position-absolute bottom-0 end-0 m-1">
                      +{food.photoUrls.length - 1}
                    </span>
                  )}
                </div>
              </td>

              <td>
                <div className="d-flex flex-column">
                  <strong className="mb-1">{food.title}</strong>
                  <div className="d-flex d-md-none gap-1 flex-wrap">
                    <span className="badge bg-primary">KES {food.price}</span>
                    <span className="badge bg-info">{food.mealType}</span>
                    <small className="text-muted">
                      {formatDistanceToNow(new Date(food.createdAt), { addSuffix: true })}
                    </small>
                  </div>
                </div>
              </td>

              <td className="d-none d-md-table-cell">
                <p className="text-muted small mb-0 line-clamp-2">
                  {food.description}
                </p>
              </td>

              <td className="d-none d-md-table-cell">
                <span className="badge bg-primary">KES {food.price}</span>
              </td>

              <td className="d-none d-sm-table-cell">
                <span className="badge bg-info">{food.mealType}</span>
              </td>

              <td className="d-none d-lg-table-cell">
                <small className="text-muted">
                  {formatDistanceToNow(new Date(food.createdAt), { addSuffix: true })}
                </small>
              </td>

              <td>
                <div className="d-flex gap-2 align-items-center">
                  <button
                    type="button"
                    className="btn blue btn-sm hover-effect"
                    onClick={() => setState(prev => ({ ...prev, showEditFood: food }))}
                  >
                    <i className="bi bi-pencil me-1"></i> Edit
                  </button>

                  <button
                    type="button"
                    className="btn red btn-sm hover-effect text-white"
                    onClick={() => deleteFood(food.id)}
                  >
                    <i className="bi bi-trash me-1"></i> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
