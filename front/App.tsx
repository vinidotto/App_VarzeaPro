import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Login from './src/screens/LoginModern';
import Register from './src/screens/RegisterModern';
import AddTorneio from './src/screens/AddTorneioModern';
import EditTorneio from './src/screens/EditTorneio';
import DetailsTorneio from './src/screens/DetailsTorneioModern';
import Torneios from './src/screens/TorneiosModern';
import Equipes from './src/screens/EquipesModern';
import EquipeDetails from './src/screens/EquipeDetailsModern';
import UserDetails from './src/screens/UserDetailsModern';
import { colors } from './src/theme';

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

const Stack = createNativeStackNavigator<RootStackParamList>();
const BottomTabs = createBottomTabNavigator<BottomTabParamList>();

function BottomTabNavigator() {
  return (
    <BottomTabs.Navigator
      initialRouteName="Torneios"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 0,
          backgroundColor: colors.surface,
          elevation: 12,
          shadowColor: '#163A2B',
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => {
          const icon = route.name === 'Torneios'
            ? 'trophy-outline'
            : route.name === 'Equipes'
              ? 'people-outline'
              : 'person-outline';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <BottomTabs.Screen
        name="Torneios"
        component={Torneios}
        options={{
          title: 'Torneios',
        }}
      />
      <BottomTabs.Screen
        name="Equipes"
        component={Equipes}
        options={{
          title: 'Equipes',
        }}
      />
      <BottomTabs.Screen
        name="UserDetails"
        component={UserDetails}  
        options={{
          title: 'Perfil',
        }}
      />
    </BottomTabs.Navigator>
  );
};

export default function App() {
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.primaryDark,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: colors.primaryDark },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          headerBackTitle: 'Voltar',
        }}
      >
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
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
