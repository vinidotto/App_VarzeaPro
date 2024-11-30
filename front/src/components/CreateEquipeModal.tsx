import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createEquipeParaTorneio } from '../api';

type CreateEquipeModalProps = {
  torneioId: number;
  onClose: () => void;
};

const CreateEquipeModal: React.FC<CreateEquipeModalProps> = ({ torneioId, onClose }) => {
  const [teamName, setTeamName] = useState('');
  const [cidade, setCidade] = useState('');
  const [treinador, setTreinador] = useState('');
  const [fundacao, setFundacao] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !cidade.trim() || !treinador.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await createEquipeParaTorneio(torneioId, {
        nome: teamName,
        cidade,
        treinador,
        fundacao: fundacao.toISOString().split('T')[0],
      });
      Alert.alert('Sucesso', 'Equipe criada com sucesso');
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Houve um problema ao criar a equipe. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={true} onRequestClose={onClose}>
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

          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            value={cidade}
            onChangeText={setCidade}
            placeholder="Digite a cidade"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Treinador</Text>
          <TextInput
            style={styles.input}
            value={treinador}
            onChangeText={setTreinador}
            placeholder="Digite o nome do treinador"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Data de Fundação</Text>
          <TextInput
            style={styles.input}
            value={fundacao.toLocaleDateString('pt-BR')}
            onFocus={() => setShowDatePicker(true)}
            placeholder="Escolha a data"
            editable={false}
          />

          {showDatePicker && (
            <DateTimePicker
              value={fundacao}
              mode="date"
              display="default"
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowDatePicker(false);
                if (selectedDate) setFundacao(selectedDate);
              }}
            />
          )}

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreateTeam}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Criando...' : 'Criar Equipe'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  createButton: {
    backgroundColor: 'green',
  },
  closeButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateEquipeModal;
