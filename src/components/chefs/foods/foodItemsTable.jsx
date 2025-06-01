import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import popSound from '../../../../public/audio/cliks.mp3';

const BASE_URL = "http://localhost:8000/apiV1/smartcity-ke/get";
const MySwal = withReactContent(Swal);

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

const playSound = () => {
  new Audio(popSound).play();
};

export default function FoodItemsTable() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditFood, setShowEditFood] = useState(null);
  const [error, setError] = useState(null);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/foods`);
      const allFoods = res.data;
      const chefId = localStorage.getItem('chefId');
      const filteredFoods = chefId
        ? allFoods.filter(food => String(food.chef?.id) === String(chefId))
        : allFoods;
      setFoods(filteredFoods);
      console.log('filtered  foods   '  ,   filteredFoods)
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError('Failed to fetch food items.');
    } finally {
      setLoading(false);
    }
  };

  const deleteFood = async (id) => {
    playSound();
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      setFoods(prev => prev.filter(food => food.id !== id));
      Toast.fire({
        icon: 'success',
        title: 'Food item deleted successfully!',
      });
    } catch (err) {
      console.error('Error deleting food:', err.message);
      Toast.fire({
        icon: 'error',
        title: 'Failed to delete food item.',
      });
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

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
    <div className="container py-4">
      <h3 className="mb-4">Food Items</h3>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

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
                      onClick={() => {
                        playSound();
                        setShowEditFood(food);
                        Toast.fire({ icon: 'info', title: 'Edit mode activated' });
                      }}
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
    </div>
  );
}
