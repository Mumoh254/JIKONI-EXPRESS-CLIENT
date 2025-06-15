// useProducts.js
import { useState, useEffect } from "react";

const UseProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/get/foods");
      const data = await res.json();
      console.log(data)
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, fetchProducts };
};

export default UseProducts;
