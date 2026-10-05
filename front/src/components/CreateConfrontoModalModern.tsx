import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { createConfronto, fetchEquipesPorTorneio } from '../api';
import { colors, radius, shadow, spacing } from '../theme';

type Team = { id: number; nome: string };

type CreateConfrontoModalModernProps = {
  torneioId: number;
  onClose: () => void;
};

const CreateConfrontoModalModern: React.FC<CreateConfrontoModalModernProps> = ({ torneioId, onClose }) => {
  const [equipes, setEquipes] = useState<Team[]>([]);
  const [equipeCasa, setEquipeCasa] = useState<number | null>(null);
  const [equipeVisitante, setEquipeVisitante] = useState<number | null>(null);
  const [data, setData] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [localizacao, setLocalizacao] = useState('');
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [selector, setSelector] = useState<'home' | 'away' | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEquipesPorTorneio(torneioId)
      .then((items) => setEquipes(Array.isArray(items) ? items : []))
      .catch(() => setError('Não foi possível carregar as equipes deste torneio.'))
      .finally(() => setLoadingTeams(false));
  }, [torneioId]);

  const setDatePart = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed' || !selectedDate) {
      setPicker(null);
      return;
    }
    const next = new Date(data);
    if (picker === 'date') {
      next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    } else {
      next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    }
    setData(next);
    setPicker(null);
  };

  const handleCreate = async () => {
    if (!equipeCasa || !equipeVisitante || !localizacao.trim()) {
      setError('Selecione as duas equipes e informe o local do confronto.');
      return;
    }
    if (equipeCasa === equipeVisitante) {
      setError('A equipe da casa e a visitante precisam ser diferentes.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await createConfronto(torneioId, equipeCasa, equipeVisitante, data.toISOString(), localizacao.trim());
      onClose();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Não foi possível criar o confronto.');
    } finally {
      setLoading(false);
    }
  };

  const selectedHome = equipes.find((equipe) => equipe.id === equipeCasa)?.nome;
  const selectedAway = equipes.find((equipe) => equipe.id === equipeVisitante)?.nome;
  const selectedLabel = selector === 'home' ? selectedHome : selectedAway;

  return (
    <Modal animationType="slide" transparent visible onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.iconCircle}><Ionicons name="football-outline" size={27} color={colors.accent} /></View>
            <View style={styles.headerText}><Text style={styles.eyebrow}>NOVA PARTIDA</Text><Text style={styles.title}>Criar confronto</Text></View>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}><Ionicons name="close" size={22} color={colors.muted} /></Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>Defina os times, o horário e onde a partida vai acontecer.</Text>

            <Text style={styles.label}>Mandante</Text>
            <Pressable style={styles.selectField} onPress={() => setSelector(selector === 'home' ? null : 'home')}>
              <Ionicons name="shield-outline" size={19} color={colors.primary} />
              <Text style={[styles.selectText, !selectedHome && styles.placeholder]}>{selectedHome || 'Selecionar equipe da casa'}</Text>
              <Ionicons name={selector === 'home' ? 'chevron-up' : 'chevron-down'} size={17} color={colors.primary} />
            </Pressable>
            {selector === 'home' && <View style={styles.options}>{equipes.map((equipe) => <Pressable key={`home-${equipe.id}`} style={styles.option} onPress={() => { setEquipeCasa(equipe.id); setSelector(null); }}><Text style={styles.optionText}>{equipe.nome}</Text>{equipe.id === equipeCasa && <Ionicons name="checkmark" size={18} color={colors.primary} />}</Pressable>)}</View>}

            <Text style={styles.label}>Visitante</Text>
            <Pressable style={styles.selectField} onPress={() => setSelector(selector === 'away' ? null : 'away')}>
              <Ionicons name="shield-checkmark-outline" size={19} color={colors.primary} />
              <Text style={[styles.selectText, !selectedAway && styles.placeholder]}>{selectedAway || 'Selecionar equipe visitante'}</Text>
              <Ionicons name={selector === 'away' ? 'chevron-up' : 'chevron-down'} size={17} color={colors.primary} />
            </Pressable>
            {selector === 'away' && <View style={styles.options}>{equipes.map((equipe) => <Pressable key={`away-${equipe.id}`} style={styles.option} onPress={() => { setEquipeVisitante(equipe.id); setSelector(null); }}><Text style={styles.optionText}>{equipe.nome}</Text>{equipe.id === equipeVisitante && <Ionicons name="checkmark" size={18} color={colors.primary} />}</Pressable>)}</View>}
            {loadingTeams && <ActivityIndicator color={colors.primary} style={styles.inlineLoader} />}
            {!loadingTeams && equipes.length < 2 && <Text style={styles.helper}>É preciso ter pelo menos duas equipes vinculadas ao torneio.</Text>}

            <Text style={styles.label}>Data e horário</Text>
            <View style={styles.dateRow}>
              <Pressable style={styles.dateField} onPress={() => setPicker('date')}><Ionicons name="calendar-outline" size={18} color={colors.primary} /><View style={styles.dateTextWrap}><Text style={styles.dateCaption}>DATA</Text><Text style={styles.dateText}>{data.toLocaleDateString('pt-BR')}</Text></View></Pressable>
              <Pressable style={styles.dateField} onPress={() => setPicker('time')}><Ionicons name="time-outline" size={18} color={colors.primary} /><View style={styles.dateTextWrap}><Text style={styles.dateCaption}>HORÁRIO</Text><Text style={styles.dateText}>{data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text></View></Pressable>
            </View>

            <Text style={styles.label}>Local do confronto</Text>
            <View style={styles.field}><Ionicons name="location-outline" size={19} color={colors.muted} /><TextInput style={styles.input} placeholder="Ex.: Campo do bairro" placeholderTextColor={colors.muted} value={localizacao} onChangeText={setLocalizacao} autoCapitalize="words" /></View>

            {!!error && <View style={styles.errorBox}><Ionicons name="alert-circle-outline" size={18} color={colors.danger} /><Text style={styles.error}>{error}</Text></View>}

            <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={handleCreate} disabled={loading || loadingTeams}>
              {loading ? <ActivityIndicator color={colors.white} /> : <><Ionicons name="checkmark-circle-outline" size={20} color={colors.white} /><Text style={styles.primaryButtonText}>Criar confronto</Text></>}
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={onClose} disabled={loading}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {picker && <DateTimePicker value={data} mode={picker} display="default" onChange={setDatePart} />}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(7, 35, 25, 0.48)' },
  sheet: { maxHeight: '94%', backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: spacing.sm, ...shadow.card },
  handle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
  iconCircle: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
  headerText: { flex: 1, marginLeft: spacing.md },
  eyebrow: { color: colors.primary, fontSize: 10, letterSpacing: 1.3, fontWeight: '800' },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 2 },
  closeButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  label: { color: colors.text, fontSize: 12, fontWeight: '800', marginBottom: spacing.xs, marginTop: spacing.sm },
  selectField: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, backgroundColor: '#FBFDFC' },
  selectText: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '700', marginLeft: spacing.sm },
  placeholder: { color: colors.muted, fontWeight: '500' },
  options: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface, marginTop: 5, overflow: 'hidden' },
  option: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionText: { color: colors.text, fontSize: 14 },
  inlineLoader: { marginVertical: spacing.sm },
  helper: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: spacing.sm },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  dateField: { flex: 1, minHeight: 62, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.sm, backgroundColor: colors.primarySoft },
  dateTextWrap: { flex: 1, marginLeft: spacing.xs },
  dateCaption: { color: colors.primary, fontSize: 10, letterSpacing: 0.7, fontWeight: '800' },
  dateText: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 3 },
  field: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, backgroundColor: '#FBFDFC' },
  input: { flex: 1, color: colors.text, fontSize: 14, marginLeft: spacing.sm },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FDEEEE', borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.md },
  error: { flex: 1, color: colors.danger, fontSize: 13, lineHeight: 18, marginLeft: spacing.xs },
  primaryButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: radius.sm, marginTop: spacing.lg },
  primaryButtonText: { color: colors.white, fontSize: 14, fontWeight: '800', marginLeft: spacing.xs },
  cancelButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs },
  cancelText: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.82 },
});

export default CreateConfrontoModalModern;
