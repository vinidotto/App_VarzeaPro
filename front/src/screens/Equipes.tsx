import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Button, Modal, Image } from 'react-native';
import { fetchEquipes } from '../api';
import CreateEquipeModal from '../components/CreateEquipeModal'; 

type Equipe = {
  id: number;
  nome: string;
  logo_url: string | null;
  logo: string | null;
  cidade: string | null;
  fundacao: string | null;
  treinador: string | null;
};



type EquipesProps = {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
};

const BASE_URL = 'https://blindly-dominant-akita.ngrok-free.app';

const Equipes: React.FC<EquipesProps> = ({ navigation }) => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadEquipes = async () => {
      try {
        const data = await fetchEquipes();
        setEquipes(data as Equipe[]);  
      } catch (err) {
        setError('Erro ao carregar equipes');
      } finally {
        setLoading(false);
      }
    };
  
    loadEquipes();
  }, []);
  

  const handleOpenCreateEquipeModal = () => {
    setModalVisible(true);
  };

  const handleCloseCreateEquipeModal = () => {
    setModalVisible(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
    <Button title="Criar Equipe" onPress={handleOpenCreateEquipeModal} color="orange" />
      <FlatList
        data={equipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.equipeItem}
            onPress={() => navigation.navigate('EquipeDetails', { equipeId: item.id })}
          >
            <View style={styles.equipeInfo}>
                <Image
                  source={{ uri: `${BASE_URL}${item.logo_url}` }}
                  style={styles.logo}
                />
              <Text style={styles.equipeNome}>{item.nome}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseCreateEquipeModal}
      >
        <CreateEquipeModal torneioId={0} onClose={handleCloseCreateEquipeModal} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  equipeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  equipeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 8,
    resizeMode: 'contain',
  },
  equipeNome: {
    fontSize: 18,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Equipes;