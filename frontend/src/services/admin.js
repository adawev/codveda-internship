import api from "../api";

export const getUsers = () => api.get("/api/users?page=0&size=100&sort=createdAt,desc");
export const removeUser = (id) => api.delete(`/api/users/${id}`);

export const getProducts = () => api.get("/api/products?page=0&size=100&sort=createdAt,desc");
export const createProduct = (payload) => api.post("/api/products", payload);
export const updateProduct = (id, payload) => api.put(`/api/products/${id}`, payload);
export const removeProduct = (id) => api.delete(`/api/products/${id}`);

export const getOrders = () => api.get("/api/orders/admin?page=0&size=100&sort=createdAt,desc");
export const updateOrderStatus = (id, status) => api.put(`/api/orders/${id}/status`, { status });
export const removeOrder = (id) => api.delete(`/api/orders/${id}`);
