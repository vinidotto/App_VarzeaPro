import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type CardProps = {
  partida: {
    id: number;
    time_1: string;
    time_2: string;
    data: string;
  };
};

const Card: React.FC<CardProps> = ({ partida }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.teamName}>{partida.time_1} vs {partida.time_2}</Text>
      <Text style={styles.date}>{new Date(partida.data).toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#777',
  },
});

export default Card;
