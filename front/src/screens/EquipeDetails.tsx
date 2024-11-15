import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { RootStackParamList } from '../../App';
import { fetchEquipeDetails, fetchTorneiosPorEquipe, uploadEquipeLogo } from '../api';

export type Equipe = {
  id: number;
  nome: string;
  cidade: string;
  fundacao: string;
  treinador: string;
  logo: string| null;
};

type EquipeDetailsProps = {
  route: RouteProp<RootStackParamList, 'EquipeDetails'>;
};

const EquipeDetails: React.FC<EquipeDetailsProps> = ({ route }) => {
  const { equipeId } = route.params;
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [torneios, setTorneios] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEquipeDetails = async () => {
      try {
        const data = await fetchEquipeDetails(equipeId);
        setEquipe(data as Equipe);
        const torneiosData = await fetchTorneiosPorEquipe(equipeId);
        setTorneios(torneiosData);
      } catch (err) {
        setError('Erro ao carregar detalhes da equipe');
      } finally {
        setLoading(false);
      }
    };

    loadEquipeDetails();
  }, [equipeId]);

  const handleLogoUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });
  
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (file.uri && equipe) {
          const formData = new FormData();
  
          formData.append('logo', {
            uri: file.uri,
            name: file.fileName || 'logo.jpg',
            type: file.type || 'image/jpeg',
          } as unknown as Blob); // Conversão explícita para Blob
  
          // Enviar a logo para o servidor
          await uploadEquipeLogo(equipe.id, formData);
  
          setEquipe({ ...equipe, logo: file.uri });
        }
      }
    } catch (err) {
      setError('Erro ao fazer upload da logo');
    }
  };
  
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      {equipe ? (
        <>
          {/* Seção da logo */}
          <TouchableOpacity onPress={handleLogoUpload}>
            <Image
              source={
                equipe.logo
                  ? { uri: equipe.logo }
                  :require('../../assets/placeholder-logo.png')

              }
              style={styles.logo}
            />
            <Text style={styles.uploadText}>Toque para alterar a logo</Text>
          </TouchableOpacity>

          {/* Informações da equipe */}
          <Text style={styles.title}>{equipe.nome}</Text>
          <Text style={styles.info}>
            <Text style={styles.bold}>Cidade:</Text> {equipe.cidade}
          </Text>
          <Text style={styles.info}>
            <Text style={styles.bold}>Fundação:</Text> {equipe.fundacao}
          </Text>
          <Text style={styles.info}>
            <Text style={styles.bold}>Treinador:</Text> {equipe.treinador}
          </Text>

          {/* Lista de torneios */}
          <Text style={styles.subtitle}>Torneios:</Text>
          {torneios.length > 0 ? (
            <FlatList
              data={torneios}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.torneioCard}>
                  <Text style={styles.torneioName}>{item.nome}</Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.info}>Nenhum torneio encontrado.</Text>
          )}
        </>
      ) : (
        <Text style={styles.error}>Equipe não encontrada</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  uploadText: {
    textAlign: 'center',
    color: '#007BFF',
    fontSize: 14,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 18,
    marginVertical: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  torneioCard: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  torneioName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EquipeDetails;
