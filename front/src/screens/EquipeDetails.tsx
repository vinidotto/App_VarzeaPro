import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, Image, Button, Alert, TextInput } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { fetchEquipeDetails, fetchTorneios, fetchTorneiosPorEquipe, vincularEquipeATorneio, atualizarEquipe } from '../api';
import { Picker } from '@react-native-picker/picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export type Equipe = {
  id: number;
  nome: string;
  cidade: string;
  fundacao: string;
  treinador: string;
  logo: string | null;
};

type EquipeDetailsProps = {
  route: RouteProp<RootStackParamList, 'EquipeDetails'>;
};

const EquipeDetails: React.FC<EquipeDetailsProps> = ({ route }) => {
  const { equipeId } = route.params;
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [torneios, setTorneios] = useState<any[]>([]);
  const [todosTorneios, setTodosTorneios] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTorneio, setSelectedTorneio] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Estado para armazenar as edições
  const [editedEquipe, setEditedEquipe] = useState<Equipe>({
    id: 0,
    nome: '',
    cidade: '',
    fundacao: '',
    treinador: '',
    logo: null,
  });

  const checkAdminStatus = async () => {
    const isStaff = await AsyncStorage.getItem('is_staff');
    setIsAdmin(isStaff === 'True');
  };

  useEffect(() => {
    checkAdminStatus();

    const loadEquipeDetails = async () => {
      try {
        const data = await fetchEquipeDetails(equipeId);
        if (data) {
          setEquipe(data as Equipe);
          setEditedEquipe(data as Equipe); // Preenche o estado de edição com os dados da equipe
          const torneiosData = await fetchTorneiosPorEquipe(equipeId);
          setTorneios(torneiosData);

          const todosTorneiosData = await fetchTorneios();
          setTodosTorneios(todosTorneiosData);
        } else {
          setError('Equipe não encontrada');
        }
      } catch (err) {
        setError('Erro ao carregar detalhes da equipe');
      } finally {
        setLoading(false);
      }
    };

    loadEquipeDetails();
  }, [equipeId]);

  const handleLinkEquipeToTorneio = async () => {
    if (selectedTorneio === null) {
      Alert.alert('Erro', 'Selecione um torneio');
      return;
    }

    try {
      await vincularEquipeATorneio(selectedTorneio, equipeId);
      Alert.alert('Sucesso', 'Equipe vinculada ao torneio com sucesso!');
    } catch (err) {
      Alert.alert('Erro', 'Erro ao vincular equipe ao torneio');
    }
  };

  const handleSaveEdits = async () => {
    if (!editedEquipe.id) return;

    try {
      await atualizarEquipe(equipeId, editedEquipe); // Chama a API para atualizar os dados da equipe
      setEquipe(editedEquipe);
      setIsEditing(false);
      Alert.alert('Sucesso', 'Equipe atualizada com sucesso!');
    } catch (err) {
      Alert.alert('Erro', 'Erro ao atualizar a equipe');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      {equipe ? (
        <>
          {equipe.logo && (
            <Image source={{ uri: equipe.logo }} style={styles.logo} />
          )}

          <Text style={styles.title}>{equipe.nome}</Text>

          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={editedEquipe.nome}
                onChangeText={(text) => setEditedEquipe({ ...editedEquipe, nome: text })}
                placeholder="Nome da equipe"
              />
              <TextInput
                style={styles.input}
                value={editedEquipe.cidade}
                onChangeText={(text) => setEditedEquipe({ ...editedEquipe, cidade: text })}
                placeholder="Cidade"
              />
              <TextInput
                style={styles.input}
                value={editedEquipe.fundacao}
                onChangeText={(text) => setEditedEquipe({ ...editedEquipe, fundacao: text })}
                placeholder="Fundação"
              />
              <TextInput
                style={styles.input}
                value={editedEquipe.treinador}
                onChangeText={(text) => setEditedEquipe({ ...editedEquipe, treinador: text })}
                placeholder="Treinador"
              />
            </>
          ) : (
            <>
              <Text style={styles.info}>
                <Text style={styles.bold}>Cidade:</Text> {equipe.cidade}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.bold}>Fundação:</Text> {equipe.fundacao}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.bold}>Treinador:</Text> {equipe.treinador}
              </Text>
            </>
          )}

          <Text style={styles.subtitle}>Torneios Associados:</Text>
          {torneios.length > 0 ? (
            <FlatList
              data={torneios}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.torneioCard}>
                  <Text style={styles.torneioName}>{item.nome}</Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.info}>Nenhum torneio associado.</Text>
          )}

          {isAdmin && todosTorneios.length > 0 && (
            <View style={styles.linkContainer}>
              <Text style={styles.subtitle}>Vincular ao Torneio:</Text>
              <Picker
                selectedValue={selectedTorneio}
                onValueChange={(itemValue: number | null) => setSelectedTorneio(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione um Torneio" value={null} />
                {todosTorneios.map(torneio => (
                  <Picker.Item key={torneio.id} label={torneio.nome} value={torneio.id} />
                ))}
              </Picker>

              <Button title="Vincular" onPress={handleLinkEquipeToTorneio} />
            </View>
          )}

          {isAdmin && (
            <View style={styles.editContainer}>
              {isEditing ? (
                <Button title="Salvar Alterações" onPress={handleSaveEdits} />
              ) : (
                <Button title="Editar" onPress={() => setIsEditing(true)} />
              )}
            </View>
          )}
        </>
      ) : (
        <Text style={styles.error}>Equipe não encontrada</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 18,
    marginVertical: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  torneioCard: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  torneioName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    marginVertical: 10,
  },
  editContainer: {
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default EquipeDetails;
