import React, { useState, useEffect } from 'react';
import TabelaCampeonato from './components/TabelaCampeonato.jsx';
import Login from './components/Login.jsx';
import { Button, Box } from '@mui/material';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {isLoggedIn ? (
        <>
          <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ mb: 2 }}>
            Logout
          </Button>
          <TabelaCampeonato />
        </>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </Box>
  );
}

export default App;