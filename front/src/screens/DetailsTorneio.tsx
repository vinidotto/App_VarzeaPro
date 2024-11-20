import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, Button, StyleSheet, ImageBackground } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchTorneio } from '../api';
import PartidasList from '../components/CardConfronto';
import CreateConfrontoModal from '../components/CreateConfrontoModal';
import CreateEquipeModal from '../components/CreateEquipeModal';

type RootStackParamList = {
  DetailsTorneio: { torneioId: number };
};

type Torneio = {
  nome: string;
  data_inicio: string;
  data_fim: string;
  localizacao: string;
};

type DetailsTorneioProps = {
  route: RouteProp<RootStackParamList, 'DetailsTorneio'>;
  navigation: StackNavigationProp<RootStackParamList, 'DetailsTorneio'>;
};

const DetailsTorneio: React.FC<DetailsTorneioProps> = ({ route }) => {
  const { torneioId } = route.params;

  const [torneio, setTorneio] = useState<Torneio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [equipeModalVisible, setEquipeModalVisible] = useState(false); // Controle da visibilidade da modal de criação de equipe

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

    fetchTorneioData();
  }, [torneioId]);

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
      <ImageBackground
        source={require('../../assets/torneio-bg.png')} 
        style={styles.headerBackground}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>{torneio.nome}</Text>
          <Text style={styles.headerDetails}>Data: {torneio.data_inicio} - {torneio.data_fim}</Text>
          <Text style={styles.headerDetails}>Local: {torneio.localizacao}</Text>
        </View>
      </ImageBackground>

      {/* Botões */}
      <Button
        title="Criar Confronto"
        onPress={() => setModalVisible(true)}
        color="#4CAF50"
      />
      <Button
        title="Criar Equipe"
        onPress={() => setEquipeModalVisible(true)} // Abre a modal de criação de equipe
        color="#FFA500"
      />
      <PartidasList torneioId={torneioId} />
      {modalVisible && (
        <CreateConfrontoModal
          torneioId={torneioId}
          onClose={() => setModalVisible(false)}
        />
      )}
      {equipeModalVisible && (
        <CreateEquipeModal
          torneioId={torneioId}
          onClose={() => setEquipeModalVisible(false)} // Fecha a modal ao criar equipe
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  headerBackground: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
  },
  headerImage: {},
  headerContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerDetails: {
    fontSize: 16,
    color: '#fff',
  },
  details: {
    fontSize: 18,
    marginVertical: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DetailsTorneio;
