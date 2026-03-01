import api from "./api";

const defaultPageParams = (page, size) => ({
  page: Math.max(0, page ?? 0),
  size: Math.max(1, size ?? 10),
  sort: "createdAt,desc",
});

export const getUsers = (page = 0, size = 10) => api.get("/api/users", { params: defaultPageParams(page, size) });
export const removeUser = (id) => api.delete(`/api/users/${id}`);

export const getProducts = (page = 0, size = 10) => api.get("/api/products", { params: defaultPageParams(page, size) });
export const createProduct = (payload) => api.post("/api/products", payload);
export const updateProduct = (id, payload) => api.put(`/api/products/${id}`, payload);
export const removeProduct = (id) => api.delete(`/api/products/${id}`);

export const getOrders = (page = 0, size = 10) => api.get("/api/orders/admin", { params: defaultPageParams(page, size) });
export const updateOrderStatus = (id, status) => api.put(`/api/orders/${id}/status`, { status });
export const removeOrder = (id) => api.delete(`/api/orders/${id}`);
