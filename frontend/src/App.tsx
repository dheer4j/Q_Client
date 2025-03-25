import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Registration from './components/Auth/Registration';
import QuantumKeyExchange from './components/Auth/QuantumKeyExchange';
import DarkThemeProvider from './components/Layout/DarkThemeProvider';
import QuantumEmailClient from './components/Email/QuantumEmailClient';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <DarkThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Registration /> : <Navigate to="/" />} />
          <Route path="/key-exchange" element={isAuthenticated ? <QuantumKeyExchange /> : <Navigate to="/login" />} />
          <Route path="/" element={isAuthenticated ? <QuantumEmailClient /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </DarkThemeProvider>
  );
};

export default App;
