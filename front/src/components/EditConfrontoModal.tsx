import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type EditConfrontoModalProps = {
  visible: boolean;
  onClose: () => void;
  partida: {
    id: number;
    gols_Equipe_casa: number;
    gols_Equipe_visitante: number;
    localizacao: string;
    data: string;
    Equipe_casa: { nome: string };
    Equipe_visitante: { nome: string };
  };
  onSave: (updatedPartida: any) => void;
};

const EditConfrontoModal: React.FC<EditConfrontoModalProps> = ({ visible, onClose, partida, onSave }) => {
  const [golsCasa, setGolsCasa] = useState(partida.gols_Equipe_casa.toString());
  const [golsVisitante, setGolsVisitante] = useState(partida.gols_Equipe_visitante.toString());
  const [localizacao, setLocalizacao] = useState(partida.localizacao);
  const [data, setData] = useState(new Date(partida.data));
  const [showDatePicker, setShowDatePicker] = useState<boolean | "date" | "time" | "datetime">(false);

  const handleSave = () => {
    if (isNaN(parseInt(golsCasa)) || isNaN(parseInt(golsVisitante))) {
      Alert.alert('Erro', 'Os gols devem ser números válidos.');
      return;
    }

    onSave({
      ...partida,
      gols_Equipe_casa: parseInt(golsCasa),
      gols_Equipe_visitante: parseInt(golsVisitante),
      localizacao,
      data: data.toISOString(),
    });
    onClose();
  };

  const showDateTimePicker = () => {
    if (Platform.OS === 'android') {
      Alert.alert(
        "Seleção de Data e Hora",
        "Deseja selecionar a Data ou a Hora?",
        [
          { text: "Data", onPress: () => setShowDatePicker("date") },
          { text: "Hora", onPress: () => setShowDatePicker("time") },
          { text: "Cancelar", onPress: () => setShowDatePicker(false), style: "cancel" },
        ],
        { cancelable: true }
      );
    } else {
      setShowDatePicker("datetime");
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setData(selectedDate);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar Confronto</Text>

          {/* Nomes das equipes */}
          <Text style={styles.teamName}>{partida.Equipe_casa.nome}</Text>
          <View style={styles.scoreRow}>
            <TouchableOpacity onPress={() => setGolsCasa((prev) => (parseInt(prev) + 1).toString())}>
              <Text style={styles.scoreButton}>+</Text>
            </TouchableOpacity>
            <Text style={styles.scoreText}>{golsCasa}</Text>
            <TouchableOpacity onPress={() => setGolsCasa((prev) => (parseInt(prev) - 1).toString())}>
              <Text style={styles.scoreButton}>-</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.teamName}>{partida.Equipe_visitante.nome}</Text>
          <View style={styles.scoreRow}>
            <TouchableOpacity onPress={() => setGolsVisitante((prev) => (parseInt(prev) + 1).toString())}>
              <Text style={styles.scoreButton}>+</Text>
            </TouchableOpacity>
            <Text style={styles.scoreText}>{golsVisitante}</Text>
            <TouchableOpacity onPress={() => setGolsVisitante((prev) => (parseInt(prev) - 1).toString())}>
              <Text style={styles.scoreButton}>-</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Localização:</Text>
          <TextInput
            style={styles.input}
            value={localizacao}
            onChangeText={setLocalizacao}
          />

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
              onChange={handleDateChange}
            />
          )}

          <View style={styles.buttonContainer}>
            <Button title="Salvar" onPress={handleSave} color="#4CAF50" />
            <Button title="Cancelar" onPress={onClose} color="#F44336" />
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
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  scoreButton: {
    fontSize: 20,
    marginHorizontal: 10,
    color: '#007BFF',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default EditConfrontoModal;
