import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';

function Register({ onRegisterSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        onRegisterSuccess();
      } else {
        setError(data.message || 'Houve um erro no cadastro');
      }
    } catch (err) {
      setError('Houve um erro!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
        margin: 'auto',
        padding: 3,
        border: '1px solid #ccc',
        borderRadius: 2,
        mt: 5,
      }}
    >
      <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
        Cadastro
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Usuário registrado com sucesso!</Alert>}
      <TextField
        label="Username"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <TextField
        label="Password"
        variant="outlined"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? 'Cadastrando...' : 'Confirme'}
      </Button>
      <Button variant="text" onClick={() => window.location.hash = '#/login'}>
        Volte para o Login
      </Button>
    </Box>
  );
}

export default Register;
