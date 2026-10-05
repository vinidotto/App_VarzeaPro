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
import { createEquipeParaTorneio } from '../api';
import { colors, radius, shadow, spacing } from '../theme';

type CreateEquipeModalModernProps = {
  torneioId: number;
  onClose: () => void;
};

const toApiDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CreateEquipeModalModern: React.FC<CreateEquipeModalModernProps> = ({ torneioId, onClose }) => {
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [treinador, setTreinador] = useState('');
  const [fundacao, setFundacao] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!nome.trim() || !cidade.trim() || !treinador.trim()) {
      setError('Preencha o nome, a cidade e o treinador.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await createEquipeParaTorneio(torneioId, {
        nome: nome.trim(),
        cidade: cidade.trim(),
        treinador: treinador.trim(),
        fundacao: toApiDate(fundacao),
      });
      onClose();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Não foi possível criar a equipe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.header}>
            <View style={styles.iconCircle}><Ionicons name="shield-outline" size={27} color={colors.primary} /></View>
            <View style={styles.headerText}><Text style={styles.eyebrow}>COMUNIDADE</Text><Text style={styles.title}>Nova equipe</Text></View>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}><Ionicons name="close" size={22} color={colors.muted} /></Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>Cadastre um time para participar dos seus campeonatos.</Text>

            <Text style={styles.label}>Nome da equipe</Text>
            <View style={styles.field}><Ionicons name="shirt-outline" size={19} color={colors.muted} /><TextInput style={styles.input} placeholder="Ex.: Real Várzea" placeholderTextColor={colors.muted} value={nome} onChangeText={setNome} autoCapitalize="words" /></View>
            <Text style={styles.label}>Cidade</Text>
            <View style={styles.field}><Ionicons name="location-outline" size={19} color={colors.muted} /><TextInput style={styles.input} placeholder="Ex.: São Paulo" placeholderTextColor={colors.muted} value={cidade} onChangeText={setCidade} autoCapitalize="words" /></View>
            <Text style={styles.label}>Treinador</Text>
            <View style={styles.field}><Ionicons name="person-outline" size={19} color={colors.muted} /><TextInput style={styles.input} placeholder="Nome do treinador" placeholderTextColor={colors.muted} value={treinador} onChangeText={setTreinador} autoCapitalize="words" /></View>

            <Text style={styles.label}>Fundação</Text>
            <Pressable style={styles.dateField} onPress={() => setShowDatePicker(true)}><Ionicons name="calendar-outline" size={19} color={colors.primary} /><View style={styles.dateTextWrap}><Text style={styles.dateCaption}>DATA DE FUNDAÇÃO</Text><Text style={styles.dateText}>{fundacao.toLocaleDateString('pt-BR')}</Text></View><Ionicons name="chevron-down" size={17} color={colors.primary} /></Pressable>

            {!!error && <View style={styles.errorBox}><Ionicons name="alert-circle-outline" size={18} color={colors.danger} /><Text style={styles.error}>{error}</Text></View>}

            <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={handleCreate} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.white} /> : <><Ionicons name="checkmark-circle-outline" size={20} color={colors.white} /><Text style={styles.primaryButtonText}>Criar equipe</Text></>}
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={onClose} disabled={loading}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {showDatePicker && <DateTimePicker value={fundacao} mode="date" display="default" onChange={(event: DateTimePickerEvent, selectedDate?: Date) => { setShowDatePicker(false); if (selectedDate) setFundacao(selectedDate); }} />}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(7, 35, 25, 0.48)' },
  sheet: { maxHeight: '94%', backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: spacing.sm, ...shadow.card },
  sheetHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
  iconCircle: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  headerText: { flex: 1, marginLeft: spacing.md },
  eyebrow: { color: colors.primary, fontSize: 10, letterSpacing: 1.3, fontWeight: '800' },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 2 },
  closeButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  label: { color: colors.text, fontSize: 12, fontWeight: '800', marginBottom: spacing.xs, marginTop: spacing.sm },
  field: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, backgroundColor: '#FBFDFC' },
  input: { flex: 1, color: colors.text, fontSize: 14, marginLeft: spacing.sm },
  dateField: { minHeight: 62, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, backgroundColor: colors.primarySoft },
  dateTextWrap: { flex: 1, marginLeft: spacing.sm },
  dateCaption: { color: colors.primary, fontSize: 10, letterSpacing: 0.7, fontWeight: '800' },
  dateText: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 3 },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FDEEEE', borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.md },
  error: { flex: 1, color: colors.danger, fontSize: 13, lineHeight: 18, marginLeft: spacing.xs },
  primaryButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: radius.sm, marginTop: spacing.lg },
  primaryButtonText: { color: colors.white, fontSize: 14, fontWeight: '800', marginLeft: spacing.xs },
  cancelButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs },
  cancelText: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.82 },
});

export default CreateEquipeModalModern;
