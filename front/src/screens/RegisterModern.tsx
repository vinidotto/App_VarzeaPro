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
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from '../api';
import { colors, radius, shadow, spacing } from '../theme';

const RegisterModern: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email.trim() || !username.trim() || password.length < 6) {
      setError('Preencha os campos e use uma senha com pelo menos 6 caracteres.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const session = await registerUser(email.trim(), username.trim(), password);
      if (!session?.access || !session?.refresh) {
        throw new Error('A conta foi criada, mas a sessão não pôde ser iniciada.');
      }

      await AsyncStorage.multiSet([
        ['auth_token', session.access],
        ['refresh_token', session.refresh],
        ['is_staff', 'False'],
      ]);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <View style={styles.iconCircle}><Ionicons name="sparkles-outline" size={28} color={colors.primary} /></View>
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>Entre para organizar o futebol da sua comunidade.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.field}><Ionicons name="mail-outline" size={19} color={colors.muted} /><TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} /></View>
          <View style={styles.field}><Ionicons name="person-outline" size={19} color={colors.muted} /><TextInput style={styles.input} placeholder="Nome de usuário" placeholderTextColor={colors.muted} value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} /></View>
          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={19} color={colors.muted} />
            <TextInput style={styles.input} placeholder="Senha" placeholderTextColor={colors.muted} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
            <Pressable onPress={() => setShowPassword((visible) => !visible)} hitSlop={10}><Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} /></Pressable>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Criar minha conta</Text>}
          </Pressable>
        </View>

        <View style={styles.footer}><Text style={styles.footerText}>Já tem uma conta?</Text><Pressable onPress={() => navigation.navigate('Login')}><Text style={styles.link}>Entrar</Text></Pressable></View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  intro: { alignItems: 'center', marginBottom: spacing.lg },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  field: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm, backgroundColor: '#FBFDFC' },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 0, marginLeft: spacing.sm },
  error: { color: colors.danger, fontSize: 13, lineHeight: 19, marginBottom: spacing.sm },
  button: { minHeight: 54, borderRadius: radius.sm, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '800', marginLeft: 5, fontSize: 14 },
});

export default RegisterModern;
