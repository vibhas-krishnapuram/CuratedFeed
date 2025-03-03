// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login';
import Register from './Components/Register';
import ResourceFeed from './Components/ResourceFeed';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/feed" 
          element={
            <ProtectedRoute>
              <ResourceFeed />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/feed" replace />} />
      </Routes>
    </Router>
  );
}

export default App;