import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, StyleSheet, Image } from 'react-native';
import { fetchProximasPartidas } from '../api';

type Equipe = {
  id: number;
  nome: string;
  logo_url: string | null;
  cidade: string | null;
  fundacao: string | null;
  treinador: string | null;
};

type Partida = {
  id: number;
  data: string;
  localizacao: string;
  gols_Equipe_casa: number;
  gols_Equipe_visitante: number;
  campeonato: number;
  Equipe_casa: Equipe;
  Equipe_visitante: Equipe;
};

const BASE_URL = 'https://blindly-dominant-akita.ngrok-free.app';

const PartidasList: React.FC<{ torneioId: number }> = ({ torneioId }) => {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPartidas = async () => {
      try {
        const data = await fetchProximasPartidas(torneioId);
        console.log('Resposta da API:', data);
        setPartidas(data);
      } catch (error) {
        console.error('Erro ao buscar partidas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPartidas();
  }, [torneioId]);

  if (loading) {
    return <Text style={styles.loading}>Carregando...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {partidas.length === 0 ? (
        <Text style={styles.noMatches}>Não há partidas disponíveis.</Text>
      ) : (
        partidas.map((partida) => (
          <View key={partida.id} style={styles.card}>
            <View style={styles.teams}>
              <View style={styles.team}>
                {partida.Equipe_casa.logo_url ? (
                  <Image 
                    source={{ uri: `${BASE_URL}${partida.Equipe_casa.logo_url}` }} 
                    style={styles.logo} 
                  />
                ) : (
                  <Text>Logo indisponível</Text>
                )}
                <Text style={styles.teamName}>{partida.Equipe_casa.nome}</Text>
              </View>

              <View style={styles.score}>
                <Text style={styles.scoreText}>
                  {partida.gols_Equipe_casa} : {partida.gols_Equipe_visitante}
                </Text>
                <Text style={styles.status}>Encerrado</Text>
              </View>

              <View style={styles.team}>
                {partida.Equipe_visitante.logo_url ? (
                  <Image 
                    source={{ uri: `${BASE_URL}${partida.Equipe_visitante.logo_url}` }} 
                    style={styles.logo} 
                  />
                ) : (
                  <Text>Logo indisponível</Text>
                )}
                <Text style={styles.teamName}>{partida.Equipe_visitante.nome}</Text>
              </View>
            </View>

            <Text style={styles.location}>{partida.localizacao}</Text>
            <Text style={styles.date}>
              {new Date(partida.data).toLocaleString('pt-BR', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
  noMatches: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#999',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  teams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  team: {
    alignItems: 'center',
    flex: 1, // Permite que as equipes tenham tamanho proporcional
  },
  logo: {
    width: 50, // Tamanho consistente para as logos
    height: 50,
    marginBottom: 8,
    resizeMode: 'contain', // Ajusta a imagem sem cortar
  },
  teamName: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    flexWrap: 'wrap', // Permite quebrar o texto para nomes longos
  },
  score: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16, // Espaçamento entre o placar e os times
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});

export default PartidasList;
