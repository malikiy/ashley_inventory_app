import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ashleyinventorybe-production.up.railway.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
