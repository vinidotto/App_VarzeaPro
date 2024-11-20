import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, TextInput, Alert, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getUserDetails, logoffUser, updateUserDetails } from '../api'; 

type RootStackParamList = {
  UserDetails: undefined;
  Login: undefined;
};

const UserDetails: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await getUserDetails();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao buscar os detalhes do usuário', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  const handleLogoff = async () => {
    try {
      await logoffUser();
      Alert.alert('Logoff realizado com sucesso');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao fazer logoff:', error);
      Alert.alert('Erro ao fazer logoff');
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'ID do usuário não encontrado.');
      return;
    }

    try {
      // Atualiza os detalhes do usuário usando a rota padrão de atualização
      await updateUserDetails(user.id, {
        nome_completo: user.nome_completo,
        email: user.email,
        telefone: user.telefone,
        cidade: user.cidade
      });
      Alert.alert('Alterações salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      Alert.alert('Erro ao salvar alterações');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detalhes do Usuário</Text>
      {user ? (
        <View style={styles.details}>
          <TextInput
            style={styles.input}
            placeholder="Nome Completo"
            value={user.nome_completo || ''}
            onChangeText={(text) => setUser({ ...user, nome_completo: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={user.email}
            onChangeText={(text) => setUser({ ...user, email: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={user.telefone || ''}
            onChangeText={(text) => setUser({ ...user, telefone: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Cidade"
            value={user.cidade || ''}
            onChangeText={(text) => setUser({ ...user, cidade: text })}
          />
          <View style={styles.buttonContainer}>
            <Button title="Salvar Alterações" onPress={handleSave} color="#4CAF50" />
            <Button title="Fazer Logoff" onPress={handleLogoff} color="#F44336" />
          </View>
        </View>
      ) : (
        <Text style={styles.text}>Nenhum detalhe disponível</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  details: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fafafa',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  text: {
    fontSize: 18,
    color: '#666',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserDetails;
