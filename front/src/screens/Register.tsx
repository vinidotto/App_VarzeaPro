import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { registerUser } from '../api'; 

const Register: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const data = await registerUser(email, username, password);
      navigation.replace('Home');
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Erro', error.message);
      } else {
        Alert.alert('Erro', 'Erro desconhecido. Tente novamente.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Nome de usuário"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Registrar" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});

export default Register;
