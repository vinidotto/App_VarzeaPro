import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchTorneio, updateTorneio } from '../api';

type RootStackParamList = {
  EditTorneio: { torneioId: number };
};

type EditTorneioProps = {
  route: RouteProp<RootStackParamList, 'EditTorneio'>;
  navigation: StackNavigationProp<RootStackParamList, 'EditTorneio'>;
};

type Torneio = {
  nome: string;
  data_inicio: string;
  data_fim: string;
  local: string;
};

const EditTorneio: React.FC<EditTorneioProps> = ({ route, navigation }) => {
  const { torneioId } = route.params;

  const [torneio, setTorneio] = useState<Torneio>({
    nome: '',
    data_inicio: '',
    data_fim: '',
    local: '',
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Buscar dados do torneio na API ao carregar
  useEffect(() => {
    const fetchTorneioData = async () => {
      try {
        const data = await fetchTorneio(torneioId);
        if (data) {
          setTorneio({
            nome: data.nome || '',
            data_inicio: data.data_inicio || '',
            data_fim: data.data_fim || '',
            local: data.local || '',
          });
        }
      } catch (error) {
        console.error('Erro ao buscar torneio', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do torneio.');
      } finally {
        setLoading(false);
      }
    };

    fetchTorneioData();
  }, [torneioId]);

  // Função para salvar as alterações
  const handleUpdateTorneio = async () => {
    if (!torneio.nome || !torneio.data_inicio || !torneio.data_fim || !torneio.local) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSaving(true);

    try {
      await updateTorneio(torneioId, torneio);
      Alert.alert('Sucesso', 'Torneio atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar torneio', error);
      Alert.alert('Erro', 'Não foi possível atualizar o torneio.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Nome do Torneio:</Text>
      <TextInput
        value={torneio.nome}
        onChangeText={(value) => setTorneio({ ...torneio, nome: value })}
        style={styles.input}
      />

      <Text>Data de Início:</Text>
      <TextInput
        value={torneio.data_inicio}
        onChangeText={(value) => setTorneio({ ...torneio, data_inicio: value })}
        style={styles.input}
      />

      <Text>Data de Fim:</Text>
      <TextInput
        value={torneio.data_fim}
        onChangeText={(value) => setTorneio({ ...torneio, data_fim: value })}
        style={styles.input}
      />

      <Text>Local:</Text>
      <TextInput
        value={torneio.local}
        onChangeText={(value) => setTorneio({ ...torneio, local: value })}
        style={styles.input}
      />

      <Button
        color="green"
        title={isSaving ? 'Salvando...' : 'Salvar Alterações'}
        onPress={handleUpdateTorneio}
        disabled={isSaving}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditTorneio;
