import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import { fetchEquipes } from '../api';
import CreateEquipeModal from '../components/CreateEquipeModalModern';
import { colors, radius, shadow, spacing } from '../theme';

type Equipe = {
  id: number;
  nome: string;
  logo_url: string | null;
  logo: string | null;
  cidade: string | null;
  fundacao: string | null;
  treinador: string | null;
};

const getLogoUri = (equipe: Equipe) => {
  const source = equipe.logo_url || equipe.logo;
  if (!source) return undefined;
  return source.startsWith('http') ? source : `${BASE_URL.replace(/\/$/, '')}/${source.replace(/^\//, '')}`;
};

const EquipesModern: React.FC<{ navigation: { navigate: (screen: string, params?: object) => void } }> = ({ navigation }) => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState('');

  const loadEquipes = useCallback(async () => {
    try {
      setError('');
      const data = await fetchEquipes();
      setEquipes(Array.isArray(data) ? data as unknown as Equipe[] : []);
    } catch {
      setError('Não foi possível carregar as equipes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEquipes();
      AsyncStorage.getItem('is_staff').then((value) => setIsAdmin(value?.toLowerCase() === 'true'));
    }, [loadEquipes]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadEquipes();
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={equipes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
          <View>
            <View style={styles.headingRow}>
              <View>
                <Text style={styles.eyebrow}>COMUNIDADE</Text>
                <Text style={styles.heading}>Equipes</Text>
                <Text style={styles.subtitle}>Conheça quem faz o jogo acontecer.</Text>
              </View>
              <View style={styles.peopleCircle}><Ionicons name="people-outline" size={25} color={colors.primary} /></View>
            </View>
            {isAdmin && <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}><Ionicons name="add" size={21} color={colors.white} /><Text style={styles.addButtonText}>Criar equipe</Text></Pressable>}
            {!!error && <Text style={styles.error}>{error}</Text>}
            {loading && <ActivityIndicator color={colors.primary} style={styles.loader} />}
          </View>
        )}
        renderItem={({ item }) => {
          const logoUri = getLogoUri(item);
          return (
            <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => navigation.navigate('EquipeDetails', { equipeId: item.id })}>
              {logoUri ? <Image source={{ uri: logoUri }} style={styles.logo} /> : <View style={styles.logoFallback}><Ionicons name="shield-outline" size={28} color={colors.primary} /></View>}
              <View style={styles.cardContent}>
                <Text style={styles.teamName} numberOfLines={1}>{item.nome}</Text>
                <View style={styles.locationRow}><Ionicons name="location-outline" size={15} color={colors.muted} /><Text style={styles.location} numberOfLines={1}>{item.cidade || 'Cidade não informada'}</Text></View>
                <Text style={styles.tapHint}>Ver detalhes <Ionicons name="arrow-forward" size={12} color={colors.primary} /></Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.border} />
            </Pressable>
          );
        }}
        ListEmptyComponent={!loading ? <View style={styles.empty}><Ionicons name="people-circle-outline" size={42} color={colors.primary} /><Text style={styles.emptyTitle}>Nenhuma equipe cadastrada</Text><Text style={styles.emptyText}>As equipes aparecerão aqui assim que forem criadas.</Text></View> : undefined}
      />

      {modalVisible && <CreateEquipeModal torneioId={0} onClose={() => { setModalVisible(false); loadEquipes(); }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md, paddingBottom: spacing.xl },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  eyebrow: { color: colors.primary, fontSize: 11, letterSpacing: 1.4, fontWeight: '800' },
  heading: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: 2 },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 2 },
  peopleCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  addButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: radius.sm, marginBottom: spacing.md },
  addButtonText: { color: colors.white, fontSize: 14, fontWeight: '800', marginLeft: spacing.xs },
  loader: { marginBottom: spacing.md },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, ...shadow.card },
  pressed: { opacity: 0.85 },
  logo: { width: 64, height: 64, borderRadius: 20, resizeMode: 'contain', backgroundColor: colors.primarySoft },
  logoFallback: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  cardContent: { flex: 1, marginLeft: spacing.md },
  teamName: { color: colors.text, fontSize: 17, fontWeight: '800' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  location: { color: colors.muted, fontSize: 13, marginLeft: 4, flex: 1 },
  tapHint: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: spacing.sm },
  empty: { alignItems: 'center', padding: spacing.xl, marginTop: spacing.lg },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: spacing.md },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: spacing.xs },
});

export default EquipesModern;
