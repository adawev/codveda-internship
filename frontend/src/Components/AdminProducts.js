import React, { useEffect, useState } from "react";
import api from "../api";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/products");
      setProducts(response.data);
    } catch (err) {
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    try {
      await api.post("/api/products", {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl || null,
      });
      setForm(emptyProduct);
      setNotice("Product created.");
      fetchProducts();
    } catch (err) {
      setError("Unable to create product.");
    }
  };

  const handleDelete = async (productId) => {
    setError(null);
    setNotice(null);
    try {
      await api.delete(`/api/products/${productId}`);
      setNotice("Product removed.");
      fetchProducts();
    } catch (err) {
      setError("Unable to delete product.");
    }
  };

  return (
    <div>
      <h3>Products</h3>
      <p className="note">Create, view, and manage storefront inventory.</p>
      <form onSubmit={handleCreate} className="form">
        <label className="field">
          <span>Name</span>
          <input
            placeholder="Product name"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Description</span>
          <input
            placeholder="Short description"
            value={form.description}
            onChange={(event) => handleChange("description", event.target.value)}
          />
        </label>
        <div className="form-row">
          <label className="field">
            <span>Price</span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={(event) => handleChange("price", event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Stock</span>
            <input
              type="number"
              placeholder="0"
              value={form.stock}
              onChange={(event) => handleChange("stock", event.target.value)}
              required
            />
          </label>
        </div>
        <label className="field">
          <span>Image URL</span>
          <input
            placeholder="https://..."
            value={form.imageUrl}
            onChange={(event) => handleChange("imageUrl", event.target.value)}
          />
        </label>
        <button type="submit">Add product</button>
      </form>

      {loading && <p className="note">Loading products...</p>}
      {error && <p className="error">{error}</p>}
      {notice && <p className="success">{notice}</p>}

      {products.length > 0 ? (
        <div className="grid admin-grid">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="card-body">
                <h4>{product.name}</h4>
                <p className="note">{product.description || "No description."}</p>
                <div className="price-row">
                  <span className="price">${product.price}</span>
                  <span className="stock">{product.stock} in stock</span>
                </div>
                <button type="button" onClick={() => handleDelete(product.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="note">No products yet.</p>
      )}
    </div>
  );
};

export default AdminProducts;
