import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Button, TextInput, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createConfronto, fetchEquipesPorTorneio } from '../api';

type CreateConfrontoModalProps = {
  torneioId: number;
  onClose: () => void;
};

const CreateConfrontoModal: React.FC<CreateConfrontoModalProps> = ({ torneioId, onClose }) => {
  const [equipes, setEquipes] = useState<{ id: number; nome: string }[]>([]);
  const [equipeCasa, setEquipeCasa] = useState<string | number>(''); 
  const [equipeVisitante, setEquipeVisitante] = useState<string | number>(''); 

  const [data, setData] = useState<Date>(new Date());
  const [localizacao, setLocalizacao] = useState('');
  const [showDatePicker, setShowDatePicker] = useState<boolean | "date" | "time" | "datetime">(false);

  useEffect(() => {
    const fetchEquipes = async () => {
      try {
        const data = await fetchEquipesPorTorneio(torneioId);
        setEquipes(data);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar as equipes.');
      }
    };

    fetchEquipes();
  }, [torneioId]);

  const handleCreateConfronto = async () => {
    if (equipeCasa && equipeVisitante && localizacao) {
      try {
        await createConfronto(torneioId, Number(equipeCasa), Number(equipeVisitante), data.toISOString(), localizacao);
        Alert.alert('Sucesso', 'Confronto criado com sucesso.');
        onClose(); // Fecha a modal após a criação do confronto
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível criar o confronto.');
      }
    } else {
      Alert.alert('Erro', 'Preencha todos os campos.');
    }
  };

  const showDateTimePicker = () => {
    if (Platform.OS === 'android') {
      Alert.alert(
        "Seleção de Data e Hora",
        "Deseja selecionar a Data ou a Hora?",
        [
          {
            text: "Data",
            onPress: () => setShowDatePicker("date"),
          },
          {
            text: "Hora",
            onPress: () => setShowDatePicker("time"),
          },
          { text: "Cancelar", onPress: () => setShowDatePicker(false), style: "cancel" },
        ],
        { cancelable: true }
      );
    } else {
      setShowDatePicker("datetime");
    }
  };

  return (
    <Modal visible={true} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Criar Confronto</Text>

          {/* Seleção de Equipe Casa */}
          <Text style={styles.label}>Equipe Casa</Text>
          <Picker
            selectedValue={equipeCasa}
            onValueChange={(itemValue) => setEquipeCasa(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Selecione a equipe" value={null} />
            {equipes.map((equipe) => (
              <Picker.Item key={`equipeCasa-${equipe.id}`} label={equipe.nome} value={equipe.id} />
            ))}
          </Picker>

          {/* Seleção de Equipe Visitante */}
          <Text style={styles.label}>Equipe Visitante</Text>
          <Picker
            selectedValue={equipeVisitante}
            onValueChange={(itemValue) => setEquipeVisitante(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Selecione a equipe" value={null} />
            {equipes.map((equipe) => (
              <Picker.Item key={`equipeVisitante-${equipe.id}`} label={equipe.nome} value={equipe.id} />
            ))}
          </Picker>

          {/* Seleção de Data e Hora */}
          <Text style={styles.label}>Data e Hora</Text>
          <TouchableOpacity onPress={showDateTimePicker} style={styles.dateButton}>
            <Text>{data.toLocaleString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={data}
              mode={showDatePicker as "date" | "time" | "datetime"}
              display="default"
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowDatePicker(false);
                if (selectedDate) setData(selectedDate);
              }}
            />
          )}

          {/* Campo de Localização */}
          <Text style={styles.label}>Localização</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o local do confronto"
            value={localizacao}
            onChangeText={setLocalizacao}
          />

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <Button title="Cancelar" onPress={onClose} color="#888" />
            <Button title="Criar Confronto" onPress={handleCreateConfronto} color="#4CAF50" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default CreateConfrontoModal;
