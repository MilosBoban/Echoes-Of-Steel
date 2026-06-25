import axios from 'axios';

// Promijeni port (npr. 5000 ili 8000) u zavisnosti od toga na kom portu radi tvoj Node.js backend
const API = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Presretač (Interceptor) koji automatski dodaje token u svaki zahtjev prema backendu
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;