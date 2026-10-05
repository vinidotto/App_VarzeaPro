import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { createTorneio } from '../api';
import { colors, radius, shadow, spacing } from '../theme';

const toApiDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const displayDate = (date: Date | null) => date
  ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  : 'Selecionar data';

const AddTorneioModern: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [picker, setPicker] = useState<'start' | 'end' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!nome.trim() || !localizacao.trim() || !dataInicio || !dataFim) {
      setError('Preencha todos os campos para criar o torneio.');
      return;
    }
    if (dataFim < dataInicio) {
      setError('A data de término deve ser igual ou posterior ao início.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await createTorneio({
        nome: nome.trim(),
        localizacao: localizacao.trim(),
        data_inicio: toApiDate(dataInicio),
        data_fim: toApiDate(dataFim),
      });
      navigation.goBack();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Não foi possível criar o torneio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}><Ionicons name="trophy-outline" size={28} color={colors.accent} /></View>
          <View style={styles.heroText}>
            <Text style={styles.eyebrow}>ORGANIZAÇÃO</Text>
            <Text style={styles.title}>Novo torneio</Text>
            <Text style={styles.subtitle}>Dê o pontapé inicial no próximo campeonato.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informações do torneio</Text>
          <Text style={styles.sectionSubtitle}>Preencha os dados principais para publicar o evento.</Text>

          <Text style={styles.label}>Nome do torneio</Text>
          <View style={styles.field}><Ionicons name="ribbon-outline" size={19} color={colors.muted} /><TextInput style={styles.input} placeholder="Ex.: Copa Várzea Pro" placeholderTextColor={colors.muted} value={nome} onChangeText={setNome} autoCapitalize="words" /></View>

          <Text style={styles.label}>Localização</Text>
          <View style={styles.field}><Ionicons name="location-outline" size={19} color={colors.muted} /><TextInput style={styles.input} placeholder="Ex.: Arena Central" placeholderTextColor={colors.muted} value={localizacao} onChangeText={setLocalizacao} autoCapitalize="words" /></View>

          <Text style={styles.label}>Período</Text>
          <View style={styles.dateRow}>
            <Pressable style={styles.dateField} onPress={() => setPicker('start')}>
              <Ionicons name="calendar-outline" size={19} color={colors.primary} />
              <View style={styles.dateTextWrap}><Text style={styles.dateCaption}>INÍCIO</Text><Text style={[styles.dateText, !dataInicio && styles.placeholder]}>{displayDate(dataInicio)}</Text></View>
            </Pressable>
            <Pressable style={styles.dateField} onPress={() => setPicker('end')}>
              <Ionicons name="calendar-outline" size={19} color={colors.primary} />
              <View style={styles.dateTextWrap}><Text style={styles.dateCaption}>TÉRMINO</Text><Text style={[styles.dateText, !dataFim && styles.placeholder]}>{displayDate(dataFim)}</Text></View>
            </Pressable>
          </View>

          {!!error && <View style={styles.errorBox}><Ionicons name="alert-circle-outline" size={18} color={colors.danger} /><Text style={styles.error}>{error}</Text></View>}

          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <><Ionicons name="checkmark-circle-outline" size={20} color={colors.white} /><Text style={styles.primaryButtonText}>Publicar torneio</Text></>}
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={picker !== null}
        mode="date"
        date={picker === 'end' && dataFim ? dataFim : picker === 'start' && dataInicio ? dataInicio : new Date()}
        minimumDate={picker === 'end' ? dataInicio || undefined : undefined}
        onConfirm={(date) => { if (picker === 'start') setDataInicio(date); else setDataFim(date); setPicker(null); }}
        onCancel={() => setPicker(null)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  hero: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.sm },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1, marginLeft: spacing.md },
  eyebrow: { color: colors.primary, fontSize: 11, letterSpacing: 1.4, fontWeight: '800' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 2 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 3, lineHeight: 18 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '800' },
  sectionSubtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4, marginBottom: spacing.lg },
  label: { color: colors.text, fontSize: 12, fontWeight: '800', marginBottom: spacing.xs, marginTop: spacing.sm },
  field: { minHeight: 53, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, backgroundColor: '#FBFDFC' },
  input: { flex: 1, color: colors.text, fontSize: 14, marginLeft: spacing.sm },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  dateField: { flex: 1, minHeight: 66, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.sm, backgroundColor: colors.primarySoft },
  dateTextWrap: { flex: 1, marginLeft: spacing.xs },
  dateCaption: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  dateText: { color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 4 },
  placeholder: { color: colors.muted, fontWeight: '500' },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FDEEEE', borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.md },
  error: { flex: 1, color: colors.danger, fontSize: 13, lineHeight: 18, marginLeft: spacing.xs },
  primaryButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: radius.sm, marginTop: spacing.lg },
  primaryButtonText: { color: colors.white, fontSize: 14, fontWeight: '800', marginLeft: spacing.xs },
  cancelButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs },
  cancelText: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.82 },
});

export default AddTorneioModern;
