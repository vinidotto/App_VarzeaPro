import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../api';
import { colors, radius, shadow, spacing } from '../theme';

const LoginModern: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('Informe seu usuário e sua senha para continuar.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const user = await loginUser(username.trim(), password);
      if (!user?.access || !user?.refresh) {
        throw new Error('A sessão não pôde ser iniciada. Tente novamente.');
      }

      await AsyncStorage.multiSet([
        ['auth_token', user.access],
        ['refresh_token', user.refresh],
        ['is_staff', String(user.is_staff ?? false)],
      ]);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brandBlock}>
          <View style={styles.logoFrame}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.eyebrow}>VÁRZEA PRO</Text>
          <Text style={styles.title}>A quadra começa aqui.</Text>
          <Text style={styles.subtitle}>Organize seus torneios e conecte sua equipe.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bem-vindo de volta</Text>
          <Text style={styles.cardSubtitle}>Entre para acompanhar seus campeonatos.</Text>

          <View style={styles.field}>
            <Ionicons name="person-outline" size={19} color={colors.muted} />
            <TextInput
              style={styles.input}
              placeholder="Nome de usuário"
              placeholderTextColor={colors.muted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={19} color={colors.muted} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <Pressable onPress={() => setShowPassword((visible) => !visible)} hitSlop={10}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
            </Pressable>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>Entrar na conta</Text>}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ainda não tem uma conta?</Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Criar conta</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryDark },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  brandBlock: { alignItems: 'center', marginBottom: spacing.lg },
  logoFrame: { width: 118, height: 82, marginBottom: spacing.md, borderRadius: radius.md, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', ...shadow.card },
  logo: { width: 104, height: 70 },
  eyebrow: { color: '#B9E6D2', fontSize: 12, letterSpacing: 2.2, fontWeight: '800' },
  title: { color: colors.white, fontSize: 27, fontWeight: '800', marginTop: spacing.xs, textAlign: 'center' },
  subtitle: { color: '#D4E8DF', fontSize: 14, marginTop: spacing.xs, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  cardTitle: { color: colors.text, fontSize: 21, fontWeight: '800' },
  cardSubtitle: { color: colors.muted, marginTop: 5, marginBottom: spacing.lg, fontSize: 14 },
  field: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm, backgroundColor: '#FBFDFC' },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 0, marginLeft: spacing.sm },
  error: { color: colors.danger, fontSize: 13, lineHeight: 19, marginBottom: spacing.sm },
  primaryButton: { minHeight: 54, borderRadius: radius.sm, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  primaryButtonText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { color: '#D4E8DF', fontSize: 14 },
  link: { color: '#FFC06B', fontWeight: '800', marginLeft: 5, fontSize: 14 },
});

export default LoginModern;
