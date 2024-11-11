import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Button, Alert, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { fetchEquipesPorTorneio, createConfronto } from '../api';

type CreateConfrontoModalProps = {
  torneioId: number;
  onClose: () => void;
};

const CreateConfrontoModal: React.FC<CreateConfrontoModalProps> = ({ torneioId, onClose }) => {
  const [equipes, setEquipes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [equipeCasaId, setEquipeCasaId] = useState<number | undefined>(undefined);
  const [equipeVisitanteId, setEquipeVisitanteId] = useState<number | undefined>(undefined);
  const [data, setData] = useState<Date>(new Date());
  const [localizacao, setLocalizacao] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  useEffect(() => {
    const loadEquipes = async () => {
      setLoading(true);
      try {
        const response = await fetchEquipesPorTorneio(torneioId);
        setEquipes(response);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar as equipes do torneio.');
      } finally {
        setLoading(false);
      }
    };

    loadEquipes();
  }, [torneioId]);

  const handleCreateConfronto = async () => {
    if (!equipeCasaId || !equipeVisitanteId || !data || !localizacao) {
      Alert.alert('Erro', 'Todos os campos devem ser preenchidos');
      return;
    }

    try {
      // Convertendo a data para o formato string ISO
      const dataString = data.toISOString();

      await createConfronto(torneioId, equipeCasaId, equipeVisitanteId, dataString, localizacao);
      Alert.alert('Sucesso', 'Confronto criado com sucesso!');
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o confronto.');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Verifica se a data foi selecionada e ajusta a data
    if (selectedDate) {
      setData(selectedDate);
    }
    // Fecha o DatePicker ao selecionar a data
    setShowDatePicker(false);
  };
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Modal transparent={true} visible={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Criar Confronto</Text>

          <Text>Equipe Casa:</Text>
          <Picker
            selectedValue={equipeCasaId}
            onValueChange={(itemValue: number) => setEquipeCasaId(itemValue)}
            style={styles.picker}
          >
            {equipes.map((equipe) => (
              <Picker.Item key={equipe.id} label={equipe.nome} value={equipe.id} />
            ))}
          </Picker>

          <Text>Equipe Visitante:</Text>
          <Picker
            selectedValue={equipeVisitanteId}
            onValueChange={(itemValue: number) => setEquipeVisitanteId(itemValue)}
            style={styles.picker}
          >
            {equipes.map((equipe) => (
              <Picker.Item key={equipe.id} label={equipe.nome} value={equipe.id} />
            ))}
          </Picker>

          <Text>Data do Confronto:</Text>
          <Button title="Escolher Data" onPress={() => setShowDatePicker(true)} />
          {showDatePicker && (
            <DateTimePicker
              value={data}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text>Localização:</Text>
          <TextInput
            value={localizacao}
            onChangeText={setLocalizacao}
            placeholder="Ex: Estádio Municipal"
            style={styles.input}
          />

          <Button title="Criar Confronto" onPress={handleCreateConfronto} />
          <Button title="Cancelar" onPress={onClose} />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: 300,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreateConfrontoModal;
