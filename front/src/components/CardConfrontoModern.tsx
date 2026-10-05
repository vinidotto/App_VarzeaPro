import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '@env';
import { fetchProximasPartidas, updatePartida } from '../api';
import EditConfrontoModal from './EditConfrontoModalModern';
import { colors, radius, shadow, spacing } from '../theme';

type Team = { id: number; nome: string; logo_url: string | null };
type Partida = { id: number; data: string; localizacao: string; gols_Equipe_casa: number; gols_Equipe_visitante: number; Equipe_casa: Team; Equipe_visitante: Team };

type CardConfrontoModernProps = { torneioId: number; isAdmin: boolean; refreshKey?: number };

const logoUri = (team: Team) => {
  if (!team.logo_url) return undefined;
  return team.logo_url.startsWith('http') ? team.logo_url : `${BASE_URL.replace(/\/$/, '')}/${team.logo_url.replace(/^\//, '')}`;
};

const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
const formatTime = (value: string) => new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const CardConfrontoModern: React.FC<CardConfrontoModernProps> = ({ torneioId, isAdmin, refreshKey = 0 }) => {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Partida | null>(null);

  const loadPartidas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProximasPartidas(torneioId);
      setPartidas(Array.isArray(data) ? data : []);
    } catch {
      setPartidas([]);
    } finally {
      setLoading(false);
    }
  }, [torneioId]);

  useEffect(() => { loadPartidas(); }, [loadPartidas, refreshKey]);

  const handleSave = async (updated: Partida) => {
    await updatePartida(updated.id, updated);
    setPartidas((current) => current.map((partida) => partida.id === updated.id ? updated : partida));
    setSelected(null);
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.loadingText}>Carregando confrontos...</Text></View>;
  if (!partidas.length) return <View style={styles.empty}><Ionicons name="football-outline" size={38} color={colors.primary} /><Text style={styles.emptyTitle}>Nenhum confronto ainda</Text><Text style={styles.emptyText}>Crie a primeira partida deste torneio para começar a montar a tabela.</Text></View>;

  return (
    <View>
      {partidas.map((partida) => {
        const casaLogo = logoUri(partida.Equipe_casa);
        const visitanteLogo = logoUri(partida.Equipe_visitante);
        return (
          <Pressable key={partida.id} style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => isAdmin && setSelected(partida)}>
            <View style={styles.cardTop}><View style={styles.dateChip}><Ionicons name="calendar-outline" size={14} color={colors.primary} /><Text style={styles.dateText}>{formatDate(partida.data)}</Text></View><Text style={styles.time}>{formatTime(partida.data)}</Text></View>
            <View style={styles.matchRow}>
              <View style={styles.team}><View style={styles.logoFrame}>{casaLogo ? <Image source={{ uri: casaLogo }} style={styles.logo} /> : <Ionicons name="shield-outline" size={24} color={colors.primary} />}</View><Text style={styles.teamName} numberOfLines={2}>{partida.Equipe_casa.nome}</Text></View>
              <View style={styles.scoreBlock}><Text style={styles.vs}>VS</Text><Text style={styles.score}>{partida.gols_Equipe_casa} <Text style={styles.scoreDivider}>:</Text> {partida.gols_Equipe_visitante}</Text></View>
              <View style={styles.team}><View style={styles.logoFrame}>{visitanteLogo ? <Image source={{ uri: visitanteLogo }} style={styles.logo} /> : <Ionicons name="shield-outline" size={24} color={colors.primary} />}</View><Text style={styles.teamName} numberOfLines={2}>{partida.Equipe_visitante.nome}</Text></View>
            </View>
            <View style={styles.locationRow}><Ionicons name="location-outline" size={15} color={colors.muted} /><Text style={styles.location} numberOfLines={1}>{partida.localizacao}</Text>{isAdmin && <Text style={styles.editHint}>Editar <Ionicons name="create-outline" size={12} color={colors.primary} /></Text>}</View>
          </Pressable>
        );
      })}
      {selected && <EditConfrontoModal visible partida={selected} onClose={() => setSelected(null)} onSave={handleSave} />}
    </View>
  );
};

const styles = StyleSheet.create({
  loading: { alignItems: 'center', padding: spacing.xl },
  loadingText: { color: colors.muted, fontSize: 13, marginTop: spacing.sm },
  empty: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.xl, ...shadow.card },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: spacing.md },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, ...shadow.card },
  pressed: { opacity: 0.88 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  dateText: { color: colors.primary, fontSize: 11, fontWeight: '800', marginLeft: 5 },
  time: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  matchRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  team: { flex: 1, alignItems: 'center' },
  logoFrame: { width: 54, height: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  logo: { width: 42, height: 42, resizeMode: 'contain' },
  teamName: { color: colors.text, fontSize: 13, fontWeight: '800', textAlign: 'center', marginTop: spacing.xs },
  scoreBlock: { width: 76, alignItems: 'center' },
  vs: { color: colors.accent, fontSize: 10, letterSpacing: 1, fontWeight: '900' },
  score: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 2 },
  scoreDivider: { color: colors.muted, fontWeight: '500' },
  locationRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.sm },
  location: { color: colors.muted, fontSize: 12, flex: 1, marginLeft: 4 },
  editHint: { color: colors.primary, fontSize: 11, fontWeight: '800' },
});

export default CardConfrontoModern;
