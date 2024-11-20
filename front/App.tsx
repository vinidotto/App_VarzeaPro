import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import AddTorneio from './src/screens/AddTorneio';
import EditTorneio from './src/screens/EditTorneio';
import DetailsTorneio from './src/screens/DetailsTorneio';
import Torneios from './src/screens/Torneios';
import Equipes from './src/screens/Equipes';
import EquipeDetails from './src/screens/EquipeDetails';
import UserDetails from './src/screens/UserDetails';  

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  AddTorneio: undefined;
  EditTorneio: { torneioId: number };
  DetailsTorneio: { torneioId: number };
  EquipeDetails: { equipeId: number };
  BottomTabs: undefined;
};

export type BottomTabParamList = {
  Torneios: undefined;
  Equipes: undefined;
  UserDetails: undefined; 
};

const Stack = createStackNavigator<RootStackParamList>();
const BottomTabs = createBottomTabNavigator<BottomTabParamList>();

function BottomTabNavigator() {
  return (
    <BottomTabs.Navigator initialRouteName="Torneios">
      <BottomTabs.Screen
        name="Torneios"
        component={Torneios}
        options={{
          title: 'Torneios',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('./assets/trofeu.png')}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <BottomTabs.Screen
        name="Equipes"
        component={Equipes}
        options={{
          title: 'Equipes',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('./assets/teams.png')}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <BottomTabs.Screen
        name="UserDetails"
        component={UserDetails}  
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('./assets/user.png')}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
    </BottomTabs.Navigator>
  );
};

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
          component={BottomTabNavigator}
          options={{ headerShown: false }}
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
        <Stack.Screen
          name="EquipeDetails"
          component={EquipeDetails}
          options={{ title: 'Detalhes da Equipe' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
