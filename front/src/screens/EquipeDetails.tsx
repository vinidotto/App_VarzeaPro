import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, Image, Alert, TextInput, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { fetchEquipeDetails, fetchTorneios, fetchTorneiosPorEquipe, vincularEquipeATorneio, atualizarEquipe } from '../api';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { uploadLogo } from '../api';

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

  const [editedEquipe, setEditedEquipe] = useState<Equipe>({
    id: 0,
    nome: '',
    cidade: '',
    fundacao: '',
    treinador: '',
    logo: null,
  });

  const [selectedLogo, setSelectedLogo] = useState<any>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const checkAdminStatus = async () => {
    const isStaff = await AsyncStorage.getItem('is_staff');
    setIsAdmin(isStaff === 'True');
  };

  const loadEquipeDetails = async () => {
    setLoading(true);
    try {
      const data = await fetchEquipeDetails(equipeId);
      if (data) {
        setEquipe(data as Equipe);
        setEditedEquipe(data as Equipe);

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

  useEffect(() => {
    checkAdminStatus();
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
      loadEquipeDetails();
    } catch (err) {
      Alert.alert('Erro', 'Erro ao vincular equipe ao torneio');
    }
  };

  const handleSelectLogo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (!permissionResult.granted) {
      Alert.alert('Erro', 'É necessário permitir o acesso à galeria!');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      const logo = result.assets[0];
      const formData = new FormData();
      formData.append('logo', {
        uri: logo.uri,
        name: 'logo.png',
        type: 'image/png',
      } as any);
  
      setIsUploading(true);
      try {
        const response = await uploadLogo(equipeId, formData);
        setEquipe((prev) => prev && { ...prev, logo: response.logo_url });
        Alert.alert('Sucesso', 'Logo atualizada com sucesso!');
        loadEquipeDetails();
      } catch (err) {
        Alert.alert('Erro', 'Falha ao enviar a logo.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUploadLogo = async () => {
    if (!selectedLogo) {
      Alert.alert('Erro', 'Nenhuma imagem selecionada.');
      return;
    }

    const formData = new FormData();
    formData.append('logo', {
      uri: selectedLogo.uri,
      name: 'logo.png',
      type: 'image/png',
    } as any);

    setIsUploading(true);
    try {
      const result = await uploadLogo(equipeId, formData);
      setEquipe((prev) => prev && { ...prev, logo: result.logo_url });
      Alert.alert('Sucesso', 'Logo atualizada com sucesso!');
      loadEquipeDetails();
    } catch (err) {
      Alert.alert('Erro', 'Falha ao enviar a logo.');
    } finally {
      setIsUploading(false);
      setSelectedLogo(null);
    }
  };

  const handleSaveEdits = async () => {
    if (!editedEquipe.id) return;

    try {
      await atualizarEquipe(equipeId, editedEquipe);
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
          <Image
            source={
              equipe.logo
                ? { uri: equipe.logo }
                : require('../../assets/template_logo.png')
            }
            style={styles.logo}
          />
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <TouchableOpacity style={styles.buttonLogo} onPress={handleSelectLogo}>
              <Text style={styles.buttonText}>Selecionar Logo</Text>
            </TouchableOpacity>
            {selectedLogo && (
              <Image
                source={{ uri: selectedLogo.uri }}
                style={{ width: 100, height: 100, marginVertical: 10, borderRadius: 50 }}
              />
            )}
            {isUploading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              selectedLogo && (
                <TouchableOpacity style={styles.button} onPress={handleUploadLogo}>
                  <Text style={styles.buttonText}>Enviar Logo</Text>
                </TouchableOpacity>
              )
            )}
          </View>

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
              <TouchableOpacity style={styles.button} onPress={handleSaveEdits}>
                <Text style={styles.buttonText}>Salvar Alterações</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setIsEditing(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>{equipe.nome}</Text>
              <Text style={styles.info}>
                <Text style={styles.bold}>Cidade:</Text> {equipe.cidade}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.bold}>Fundação:</Text> {equipe.fundacao}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.bold}>Treinador:</Text> {equipe.treinador}
              </Text>
              {isAdmin && (
                <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <Text style={styles.subtitle}>Torneios Vinculados</Text>
          <FlatList
            data={torneios}
            renderItem={({ item }) => (
              <View style={styles.torneioCard}>
                <Text style={styles.torneioName}>{item.nome}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />

          <View style={styles.linkContainer}>
            <Picker
              selectedValue={selectedTorneio}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedTorneio(itemValue)}
            >
              <Picker.Item label="Selecione um torneio" value={null} />
              {todosTorneios.map((torneio) => (
                <Picker.Item key={torneio.id} label={torneio.nome} value={torneio.id} />
              ))}
            </Picker>
            <TouchableOpacity style={styles.button} onPress={handleLinkEquipeToTorneio}>
              <Text style={styles.buttonText}>Vincular ao Torneio</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text>Equipe não encontrada</Text>
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
    borderWidth: 2,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  torneioCard: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  torneioName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 20,
  },
  picker: {
    backgroundColor: '#f9f9f9',
    height: 50,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  torneioLinkConteiner: {
    backgroundColor: '#f9f9f9',
    marginTop: 20,
    borderRadius: 5,
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#E16104',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLogo: {
    backgroundColor: 'green',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonDisabledText: {
    color: '#777',
  },
});

export default EquipeDetails;
