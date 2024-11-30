import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  TextInput,
} from 'react-native';
import { fetchTorneios, deleteTorneio } from '../api';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [search, setSearch] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const fetchTorneiosData = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const data: Torneio[] = await fetchTorneios(searchTerm);
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

  useEffect(() => {
    fetchTorneiosData();
    const unsubscribe = navigation.addListener('focus', () => fetchTorneiosData(search));
    
    const checkAdminStatus = async () => {
      const isStaff = await AsyncStorage.getItem('is_staff');
      setIsAdmin(isStaff === 'True');  
      
    };
    checkAdminStatus();

    return unsubscribe;
  }, [navigation, search]);

  const handleSave = useCallback(
    (torneioId: number) => {
      setSaved((prevSaved) => {
        if (prevSaved.includes(torneioId)) {
          return prevSaved.filter((id) => id !== torneioId);
        } else {
          return [...prevSaved, torneioId];
        }
      });
    },
    [saved]
  );

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
          source={require('../../assets/torneio-bg.png')}
          style={styles.cardImg}
        />

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Text style={styles.cardDates}>Início: {formatDate(item.data_inicio)}</Text>
          <Text style={styles.cardDates}>Fim: {formatDate(item.data_fim)}</Text>
          <Text style={styles.cardLocation}>Localização: {item.localizacao}</Text>

          <View style={styles.buttonContainer}>
            {isAdmin && (
              <>
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
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar torneios..."
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          fetchTorneiosData(text);
        }}
      />
      {isAdmin && (
        <Button
          color="green"
          title="Adicionar Torneio"
          onPress={() => navigation.navigate('AddTorneio')}
          disabled={loading}
        />
      )}
      <FlatList
        data={torneios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTorneio}
        refreshing={loading}
        onRefresh={() => fetchTorneiosData(search)}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Nenhum torneio encontrado.</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
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
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});

export default Home;
