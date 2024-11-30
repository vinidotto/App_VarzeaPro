import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import EditConfrontoModal from './EditConfrontoModal';
import { fetchProximasPartidas, updatePartida } from '../api';

const BASE_URL = 'https://blindly-dominant-akita.ngrok-free.app';

type PartidasListProps = {
  torneioId: number;
  isAdmin: boolean;
};

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

const PartidasList: React.FC<PartidasListProps> = ({ torneioId, isAdmin }) => {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartida, setSelectedPartida] = useState<Partida | null>(null);

  useEffect(() => {
    const loadPartidas = async () => {
      try {
        const data = await fetchProximasPartidas(torneioId);
        setPartidas(data);
      } catch (error) {
        console.error('Erro ao buscar partidas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPartidas();
  }, [torneioId]);

  const handleSavePartida = async (updatedPartida: Partida) => {
    try {
      await updatePartida(updatedPartida.id, updatedPartida); // Atualiza a API
      setPartidas((prev) =>
        prev.map((partida) =>
          partida.id === updatedPartida.id ? updatedPartida : partida
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar partida:', error);
    }
  };

  if (loading) {
    return <Text style={styles.loading}>Carregando...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {partidas.length === 0 ? (
        <Text style={styles.noMatches}>Não há partidas disponíveis.</Text>
      ) : (
        partidas.map((partida) => (
          <TouchableOpacity
            key={partida.id}
            style={styles.card}
            onPress={() => isAdmin && setSelectedPartida(partida)} // Só abre a modal se for admin
          >
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
          </TouchableOpacity>
        ))
      )}
      {selectedPartida && (
        <EditConfrontoModal
          visible={!!selectedPartida}
          partida={selectedPartida}
          onClose={() => setSelectedPartida(null)}
          onSave={handleSavePartida}
        />
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
    flex: 1,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  teamName: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    flexWrap: 'wrap',
  },
  score: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
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
