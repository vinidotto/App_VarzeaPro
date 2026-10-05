import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteTorneio, fetchTorneios } from '../api';
import { colors, radius, shadow, spacing } from '../theme';

type Torneio = {
  nome: string;
  data_inicio: string;
  data_fim: string;
  localizacao: string;
  id: number;
};

type TorneiosModernProps = {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data a confirmar';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
};

const TorneiosModern: React.FC<TorneiosModernProps> = ({ navigation }) => {
  const [torneios, setTorneios] = useState<Torneio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState<number[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const searchRef = useRef('');

  const loadTorneios = useCallback(async (term = '') => {
    try {
      setError('');
      const data = await fetchTorneios(term.trim() || undefined);
      setTorneios(Array.isArray(data) ? data : []);
    } catch {
      setError('Não foi possível carregar os torneios.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const checkAdmin = useCallback(async () => {
    const value = await AsyncStorage.getItem('is_staff');
    setIsAdmin(value?.toLowerCase() === 'true');
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTorneios(searchRef.current);
      checkAdmin();
    }, [checkAdmin, loadTorneios]),
  );

  useEffect(() => {
    searchRef.current = search;
    const timer = setTimeout(() => loadTorneios(search), 300);
    return () => clearTimeout(timer);
  }, [loadTorneios, search]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTorneios(search);
  };

  const handleSave = (id: number) => {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleDelete = (item: Torneio) => {
    Alert.alert('Excluir torneio', `Tem certeza que deseja excluir “${item.nome}”?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTorneio(item.id);
            loadTorneios(search);
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir o torneio.');
          }
        },
      },
    ]);
  };

  const renderTorneio = ({ item }: { item: Torneio }) => {
    const isSaved = saved.includes(item.id);
    return (
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={() => navigation.navigate('DetailsTorneio', { torneioId: item.id })}>
        <ImageBackground source={require('../../assets/torneio-bg.png')} style={styles.cover} imageStyle={styles.coverImage}>
          <View style={styles.coverShade} />
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeDay}>{formatDate(item.data_inicio).split(' ')[0]}</Text>
            <Text style={styles.dateBadgeMonth}>{formatDate(item.data_inicio).split(' ')[1]?.toUpperCase()}</Text>
          </View>
          <Pressable style={styles.favorite} onPress={() => handleSave(item.id)} hitSlop={8}>
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={21} color={isSaved ? '#FFCFD8' : colors.white} />
          </Pressable>
          <View style={styles.coverText}>
            <Text style={styles.coverLabel}>CAMPEONATO</Text>
            <Text style={styles.coverTitle} numberOfLines={2}>{item.nome}</Text>
          </View>
        </ImageBackground>

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={17} color={colors.primary} />
            <Text style={styles.metaText}>{formatDate(item.data_inicio)} — {formatDate(item.data_fim)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={17} color={colors.primary} />
            <Text style={styles.metaText} numberOfLines={1}>{item.localizacao || 'Local a confirmar'}</Text>
          </View>

          {isAdmin && (
            <View style={styles.adminActions}>
              <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('EditTorneio', { torneioId: item.id })}>
                <Ionicons name="create-outline" size={17} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>Editar</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={() => handleDelete(item)}>
                <Ionicons name="trash-outline" size={17} color={colors.danger} />
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={torneios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTorneio}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        ListHeaderComponent={(
          <View>
            <View style={styles.headingRow}>
              <View>
                <Text style={styles.eyebrow}>SUA ARENA</Text>
                <Text style={styles.heading}>Torneios</Text>
                <Text style={styles.headingSubtitle}>Encontre o próximo jogo da sua várzea.</Text>
              </View>
              <View style={styles.trophyCircle}><Ionicons name="trophy-outline" size={24} color={colors.accent} /></View>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color={colors.muted} />
              <TextInput value={search} onChangeText={setSearch} placeholder="Buscar por nome ou local" placeholderTextColor={colors.muted} style={styles.searchInput} returnKeyType="search" />
              {!!search && <Pressable onPress={() => setSearch('')}><Ionicons name="close-circle" size={19} color={colors.muted} /></Pressable>}
            </View>

            {isAdmin && (
              <Pressable style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]} onPress={() => navigation.navigate('AddTorneio')}>
                <Ionicons name="add" size={21} color={colors.white} />
                <Text style={styles.addButtonText}>Novo torneio</Text>
              </Pressable>
            )}
            {!!error && <Text style={styles.error}>{error}</Text>}
            {loading && <ActivityIndicator color={colors.primary} style={styles.loader} />}
          </View>
        )}
        ListEmptyComponent={!loading ? <View style={styles.empty}><Ionicons name="calendar-clear-outline" size={38} color={colors.primary} /><Text style={styles.emptyTitle}>Nenhum torneio encontrado</Text><Text style={styles.emptyText}>Tente outra busca ou crie um novo campeonato.</Text></View> : undefined}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md, paddingBottom: spacing.xl },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  eyebrow: { color: colors.primary, fontSize: 11, letterSpacing: 1.4, fontWeight: '800' },
  heading: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: 2 },
  headingSubtitle: { color: colors.muted, fontSize: 14, marginTop: 2 },
  trophyCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  searchBox: { minHeight: 50, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, marginLeft: spacing.sm },
  addButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: radius.sm, marginBottom: spacing.md },
  addButtonText: { color: colors.white, fontSize: 14, fontWeight: '800', marginLeft: spacing.xs },
  buttonPressed: { opacity: 0.82 },
  loader: { marginBottom: spacing.sm },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.md, ...shadow.card },
  cardPressed: { opacity: 0.92 },
  cover: { height: 164, justifyContent: 'flex-end' },
  coverImage: { resizeMode: 'cover' },
  coverShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(4, 35, 25, 0.38)' },
  dateBadge: { position: 'absolute', top: spacing.md, left: spacing.md, width: 48, height: 54, borderRadius: radius.sm, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  dateBadgeDay: { color: colors.primary, fontWeight: '800', fontSize: 17 },
  dateBadgeMonth: { color: colors.muted, fontSize: 10, fontWeight: '800', marginTop: -2 },
  favorite: { position: 'absolute', top: spacing.md, right: spacing.md, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.24)', alignItems: 'center', justifyContent: 'center' },
  coverText: { padding: spacing.md },
  coverLabel: { color: '#C7E8D7', fontSize: 10, letterSpacing: 1.4, fontWeight: '800' },
  coverTitle: { color: colors.white, fontSize: 21, fontWeight: '800', marginTop: 3 },
  cardBody: { padding: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  metaText: { color: colors.muted, fontSize: 13, marginLeft: spacing.sm, flex: 1 },
  adminActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  secondaryButton: { flex: 1, minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.primarySoft },
  secondaryButtonText: { color: colors.primary, fontWeight: '800', fontSize: 13, marginLeft: 5 },
  deleteButton: { flex: 1, minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: '#FDEEEE' },
  deleteButtonText: { color: colors.danger, fontWeight: '800', fontSize: 13, marginLeft: 5 },
  empty: { alignItems: 'center', padding: spacing.xl, marginTop: spacing.lg },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: spacing.md },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: spacing.xs },
});

export default TorneiosModern;
