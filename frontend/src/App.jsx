import React, { useState, useEffect } from 'react';
import TabelaCampeonato from './components/TabelaCampeonato.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import { Button, Box } from '@mui/material';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [route, setRoute] = useState(window.location.hash || '#/login');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/login');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    window.location.hash = '#/';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.hash = '#/login';
  };

  const handleRegisterSuccess = () => {
    window.location.hash = '#/';
  };

  const renderContent = () => {
    if (isLoggedIn) {
      if (route === '#/registerUser') {
        return (
          <Box>
            <Button variant="outlined" onClick={() => window.location.hash = '#/'} sx={{ mb: 2 }}>
              Volte ao Campeonato
            </Button>
            <Register onRegisterSuccess={handleRegisterSuccess} />
          </Box>
        );
      }
      return (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="outlined" color="secondary" onClick={handleLogout}>
              Sair
            </Button>
            <Button variant="outlined" onClick={() => window.location.hash = '#/registerUser'}>
              Cadastre um novo usuário
            </Button>
          </Box>
          <TabelaCampeonato />
        </>
      );
    }

    if (route === '#/register') {
      return <Register onRegisterSuccess={handleRegisterSuccess} />;
    }

    return <Login onLoginSuccess={handleLoginSuccess} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      {renderContent()}
    </Box>
  );
}

export default App;