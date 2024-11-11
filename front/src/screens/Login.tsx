import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { loginUser } from '../api';  

const Login: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true); 
    try {
      const user = await loginUser(email, password);

      // Se o login for bem-sucedido, exibe a mensagem e redireciona para a Home
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      navigation.replace('Home'); // Redireciona para a tela Home após o login
    } catch (error) {
      // Se ocorrer algum erro, exibe a mensagem de erro
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
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button
        title="Entrar"
        onPress={handleLogin}
        disabled={loading} 
      />
      <Button
        title="Registrar"
        onPress={() => navigation.navigate('Register')} 
      />
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

export default Login;
