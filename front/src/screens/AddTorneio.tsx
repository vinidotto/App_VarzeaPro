import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { createTorneio } from '../api';

const AddTorneio: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [local, setLocal] = useState('');
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
    if (!nome || !dataInicio || !dataFim || !local) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos!');
      return;
    }
  
    console.log('Dados enviados para a API:', {
      nome,
      data_inicio: dataInicio,
      data_fim: dataFim,
      localizacao: local,  // Alterado de 'local' para 'localizacao'
    });
  
    setLoading(true);
    try {
      await createTorneio({
        nome,
        data_inicio: dataInicio,
        data_fim: dataFim,
        localizacao: local,  
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
        placeholderTextColor="#000"
        value={nome}
        onChangeText={setNome}
      />

      <TouchableOpacity onPress={() => setStartDatePickerVisible(true)}>
        <View style={styles.datePicker}>
          <Text style={styles.dateText}>
            {dataInicio ? dataInicio : 'Selecione a data de início'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setEndDatePickerVisible(true)}>
        <View style={styles.datePicker}>
          <Text style={styles.dateText}>
            {dataFim ? dataFim : 'Selecione a data de fim'}
          </Text>
        </View>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Local"
        placeholderTextColor="#000"
        value={local}
        onChangeText={setLocal}
      />

      <TouchableOpacity onPress={handleAddTorneio} disabled={loading}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Adicionar Torneio</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </View>
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
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    color: '#000',
  },
  datePicker: {
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 12,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  dateText: {
    color: '#000',
  },
  button: {
    backgroundColor: '#000',
    padding: 10,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddTorneio;
