import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";

const Products = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/products");
      setProducts(response.data);
    } catch (err) {
      setError("Unable to load products right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, value) => {
    const quantity = Number(value);
    setQuantities((prev) => ({
      ...prev,
      [productId]: Number.isNaN(quantity) ? 1 : Math.max(1, quantity),
    }));
  };

  const handleAddToCart = async (productId) => {
    setError(null);
    setNotice(null);
    const quantity = quantities[productId] ?? 1;
    try {
      await api.post("/api/cart/items", { productId, quantity });
      setNotice("Added to cart.");
    } catch (err) {
      setError("Please sign in to add items to your cart.");
    }
  };

  const closeModal = () => setSelectedProduct(null);

  const hasProducts = useMemo(() => products.length > 0, [products]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2>Shop the latest items</h2>
          <p className="note">Add items to your cart and place orders in seconds.</p>
        </div>
        <div className="page-actions">
          {isAuthenticated ? (
            <Link className="button button-secondary" to="/cart">
              View cart
            </Link>
          ) : (
            <Link className="button button-secondary" to="/login">
              Sign in to shop
            </Link>
          )}
        </div>
      </div>

      {loading && <p className="note">Loading products...</p>}
      {error && <p className="error">{error}</p>}
      {notice && <p className="success">{notice}</p>}

      {!loading && !hasProducts && (
        <div className="empty">
          <h3>No products yet</h3>
          <p className="note">Check back soon for new arrivals.</p>
        </div>
      )}

      {hasProducts && (
        <div className="grid">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="card-media">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="media-fallback">{product.name.charAt(0)}</div>
                )}
              </div>
              <div className="card-body">
                <h3>{product.name}</h3>
                <p className="note">{product.description || "No description available."}</p>
                <div className="price-row">
                  <span className="price">${product.price}</span>
                  <span className="stock">{product.stock} in stock</span>
                </div>
                {isAuthenticated ? (
                  <div className="card-actions">
                    <label className="input-group">
                      <span>Qty</span>
                      <input
                        type="number"
                        min="1"
                        value={quantities[product.id] ?? 1}
                        onChange={(event) => handleQuantityChange(product.id, event.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className="button"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      Add to cart
                    </button>
                  </div>
                ) : (
                  <Link className="button" to="/login">
                    Login to add
                  </Link>
                )}
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setSelectedProduct(product)}
                >
                  Quick view
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={closeModal}>
              ✕
            </button>
            <div className="modal-body">
              <div className="modal-media">
                {selectedProduct.imageUrl ? (
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
                ) : (
                  <div className="media-fallback">{selectedProduct.name.charAt(0)}</div>
                )}
              </div>
              <div className="modal-content">
                <h3>{selectedProduct.name}</h3>
                <p className="note">
                  {selectedProduct.description || "No description available."}
                </p>
                <div className="price-row">
                  <span className="price">${selectedProduct.price}</span>
                  <span className="stock">{selectedProduct.stock} in stock</span>
                </div>
                {isAuthenticated ? (
                  <div className="card-actions">
                    <label className="input-group">
                      <span>Qty</span>
                      <input
                        type="number"
                        min="1"
                        value={quantities[selectedProduct.id] ?? 1}
                        onChange={(event) =>
                          handleQuantityChange(selectedProduct.id, event.target.value)
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="button"
                      onClick={() => handleAddToCart(selectedProduct.id)}
                    >
                      Add to cart
                    </button>
                  </div>
                ) : (
                  <Link className="button" to="/login">
                    Login to add
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
