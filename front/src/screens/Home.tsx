import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { fetchTorneios, deleteTorneio } from '../api';
import { FontAwesome } from '@expo/vector-icons';  

type Torneio = {
  nome: string;
  data_inicio: string;
  data_fim: string;
  localizacao: string;
  id: number;
};

type HomeProps = {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    addListener: (event: string, callback: () => void) => void;
  };
};

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const [torneios, setTorneios] = useState<Torneio[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<number[]>([]);

  // Função para buscar os torneios da API
  const fetchTorneiosData = async () => {
    setLoading(true);
    try {
      const data: Torneio[] = await fetchTorneios();
      if (Array.isArray(data)) {
        setTorneios(data);
      } else {
        Alert.alert('Erro', 'Dados de torneios inválidos.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar os torneios.');
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir o torneio
  const handleDeleteTorneio = async (torneioId: number) => {
    setLoading(true);
    try {
      await deleteTorneio(torneioId);
      fetchTorneiosData(); 
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível deletar o torneio.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar torneios e configurar o listener
  useEffect(() => {
    fetchTorneiosData(); 
    const unsubscribe = navigation.addListener('focus', fetchTorneiosData);
    return unsubscribe;
  }, [navigation]);

  // Função para marcar ou desmarcar como favorito
  const handleSave = useCallback((torneioId: number) => {
    setSaved((prevSaved) => {
      if (prevSaved.includes(torneioId)) {
        return prevSaved.filter(id => id !== torneioId);
      } else {
        return [...prevSaved, torneioId];
      }
    });
  }, [saved]);

  const renderTorneio = ({ item }: { item: Torneio }) => {
    if (!item || !item.id) return null;

    const isSaved = saved.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DetailsTorneio', { torneioId: item.id })}
        disabled={loading}
      >
        <View style={styles.cardLikeWrapper}>
          <TouchableOpacity onPress={() => handleSave(item.id)}>
            <FontAwesome
              color={isSaved ? '#ea266d' : '#222'}
              name="heart"
              solid={isSaved}
              size={20}
            />
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: 'https://via.placeholder.com/200x120' }}  
          style={styles.cardImg}
        />

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Text style={styles.cardDates}>Início: {item.data_inicio}</Text>
          <Text style={styles.cardDates}>Fim: {item.data_fim}</Text>
          <Text style={styles.cardLocation}>Localização: {item.localizacao}</Text>

          <View style={styles.buttonContainer}>
            <Button
              title="Editar"
              color="#E16104"
              onPress={() => navigation.navigate('EditTorneio', { torneioId: item.id })}
              disabled={loading}
            />
            <Button
              title="Excluir"
              color="red"
              onPress={() => handleDeleteTorneio(item.id)}
              disabled={loading}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Button
        color="green"
        title="Adicionar Torneio"
        onPress={() => navigation.navigate('AddTorneio')}
        disabled={loading}
      />
      <FlatList
        data={torneios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTorneio}
        refreshing={loading}
        onRefresh={fetchTorneiosData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  cardLikeWrapper: {
    alignItems: 'flex-end',
  },
  cardImg: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 10,
  },
  cardBody: {
    marginTop: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  cardDates: {
    fontSize: 14,
    color: '#555',
  },
  cardLocation: {
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 5,
  },
});

export default Home;
