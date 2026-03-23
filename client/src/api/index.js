import axios from 'axios';

const api = axios.create({
  baseURL: 'https://true-fitness-api.onrender.com/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('tf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tf_token');
      localStorage.removeItem('tf_trainer');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;