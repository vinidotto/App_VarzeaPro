import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from '@env';
import { atualizarEquipe, fetchEquipeDetails, fetchTorneios, fetchTorneiosPorEquipe, uploadLogo, vincularEquipeATorneio } from '../api';
import { RootStackParamList } from '../../App';
import { colors, radius, shadow, spacing } from '../theme';

type Equipe = {
  id: number;
  nome: string;
  cidade: string;
  fundacao: string;
  treinador: string;
  logo: string | null;
  logo_url?: string | null;
};

type Torneio = { id: number; nome: string; data_inicio?: string; data_fim?: string };
type Props = { route: RouteProp<RootStackParamList, 'EquipeDetails'> };

const getLogoUri = (equipe: Equipe | null) => {
  const source = equipe?.logo_url || equipe?.logo;
  if (!source) return undefined;
  return source.startsWith('http') ? source : `${BASE_URL.replace(/\/$/, '')}/${source.replace(/^\//, '')}`;
};

const formatDate = (value?: string) => {
  if (!value) return 'Não informado';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
};

const EquipeDetailsModern: React.FC<Props> = ({ route }) => {
  const { equipeId } = route.params;
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [draft, setDraft] = useState<Equipe | null>(null);
  const [torneios, setTorneios] = useState<Torneio[]>([]);
  const [todosTorneios, setTodosTorneios] = useState<Torneio[]>([]);
  const [selectedTorneio, setSelectedTorneio] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showTorneios, setShowTorneios] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadEquipe = useCallback(async () => {
    setLoading(true);
    try {
      setError('');
      const [details, linked, all] = await Promise.all([
        fetchEquipeDetails(equipeId),
        fetchTorneiosPorEquipe(equipeId),
        fetchTorneios(),
      ]);
      setEquipe(details as Equipe);
      setDraft(details as Equipe);
      setTorneios(Array.isArray(linked) ? linked : []);
      setTodosTorneios(Array.isArray(all) ? all as Torneio[] : []);
    } catch {
      setError('Não foi possível carregar os detalhes da equipe.');
    } finally {
      setLoading(false);
    }
  }, [equipeId]);

  useEffect(() => {
    loadEquipe();
    AsyncStorage.getItem('is_staff').then((value) => setIsAdmin(value?.toLowerCase() === 'true'));
  }, [loadEquipe]);

  const handleSelectLogo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permita o acesso à galeria para atualizar a logo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (result.canceled) return;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('logo', { uri: asset.uri, name: 'logo.png', type: 'image/png' } as any);
    setUploading(true);
    setError('');
    try {
      const response = await uploadLogo(equipeId, formData);
      setEquipe((current) => current ? { ...current, logo: response.logo_url, logo_url: response.logo_url } : current);
      setDraft((current) => current ? { ...current, logo: response.logo_url, logo_url: response.logo_url } : current);
    } catch {
      setError('Não foi possível atualizar a logo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!draft?.nome.trim()) {
      setError('Informe o nome da equipe.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await atualizarEquipe(equipeId, draft);
      setEquipe(updated as Equipe);
      setDraft(updated as Equipe);
      setIsEditing(false);
    } catch {
      setError('Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleLink = async () => {
    if (!selectedTorneio) {
      setError('Selecione um torneio para fazer o vínculo.');
      return;
    }
    try {
      await vincularEquipeATorneio(selectedTorneio, equipeId);
      setSelectedTorneio(null);
      setShowTorneios(false);
      await loadEquipe();
    } catch {
      setError('Não foi possível vincular a equipe ao torneio.');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.loadingText}>Carregando equipe...</Text></View>;
  if (!equipe || !draft) return <View style={styles.center}><Ionicons name="alert-circle-outline" size={40} color={colors.danger} /><Text style={styles.errorTitle}>Equipe não encontrada</Text><Text style={styles.errorText}>{error}</Text></View>;

  const logoUri = getLogoUri(equipe);
  const selectedTournamentName = todosTorneios.find((item) => item.id === selectedTorneio)?.nome;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.logoFrame}>{logoUri ? <Image source={{ uri: logoUri }} style={styles.logo} /> : <Ionicons name="shield-outline" size={52} color={colors.primary} />}</View>
          {isAdmin && <Pressable style={styles.logoButton} onPress={handleSelectLogo} disabled={uploading}>{uploading ? <ActivityIndicator size="small" color={colors.primary} /> : <><Ionicons name="camera-outline" size={16} color={colors.primary} /><Text style={styles.logoButtonText}>Alterar logo</Text></>}</Pressable>}
          <Text style={styles.teamName}>{equipe.nome}</Text>
          <View style={styles.location}><Ionicons name="location-outline" size={15} color={colors.muted} /><Text style={styles.locationText}>{equipe.cidade || 'Cidade não informada'}</Text></View>
        </View>

        {!!error && <View style={styles.errorBox}><Ionicons name="alert-circle-outline" size={18} color={colors.danger} /><Text style={styles.errorText}>{error}</Text></View>}

        <View style={styles.card}>
          <View style={styles.sectionHeader}><View><Text style={styles.eyebrow}>IDENTIDADE</Text><Text style={styles.sectionTitle}>Informações da equipe</Text></View>{isAdmin && !isEditing && <Pressable style={styles.editButton} onPress={() => { setError(''); setIsEditing(true); }}><Ionicons name="create-outline" size={17} color={colors.primary} /><Text style={styles.editButtonText}>Editar</Text></Pressable>}</View>

          {isEditing ? (
            <View>
              <Text style={styles.label}>Nome da equipe</Text><View style={styles.field}><Ionicons name="shield-outline" size={18} color={colors.muted} /><TextInput style={styles.input} value={draft.nome} onChangeText={(value) => setDraft({ ...draft, nome: value })} /></View>
              <Text style={styles.label}>Cidade</Text><View style={styles.field}><Ionicons name="location-outline" size={18} color={colors.muted} /><TextInput style={styles.input} value={draft.cidade || ''} onChangeText={(value) => setDraft({ ...draft, cidade: value })} /></View>
              <Text style={styles.label}>Treinador</Text><View style={styles.field}><Ionicons name="person-outline" size={18} color={colors.muted} /><TextInput style={styles.input} value={draft.treinador || ''} onChangeText={(value) => setDraft({ ...draft, treinador: value })} /></View>
              <Text style={styles.label}>Fundação</Text><View style={styles.field}><Ionicons name="calendar-outline" size={18} color={colors.muted} /><TextInput style={styles.input} value={draft.fundacao || ''} onChangeText={(value) => setDraft({ ...draft, fundacao: value })} placeholder="AAAA-MM-DD" placeholderTextColor={colors.muted} /></View>
              <View style={styles.formActions}><Pressable style={styles.cancelButton} onPress={() => { setDraft(equipe); setIsEditing(false); }}><Text style={styles.cancelText}>Cancelar</Text></Pressable><Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>{saving ? <ActivityIndicator color={colors.white} /> : <><Ionicons name="checkmark" size={18} color={colors.white} /><Text style={styles.saveText}>Salvar</Text></>}</Pressable></View>
            </View>
          ) : (
            <View style={styles.detailsGrid}><View style={styles.detailItem}><Ionicons name="person-outline" size={18} color={colors.primary} /><Text style={styles.detailLabel}>TREINADOR</Text><Text style={styles.detailValue}>{equipe.treinador || 'Não informado'}</Text></View><View style={styles.detailItem}><Ionicons name="calendar-outline" size={18} color={colors.primary} /><Text style={styles.detailLabel}>FUNDAÇÃO</Text><Text style={styles.detailValue}>{formatDate(equipe.fundacao)}</Text></View></View>
          )}
        </View>

        <View style={styles.sectionHeaderOutside}><View><Text style={styles.eyebrow}>CAMPEONATOS</Text><Text style={styles.sectionTitle}>Torneios vinculados</Text></View><View style={styles.countBadge}><Text style={styles.countText}>{torneios.length}</Text></View></View>
        {torneios.length ? torneios.map((torneio) => <View style={styles.tournamentCard} key={torneio.id}><View style={styles.tournamentIcon}><Ionicons name="trophy-outline" size={19} color={colors.accent} /></View><View style={styles.tournamentContent}><Text style={styles.tournamentName}>{torneio.nome}</Text><Text style={styles.tournamentDate}>{formatDate(torneio.data_inicio)} {torneio.data_fim ? `— ${formatDate(torneio.data_fim)}` : ''}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.border} /></View>) : <View style={styles.empty}><Ionicons name="trophy-outline" size={30} color={colors.primary} /><Text style={styles.emptyTitle}>Nenhum torneio vinculado</Text><Text style={styles.emptyText}>Vincule esta equipe a um campeonato para acompanhar sua participação.</Text></View>}

        {isAdmin && <View style={styles.linkCard}><Text style={styles.linkTitle}>Vincular a um torneio</Text><Text style={styles.linkSubtitle}>Adicione esta equipe a um campeonato existente.</Text><Pressable style={styles.selectField} onPress={() => setShowTorneios((value) => !value)}><Ionicons name="trophy-outline" size={18} color={colors.primary} /><Text style={[styles.selectText, !selectedTournamentName && styles.placeholder]}>{selectedTournamentName || 'Selecionar torneio'}</Text><Ionicons name={showTorneios ? 'chevron-up' : 'chevron-down'} size={17} color={colors.primary} /></Pressable>{showTorneios && <View style={styles.options}>{todosTorneios.map((torneio) => <Pressable style={styles.option} key={torneio.id} onPress={() => { setSelectedTorneio(torneio.id); setShowTorneios(false); }}><Text style={styles.optionText}>{torneio.nome}</Text>{selectedTorneio === torneio.id && <Ionicons name="checkmark" size={18} color={colors.primary} />}</Pressable>)}</View>}<Pressable style={styles.linkButton} onPress={handleLink}><Ionicons name="link-outline" size={18} color={colors.white} /><Text style={styles.linkButtonText}>Vincular equipe</Text></Pressable></View>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  loadingText: { color: colors.muted, fontSize: 13, marginTop: spacing.sm },
  errorTitle: { color: colors.text, fontSize: 19, fontWeight: '800', marginTop: spacing.md },
  errorText: { color: colors.danger, fontSize: 13, textAlign: 'center', lineHeight: 18, marginTop: spacing.xs },
  hero: { alignItems: 'center', paddingVertical: spacing.lg },
  logoFrame: { width: 126, height: 126, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft, borderWidth: 5, borderColor: colors.white, ...shadow.card },
  logo: { width: 100, height: 100, resizeMode: 'contain' },
  logoButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.primarySoft, marginTop: -8 },
  logoButtonText: { color: colors.primary, fontSize: 12, fontWeight: '800', marginLeft: 5 },
  teamName: { color: colors.text, fontSize: 27, fontWeight: '900', marginTop: spacing.md, textAlign: 'center' },
  location: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  locationText: { color: colors.muted, fontSize: 14, marginLeft: 4 },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FDEEEE', borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.md },
  sectionHeaderOutside: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.md },
  eyebrow: { color: colors.primary, fontSize: 10, letterSpacing: 1.3, fontWeight: '800' },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 2 },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 7 },
  editButtonText: { color: colors.primary, fontSize: 12, fontWeight: '800', marginLeft: 4 },
  detailsGrid: { flexDirection: 'row', gap: spacing.sm },
  detailItem: { flex: 1, minHeight: 90, borderRadius: radius.sm, backgroundColor: colors.background, padding: spacing.sm },
  detailLabel: { color: colors.muted, fontSize: 9, letterSpacing: 0.7, fontWeight: '800', marginTop: spacing.sm },
  detailValue: { color: colors.text, fontSize: 13, fontWeight: '800', marginTop: 3 },
  label: { color: colors.text, fontSize: 12, fontWeight: '800', marginBottom: spacing.xs, marginTop: spacing.sm },
  field: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, backgroundColor: '#FBFDFC' },
  input: { flex: 1, color: colors.text, fontSize: 14, marginLeft: spacing.sm },
  formActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  cancelButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.background },
  cancelText: { color: colors.muted, fontSize: 13, fontWeight: '800' },
  saveButton: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.primary },
  saveText: { color: colors.white, fontSize: 13, fontWeight: '800', marginLeft: 4 },
  countBadge: { minWidth: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
  countText: { color: colors.accent, fontSize: 12, fontWeight: '900' },
  tournamentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadow.card },
  tournamentIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
  tournamentContent: { flex: 1, marginLeft: spacing.sm },
  tournamentName: { color: colors.text, fontSize: 14, fontWeight: '800' },
  tournamentDate: { color: colors.muted, fontSize: 12, marginTop: 4 },
  empty: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, ...shadow.card },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: spacing.sm },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: spacing.xs },
  linkCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg, ...shadow.card },
  linkTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  linkSubtitle: { color: colors.muted, fontSize: 13, marginTop: 4, marginBottom: spacing.md },
  selectField: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, backgroundColor: '#FBFDFC' },
  selectText: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '700', marginLeft: spacing.sm },
  placeholder: { color: colors.muted, fontWeight: '500' },
  options: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface, marginTop: 5, overflow: 'hidden' },
  option: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionText: { color: colors.text, fontSize: 14 },
  linkButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: radius.sm, marginTop: spacing.md },
  linkButtonText: { color: colors.white, fontSize: 14, fontWeight: '800', marginLeft: spacing.xs },
});

export default EquipeDetailsModern;
