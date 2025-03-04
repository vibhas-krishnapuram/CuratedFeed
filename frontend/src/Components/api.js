// src/api.js
import axios from "axios";

const BASE_URL = "https://curatedfeed-backend.onrender.com/api"; 

// Setup axios interceptor to add the token to all requests
const setupAuthInterceptor = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Call this when your app initializes
setupAuthInterceptor();

// Function to handle auth errors (token expiration, etc.)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('topics');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  try {
    const response = await axios.post('https://curatedfeed-backend.onrender.com/login', {
      username,
      password
    });
    
    localStorage.setItem('token', response.data['access token']);
    localStorage.setItem('topics', response.data.topics);
    
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Login failed' };
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post('https://curatedfeed-backend.onrender.com/register', userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Registration failed' };
  }
};

export const updateTopic = async (topic) => {
  try {
    const response = await axios.post('https://curatedfeed-backend.onrender.com/update_topic', { topic });
    localStorage.setItem('topics', response.data.topics);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to update topic' };
  }
};

export const fetchYoutubeVideos = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/videos`);
    return response.data.videos || [];
  } catch (error) {
    console.error("Error Fetching YT:", error);
    return [];
  }
};

export const fetchRedditPosts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/reddit`);
    return response.data || [];
  } catch (error) {
    console.error("Error Fetching Reddit:", error);
    return [];
  }
};

export const fetchGoogleLinks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/links`);
    return response.data || [];
  } catch (error) {
    console.error("Error Fetching Google:", error);
    return [];
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('topics');
  // You might want to redirect to login page here
  // or handle this in your component
};