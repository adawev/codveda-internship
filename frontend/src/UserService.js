import api from "./api";

const API_URL = "/api/users";

export const getUsers = () => api.get(API_URL);
export const getUser = (id) => api.get(`${API_URL}/${id}`);
export const createUser = (user) => api.post(API_URL, user);
export const updateUser = (id, user) => api.put(`${API_URL}/${id}`, user);
export const deleteUser = (id) => api.delete(`${API_URL}/${id}`);
