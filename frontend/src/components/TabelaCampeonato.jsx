import React, { useEffect, useReducer, useState } from 'react';
import { CircularProgress, Alert } from '@mui/material';
import FiltroRodadas from './FiltroRodadas.jsx';
import TabelaClassificacao from './TabelaClassificacao.jsx';

const initialState = {
  loading: true,
  error: null,
  rodadasDisponiveis: [],
  partidas: [],
  rodadaSelecionada: '',
  tabelaCalculada: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'CARREGADO':
      const { rodadas, partidas } = action.payload;
      return {
        ...state,
        loading: false,
        rodadasDisponiveis: rodadas,
        partidas: partidas,
        rodadaSelecionada: rodadas[0] || ''
      };
    case 'ERRO':
      return { ...state, loading: false, error: 'Falha ao buscar dados da API.' };
    case 'ESCOLHA_RODADA':
      return { ...state, rodadaSelecionada: action.payload };
    case 'CALCULAR_TABELA':
      return { ...state, tabelaCalculada: action.payload };
    default:
      return state;
  }
}

function TabelaCampeonato() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [anoSelecionado, setAnoSelecionado] = useState(2023);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'LOADING' });
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/football/championship/${anoSelecionado}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            throw new Error('Não autorizado');
          }
          throw new Error(`Houve um erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.response) {
          throw new Error('Houve um erro na API');
        }

        if (data.error) {
          throw new Error(data.error);
        }

        dispatch({
          type: 'CARREGADO',
          payload: {
            rodadas: data.response.rounds,
            partidas: data.response.fixtures
          }
        });

      } catch (error) {
        console.error('Houve um erro', error);
        dispatch({ type: 'ERRO' });
      }
    };

    fetchData();
  }, [anoSelecionado]);

  useEffect(() => {
    const calcularTabela = () => {
      if (state.partidas.length === 0 || !state.rodadaSelecionada) {
        return;
      }

      const rodadaNumero = parseInt(state.rodadaSelecionada.match(/\d+$/)[0]);

      const partidasDaRodada = state.partidas.filter(partida => {
        const rodadaPartidaNumero = parseInt(partida.league.round.match(/\d+$/)[0]);
        return rodadaPartidaNumero <= rodadaNumero && partida.fixture.status.short === 'FT';
      });

      const estatisticas = {};

      partidasDaRodada.forEach(partida => {
        const timeCasa = partida.teams.home;
        const timeFora = partida.teams.away;
        const golsCasa = partida.goals.home;
        const golsFora = partida.goals.away;

        if (!estatisticas[timeCasa.id]) estatisticas[timeCasa.id] = { id: timeCasa.id, nome: timeCasa.name, logo: timeCasa.logo, pontos: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0 };
        if (!estatisticas[timeFora.id]) estatisticas[timeFora.id] = { id: timeFora.id, nome: timeFora.name, logo: timeFora.logo, pontos: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0 };

        estatisticas[timeCasa.id].jogos++;
        estatisticas[timeFora.id].jogos++;
        estatisticas[timeCasa.id].golsPro += golsCasa;
        estatisticas[timeFora.id].golsPro += golsFora;
        estatisticas[timeCasa.id].golsContra += golsFora;
        estatisticas[timeFora.id].golsContra += golsCasa;

        if (golsCasa > golsFora) { 
          estatisticas[timeCasa.id].pontos += 3;
          estatisticas[timeCasa.id].vitorias++;
          estatisticas[timeFora.id].derrotas++;
        } else if (golsFora > golsCasa) {
          estatisticas[timeFora.id].pontos += 3;
          estatisticas[timeFora.id].vitorias++;
          estatisticas[timeCasa.id].derrotas++;
        } else {
          estatisticas[timeCasa.id].pontos++;
          estatisticas[timeFora.id].pontos++;
          estatisticas[timeCasa.id].empates++;
          estatisticas[timeFora.id].empates++;
        }
      });

      const tabelaOrdenada = Object.values(estatisticas)
        .map(time => ({ ...time, saldoGols: time.golsPro - time.golsContra }))
        .sort((a, b) => {
          if (b.pontos !== a.pontos) return b.pontos - a.pontos;
          if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
          if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;
          return b.golsPro - a.golsPro;
        })
        .map((time, index) => ({ ...time, posicao: index + 1 }));

      dispatch({ type: 'CALCULAR_TABELA', payload: tabelaOrdenada });
    };

    calcularTabela();

  }, [state.rodadaSelecionada, state.partidas]);

  if (state.loading) {
    return <CircularProgress />;
  }

  if (state.error) {
    return <Alert severity="error">{state.error}</Alert>;
  }

  return (
    <div>
      <h2>Tabela Brasileirão {anoSelecionado}</h2>

      <FiltroRodadas
        rodadasDisponiveis={state.rodadasDisponiveis}
        rodadaSelecionada={state.rodadaSelecionada}
        onRodadaChange={(e) => dispatch({ type: 'ESCOLHA_RODADA', payload: e.target.value })}
        anoSelecionado={anoSelecionado}
        onAnoChange={(e) => setAnoSelecionado(e.target.value)}
      />
      <p>Rodada selecionada: {state.rodadaSelecionada.replace('Regular Season -', 'Rodada')}</p>

      <TabelaClassificacao tabela={state.tabelaCalculada} /> 
    </div>
  );
}

export default TabelaCampeonato;
