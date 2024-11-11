import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, Button, StyleSheet, FlatList } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchTorneio, fetchProximasPartidas } from '../api';
import CreateEquipeModal from '../components/CreateEquipeModal';
import CreateConfrontoModal from '../components/CreateConfrontoModal';
type RootStackParamList = {
  DetailsTorneio: { torneioId: number };
};

type Torneio = {
  nome: string;
  data_inicio: string;
  data_fim: string;
  localizacao: string;
};

type Partida = {
  time1: string;
  time2: string;
  data: string;
};

type DetailsTorneioProps = {
  route: RouteProp<RootStackParamList, 'DetailsTorneio'>;
  navigation: StackNavigationProp<RootStackParamList, 'DetailsTorneio'>;
};

const DetailsTorneio: React.FC<DetailsTorneioProps> = ({ route }) => {
  const { torneioId } = route.params;

  const [torneio, setTorneio] = useState<Torneio | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEquipeModalVisible, setIsEquipeModalVisible] = useState<boolean>(false); // Modal de equipe
  const [isConfrontoModalVisible, setIsConfrontoModalVisible] = useState<boolean>(false); // Modal de confronto

  useEffect(() => {
    const fetchTorneioData = async () => {
      try {
        const data = await fetchTorneio(torneioId);
        setTorneio(data);
      } catch (error) {
        console.error('Erro ao buscar torneio', error);
        Alert.alert('Erro', 'Não foi possível carregar os detalhes do torneio.');
      } finally {
        setLoading(false);
      }
    };

    const fetchPartidasData = async () => {
      try {
        const data = await fetchProximasPartidas(torneioId);
        setPartidas(data);
      } catch (error) {
        console.error('Erro ao buscar partidas', error);
        Alert.alert('Erro', 'Não foi possível carregar as partidas.');
      }
    };

    fetchTorneioData();
    fetchPartidasData();
  }, [torneioId]);

  const openCreateEquipeModal = () => {
    setIsEquipeModalVisible(true);
  };

  const closeCreateEquipeModal = () => {
    setIsEquipeModalVisible(false);
  };

  const openCreateConfrontoModal = () => {
    setIsConfrontoModalVisible(true);
  };

  const closeCreateConfrontoModal = () => {
    setIsConfrontoModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!torneio) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Detalhes do torneio não encontrados.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{torneio.nome}</Text>
      <Text style={styles.details}>Data de Início: {torneio.data_inicio}</Text>
      <Text style={styles.details}>Data de Fim: {torneio.data_fim}</Text>
      <Text style={styles.details}>Local: {torneio.localizacao}</Text>

      {/* Botões para abrir as modais */}
      <Button title="Adicionar Equipe" onPress={openCreateEquipeModal} />
      <Button title="Adicionar Confronto" onPress={openCreateConfrontoModal} />

      {isEquipeModalVisible && (
        <CreateEquipeModal torneioId={torneioId} onClose={closeCreateEquipeModal} />
      )}

      {isConfrontoModalVisible && (
        <CreateConfrontoModal torneioId={torneioId} onClose={closeCreateConfrontoModal} />
      )}

      <Text style={styles.sectionTitle}>Próximos Confrontos:</Text>

      {partidas.length === 0 ? (
        <Text style={styles.noMatchesText}>Não há confrontos agendados.</Text>
      ) : (
        <FlatList
          data={partidas}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.matchCard}>
              <Text style={styles.matchText}>
                {item.time1} vs {item.time2}
              </Text>
              <Text style={styles.matchText}>Data: {item.data}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  details: {
    fontSize: 18,
    marginVertical: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  matchCard: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
  },
  matchText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  noMatchesText: {
    fontSize: 16,
    color: 'gray',
  },
});

export default DetailsTorneio;
