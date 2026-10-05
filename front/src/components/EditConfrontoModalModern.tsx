import React, { useState } from 'react';
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
import { colors, radius, shadow, spacing } from '../theme';

type EditConfrontoModalModernProps = {
  visible: boolean;
  onClose: () => void;
  partida: {
    id: number;
    gols_Equipe_casa: number;
    gols_Equipe_visitante: number;
    localizacao: string;
    data: string;
    Equipe_casa: { nome: string };
    Equipe_visitante: { nome: string };
  };
  onSave: (updatedPartida: any) => Promise<void> | void;
};

const EditConfrontoModalModern: React.FC<EditConfrontoModalModernProps> = ({ visible, onClose, partida, onSave }) => {
  const [golsCasa, setGolsCasa] = useState(Math.max(0, partida.gols_Equipe_casa || 0));
  const [golsVisitante, setGolsVisitante] = useState(Math.max(0, partida.gols_Equipe_visitante || 0));
  const [localizacao, setLocalizacao] = useState(partida.localizacao || '');
  const [data, setData] = useState(new Date(partida.data));
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const changeScore = (team: 'home' | 'away', amount: number) => {
    if (team === 'home') setGolsCasa((value) => Math.max(0, value + amount));
    else setGolsVisitante((value) => Math.max(0, value + amount));
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed' || !selectedDate) {
      setPicker(null);
      return;
    }
    const next = new Date(data);
    if (picker === 'date') next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    else next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    setData(next);
    setPicker(null);
  };

  const handleSave = async () => {
    if (!localizacao.trim()) {
      setError('Informe o local do confronto.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await onSave({
        ...partida,
        gols_Equipe_casa: golsCasa,
        gols_Equipe_visitante: golsVisitante,
        localizacao: localizacao.trim(),
        data: data.toISOString(),
      });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.iconCircle}><Ionicons name="create-outline" size={26} color={colors.primary} /></View>
            <View style={styles.headerText}><Text style={styles.eyebrow}>SÚMULA DA PARTIDA</Text><Text style={styles.title}>Editar confronto</Text></View>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}><Ionicons name="close" size={22} color={colors.muted} /></Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.scoreboard}>
              <View style={styles.teamColumn}><View style={styles.teamIcon}><Ionicons name="shield-outline" size={25} color={colors.primary} /></View><Text style={styles.teamName} numberOfLines={2}>{partida.Equipe_casa.nome}</Text><View style={styles.scoreControls}><Pressable style={styles.scoreButton} onPress={() => changeScore('home', -1)} hitSlop={5}><Ionicons name="remove" size={19} color={colors.primary} /></Pressable><Text style={styles.score}>{golsCasa}</Text><Pressable style={styles.scoreButton} onPress={() => changeScore('home', 1)} hitSlop={5}><Ionicons name="add" size={19} color={colors.primary} /></Pressable></View></View>
              <View style={styles.versus}><Text style={styles.versusText}>VS</Text><Text style={styles.scoreLabel}>PLACAR</Text></View>
              <View style={styles.teamColumn}><View style={styles.teamIcon}><Ionicons name="shield-checkmark-outline" size={25} color={colors.primary} /></View><Text style={styles.teamName} numberOfLines={2}>{partida.Equipe_visitante.nome}</Text><View style={styles.scoreControls}><Pressable style={styles.scoreButton} onPress={() => changeScore('away', -1)} hitSlop={5}><Ionicons name="remove" size={19} color={colors.primary} /></Pressable><Text style={styles.score}>{golsVisitante}</Text><Pressable style={styles.scoreButton} onPress={() => changeScore('away', 1)} hitSlop={5}><Ionicons name="add" size={19} color={colors.primary} /></Pressable></View></View>
            </View>

            <Text style={styles.label}>Data e horário</Text>
            <View style={styles.dateRow}><Pressable style={styles.dateField} onPress={() => setPicker('date')}><Ionicons name="calendar-outline" size={18} color={colors.primary} /><View style={styles.dateWrap}><Text style={styles.dateCaption}>DATA</Text><Text style={styles.dateText}>{data.toLocaleDateString('pt-BR')}</Text></View></Pressable><Pressable style={styles.dateField} onPress={() => setPicker('time')}><Ionicons name="time-outline" size={18} color={colors.primary} /><View style={styles.dateWrap}><Text style={styles.dateCaption}>HORÁRIO</Text><Text style={styles.dateText}>{data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text></View></Pressable></View>

            <Text style={styles.label}>Local do confronto</Text>
            <View style={styles.field}><Ionicons name="location-outline" size={19} color={colors.muted} /><TextInput style={styles.input} value={localizacao} onChangeText={setLocalizacao} placeholder="Ex.: Campo do bairro" placeholderTextColor={colors.muted} autoCapitalize="words" /></View>

            {!!error && <View style={styles.errorBox}><Ionicons name="alert-circle-outline" size={18} color={colors.danger} /><Text style={styles.error}>{error}</Text></View>}
            <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={handleSave} disabled={saving}>{saving ? <ActivityIndicator color={colors.white} /> : <><Ionicons name="save-outline" size={19} color={colors.white} /><Text style={styles.primaryButtonText}>Salvar placar</Text></>}</Pressable>
            <Pressable style={styles.cancelButton} onPress={onClose} disabled={saving}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      {picker && <DateTimePicker value={data} mode={picker} display="default" onChange={handleDateChange} />}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(7, 35, 25, 0.48)' },
  sheet: { maxHeight: '94%', backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: spacing.sm, ...shadow.card },
  handle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
  iconCircle: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  headerText: { flex: 1, marginLeft: spacing.md },
  eyebrow: { color: colors.primary, fontSize: 10, letterSpacing: 1.3, fontWeight: '800' },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 2 },
  closeButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  scoreboard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  teamColumn: { flex: 1, alignItems: 'center' },
  teamIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  teamName: { color: colors.text, fontSize: 12, fontWeight: '800', textAlign: 'center', minHeight: 32, marginTop: spacing.xs },
  scoreControls: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  scoreButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  score: { color: colors.text, fontSize: 28, lineHeight: 32, fontWeight: '900', minWidth: 38, textAlign: 'center' },
  versus: { width: 45, alignItems: 'center' },
  versusText: { color: colors.accent, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  scoreLabel: { color: colors.muted, fontSize: 8, fontWeight: '800', marginTop: 3 },
  label: { color: colors.text, fontSize: 12, fontWeight: '800', marginBottom: spacing.xs, marginTop: spacing.md },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  dateField: { flex: 1, minHeight: 62, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.sm, backgroundColor: colors.primarySoft },
  dateWrap: { flex: 1, marginLeft: spacing.xs },
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

export default EditConfrontoModalModern;
