import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatPage from "./pages/ChatPage";
import AddUserPage from './pages/AddUserPage';
import LoginPage from './pages/LoginPage';// Ensure this is correctly imported
import ProtectedRoute from './utils/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          {/* Protect the ChatPage */}
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/adduser" element={ <ProtectedRoute><AddUserPage /></ProtectedRoute>} />

          {/* Login Page remains unprotected for obvious reasons */}
          <Route path="/" element={<LandingPage/>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
