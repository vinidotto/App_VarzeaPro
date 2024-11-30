import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { createTorneio } from '../api';

const AddTorneio: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [localizacao, setLocal] = useState('');
  const [loading, setLoading] = useState(false);

  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

  const handleStartDateConfirm = (date: Date) => {
    setDataInicio(date.toISOString().split('T')[0]);
    setStartDatePickerVisible(false);
  };

  const handleEndDateConfirm = (date: Date) => {
    setDataFim(date.toISOString().split('T')[0]);
    setEndDatePickerVisible(false);
  };

  const handleAddTorneio = async () => {
    if (!nome || !dataInicio || !dataFim || !localizacao) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos!');
      return;
    }
  
    console.log('Dados enviados para a API:', {
      nome,
      data_inicio: dataInicio,
      data_fim: dataFim,
      localizacao: localizacao, 
    });
  
    setLoading(true);
    try {
      await createTorneio({
        nome,
        data_inicio: dataInicio,
        data_fim: dataFim,
        localizacao: localizacao,  
      });
  
      Alert.alert('Sucesso', 'Torneio adicionado com sucesso!');
      navigation.goBack();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Erro', error.message);
      } else {
        Alert.alert('Erro', 'Ocorreu um erro desconhecido.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome do Torneio"
        placeholderTextColor="#7D7D7D"
        value={nome}
        onChangeText={setNome}
      />

      <TouchableOpacity onPress={() => setStartDatePickerVisible(true)} style={styles.datePickerButton}>
        <Text style={styles.dateText}>
          {dataInicio ? dataInicio : 'Selecione a data de início'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setEndDatePickerVisible(true)} style={styles.datePickerButton}>
        <Text style={styles.dateText}>
          {dataFim ? dataFim : 'Selecione a data de fim'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Localização"
        placeholderTextColor="#7D7D7D"
        value={localizacao}
        onChangeText={setLocal}
      />

      <TouchableOpacity onPress={handleAddTorneio} disabled={loading} style={styles.button}>
        <Text style={styles.buttonText}>Adicionar Torneio</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
        <Text style={styles.buttonText}>Cancelar</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={() => setStartDatePickerVisible(false)}
      />

      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={() => setEndDatePickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F7F7F7', 
  },
  input: {
    height: 45,
    borderColor: '#DDDDDD',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
    color: '#333',
    borderRadius: 8,
  },
  datePickerButton: {
    height: 45,
    borderColor: '#DDDDDD',
    borderWidth: 1,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 10,
    borderRadius: 8,
  },
  dateText: {
    color: '#7D7D7D', 
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50', 
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336', 
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddTorneio;
