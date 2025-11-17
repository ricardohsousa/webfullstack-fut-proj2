import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

function FiltroRodadas({ rodadasDisponiveis = [], rodadaSelecionada, onRodadaChange, anoSelecionado, onAnoChange }) {
  const anos = Array.from({ length: 2023 - 2015 + 1 }, (_, i) => 2023 - i); 

  return (
    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
      <FormControl fullWidth margin="normal">
        <InputLabel id="filtro-ano-label">Ano</InputLabel>
        <Select
          labelId="filtro-ano-label"
          value={anoSelecionado}
          label="Ano"
          onChange={onAnoChange}
        >
          {anos.map((ano) => (
            <MenuItem key={ano} value={ano}>
              {ano}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel id="filtro-rodada-label">Rodada</InputLabel>
        <Select
          labelId="filtro-rodada-label"
          value={rodadaSelecionada}
          label="Rodada"
          onChange={onRodadaChange}
        >
          {rodadasDisponiveis.map((rodada) => (
            <MenuItem key={rodada} value={rodada}>
              {rodada.replace('Regular Season -', 'Rodada')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default FiltroRodadas;