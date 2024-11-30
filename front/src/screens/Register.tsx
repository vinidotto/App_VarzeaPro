import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { registerUser } from '../api';

const Register: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const data = await registerUser(email, username, password);
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
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
      {/* Header com ícone de usuário */}
      <View style={styles.header}>
        <View style={styles.userIconContainer}>
          <Text style={styles.userIcon}>👤</Text>
        </View>
      </View>

      {/* Campos de E-mail, Nome de Usuário e Senha */}
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
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

      {/* Botão de Registro */}
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Registrar</Text>
      </TouchableOpacity>

      {/* Link para login */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Já tem uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009552',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  userIconContainer: {
    backgroundColor: '#fff',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIcon: {
    fontSize: 40,
    color: '#6200ee',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#E16104',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#fff',
  },
  loginLink: {
    color: '#E16104',
    fontWeight: 'bold',
  },
});

export default Register;
