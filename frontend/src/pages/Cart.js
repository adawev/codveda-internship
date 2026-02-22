import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/cart");
      setCart(response.data);
    } catch (err) {
      setError("Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (itemId) => {
    setError(null);
    try {
      await api.delete(`/api/cart/items/${itemId}`);
      fetchCart();
    } catch (err) {
      setError("Unable to remove item.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Your cart</p>
          <h2>Review your picks</h2>
          <p className="note">Ready to check out? Create an order when you are set.</p>
        </div>
        <div className="page-actions">
          <Link className="button button-secondary" to="/">
            Continue shopping
          </Link>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="note">Loading your cart...</p>}

      {cart && cart.items.length > 0 ? (
        <ul className="list">
          {cart.items.map((item) => (
            <li key={item.id} className="list-item">
              <span>
                {item.productName} - {item.quantity} x ${item.price}
              </span>
              <button type="button" onClick={() => handleRemove(item.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p className="note">Cart is empty.</p>
      )}
    </div>
  );
};

export default Cart;
