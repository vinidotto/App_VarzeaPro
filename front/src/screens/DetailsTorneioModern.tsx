import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTorneio } from '../api';
import CardConfronto from '../components/CardConfrontoModern';
import CreateConfrontoModal from '../components/CreateConfrontoModalModern';
import CreateEquipeModal from '../components/CreateEquipeModalModern';
import { RootStackParamList } from '../../App';
import { colors, radius, shadow, spacing } from '../theme';

type Torneio = { id?: number; nome: string; data_inicio: string; data_fim: string; localizacao: string };
type Props = { route: RouteProp<RootStackParamList, 'DetailsTorneio'> };

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
};

const DetailsTorneioModern: React.FC<Props> = ({ route }) => {
  const { torneioId } = route.params;
  const [torneio, setTorneio] = useState<Torneio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [confrontoVisible, setConfrontoVisible] = useState(false);
  const [equipeVisible, setEquipeVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchTorneio(torneioId)
      .then((data) => setTorneio(data))
      .catch(() => setError('Não foi possível carregar os detalhes do torneio.'))
      .finally(() => setLoading(false));
    AsyncStorage.getItem('is_staff').then((value) => setIsAdmin(value?.toLowerCase() === 'true'));
  }, [torneioId]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.loadingText}>Carregando torneio...</Text></View>;
  if (!torneio) return <View style={styles.center}><Ionicons name="alert-circle-outline" size={40} color={colors.danger} /><Text style={styles.errorTitle}>Torneio não encontrado</Text><Text style={styles.errorText}>{error}</Text></View>;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageBackground source={require('../../assets/torneio-bg.png')} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}><Text style={styles.heroEyebrow}>CAMPEONATO</Text><Text style={styles.heroTitle}>{torneio.nome}</Text><View style={styles.heroLocation}><Ionicons name="location-outline" size={15} color="#D9F3E5" /><Text style={styles.heroLocationText}>{torneio.localizacao}</Text></View></View>
        </ImageBackground>

        <View style={styles.infoCard}>
          <View style={styles.infoItem}><View style={styles.infoIcon}><Ionicons name="calendar-outline" size={19} color={colors.primary} /></View><View style={styles.infoText}><Text style={styles.infoLabel}>INÍCIO</Text><Text style={styles.infoValue} numberOfLines={1}>{formatDate(torneio.data_inicio)}</Text></View></View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}><View style={styles.infoIcon}><Ionicons name="flag-outline" size={19} color={colors.accent} /></View><View style={styles.infoText}><Text style={styles.infoLabel}>TÉRMINO</Text><Text style={styles.infoValue} numberOfLines={1}>{formatDate(torneio.data_fim)}</Text></View></View>
        </View>

        {isAdmin && <View style={styles.actionRow}><Pressable style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]} onPress={() => setConfrontoVisible(true)}><Ionicons name="football-outline" size={20} color={colors.white} /><Text style={styles.primaryActionText}>Novo confronto</Text></Pressable><Pressable style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]} onPress={() => setEquipeVisible(true)}><Ionicons name="shield-outline" size={20} color={colors.primary} /><Text style={styles.secondaryActionText}>Nova equipe</Text></Pressable></View>}

        <View style={styles.sectionHeader}><View><Text style={styles.sectionEyebrow}>AGENDA</Text><Text style={styles.sectionTitle}>Confrontos</Text></View><View style={styles.countBadge}><Text style={styles.countText}>PARTIDAS</Text></View></View>
        <CardConfronto torneioId={torneioId} isAdmin={isAdmin} refreshKey={refreshKey} />
      </ScrollView>

      {confrontoVisible && <CreateConfrontoModal torneioId={torneioId} onClose={() => { setConfrontoVisible(false); setRefreshKey((value) => value + 1); }} />}
      {equipeVisible && <CreateEquipeModal torneioId={torneioId} onClose={() => setEquipeVisible(false)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  loadingText: { color: colors.muted, fontSize: 13, marginTop: spacing.sm },
  errorTitle: { color: colors.text, fontSize: 19, fontWeight: '800', marginTop: spacing.md },
  errorText: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: spacing.xs },
  hero: { height: 216, justifyContent: 'flex-end', overflow: 'hidden', borderRadius: radius.lg },
  heroImage: { resizeMode: 'cover' },
  heroOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(4, 35, 25, 0.48)' },
  heroContent: { padding: spacing.lg },
  heroEyebrow: { color: '#BDE8D3', fontSize: 11, letterSpacing: 1.5, fontWeight: '800' },
  heroTitle: { color: colors.white, fontSize: 27, lineHeight: 32, fontWeight: '900', marginTop: 3 },
  heroLocation: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  heroLocationText: { color: '#D9F3E5', fontSize: 13, marginLeft: 4 },
  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginTop: -18, marginHorizontal: spacing.sm, ...shadow.card },
  infoItem: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center' },
  infoText: { flex: 1, minWidth: 0 },
  infoIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft, marginRight: spacing.xs },
  infoLabel: { color: colors.muted, fontSize: 9, letterSpacing: 0.8, fontWeight: '800' },
  infoValue: { color: colors.text, fontSize: 11, fontWeight: '800', marginTop: 3, flexShrink: 1 },
  infoDivider: { width: 1, height: 34, backgroundColor: colors.border, marginHorizontal: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  primaryAction: { flex: 1, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: radius.sm },
  primaryActionText: { color: colors.white, fontSize: 13, fontWeight: '800', marginLeft: 5 },
  secondaryAction: { flex: 1, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.sm },
  secondaryActionText: { color: colors.primary, fontSize: 13, fontWeight: '800', marginLeft: 5 },
  pressed: { opacity: 0.82 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.md },
  sectionEyebrow: { color: colors.primary, fontSize: 10, letterSpacing: 1.3, fontWeight: '800' },
  sectionTitle: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 2 },
  countBadge: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  countText: { color: colors.accent, fontSize: 9, letterSpacing: 0.7, fontWeight: '900' },
});

export default DetailsTorneioModern;
