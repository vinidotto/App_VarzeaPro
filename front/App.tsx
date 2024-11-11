import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './src/screens/Home';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import AddTorneio from './src/screens/AddTorneio';
import EditTorneio from './src/screens/EditTorneio';
import DetailsTorneio from './src/screens/DetailsTorneio';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
  AddTorneio: undefined;
  EditTorneio: { torneioId: number };
  DetailsTorneio: { torneioId: number }; 
};


const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ title: 'Login' }}
        />
        <Stack.Screen 
          name="Register" 
          component={Register} 
          options={{ title: 'Registro' }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: 'Página Inicial' }}
        />
        <Stack.Screen
          name="AddTorneio"
          component={AddTorneio} 
          options={{ title: 'Adicionar Torneio' }}
        />
        <Stack.Screen
          name="EditTorneio"
          component={EditTorneio} 
          options={{ title: 'Editar Torneio' }}
        />
          <Stack.Screen
          name="DetailsTorneio"
          component={DetailsTorneio} 
          options={{ title: 'Detalhes do Torneio' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    textAlign: 'center',
  },
});
