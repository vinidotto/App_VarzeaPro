import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { loginUser } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginUser(email, password);  // Certifica de que a função retorna os dois tokens
      console.log('Usuário autenticado:', user);  // Verifica o usuário retornado
      
      // Verifia se o acesso foi bem-sucedido e armazene os tokens no AsyncStorage
      if (user && user.access && user.refresh) {
        await AsyncStorage.setItem('auth_token', user.access);
        await AsyncStorage.setItem('is_staff', String(user.is_staff));
        console.log(user.is_staff)
        await AsyncStorage.setItem('refresh_token', user.refresh);
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        navigation.replace('Home');
      } else {
        throw new Error('Tokens de autenticação não encontrados.');
      }
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
      {/* Header com ícone de usuário */}
      <View style={styles.header}>
      <Image
          source={require('../../assets/logo.png')} 
          style={styles.cardImg}
        />
        <View style={styles.userIconContainer}>
          <Text style={styles.userIcon}>👤</Text>
        </View>
      </View>

      {/* Campos de E-mail e Senha */}
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Botão de Login */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>

      {/* Link para registro */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Não tem uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Cadastre-se</Text>
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
    marginTop:30,
  },
  userIcon: {
    marginTop: 10,
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
  loginButton: {
    backgroundColor: '#E16104',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#fff',
  },
  registerLink: {
    color: '#E16104',
    fontWeight: 'bold',
  },
  cardImg: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
});

export default Login;
