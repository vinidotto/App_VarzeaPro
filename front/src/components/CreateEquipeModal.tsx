import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createEquipe } from '../api'; 

type CreateEquipeModalProps = {
  torneioId: number;
  onClose: () => void;
};

const CreateEquipeModal: React.FC<CreateEquipeModalProps> = ({ torneioId, onClose }) => {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert('Erro', 'O nome da equipe não pode estar vazio.');
      return;
    }

    setLoading(true);
    try {
      // Chame a função do API para criar a equipe e vincular ao torneio
      await createEquipe(torneioId, teamName);
      Alert.alert('Sucesso', 'Equipe criada com sucesso');
      onClose();  // Feche a modal após a criação da equipe
    } catch (error) {
      Alert.alert('Erro', 'Houve um problema ao criar a equipe. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Adicionar Nova Equipe</Text>
        <Text style={styles.label}>Nome da Equipe</Text>
        <TextInput
          style={styles.input}
          value={teamName}
          onChangeText={setTeamName}
          placeholder="Digite o nome da equipe"
          autoCapitalize="words"
        />
        <Button
          title={loading ? 'Criando...' : 'Criar Equipe'}
          onPress={handleCreateTeam}
          disabled={loading}
        />
        <Button title="Fechar" onPress={onClose} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    width: '100%',
    borderRadius: 5,
    borderColor: '#ccc',
    fontSize: 16,
  },
});

export default CreateEquipeModal;
