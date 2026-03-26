import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTasks = () => api.get('/tasks/');
export const createTask = (task) => api.post('/tasks/', task);
export const updateTask = (id, task) => api.put(`/tasks/${id}/`, task);
export const deleteTask = (id) => api.delete(`/tasks/${id}/`);

export default api;