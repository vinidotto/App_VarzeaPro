import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useNavigation } from '@react-navigation/native';
import { clearSession, getUserDetails, hasAuthToken, logoffUser, updateUserDetails } from '../api';
import { colors, radius, shadow, spacing } from '../theme';

type User = {
  id: number;
  username?: string;
  nome_completo?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
};

const UserDetailsModern: React.FC = () => {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const goToLogin = () => {
    const rootNavigation = navigation.getParent?.() ?? navigation;
    rootNavigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      try {
        if (!await hasAuthToken()) {
          if (mounted) setSessionExpired(true);
          return;
        }
        const data = await getUserDetails();
        if (mounted) setUser(data);
      } catch {
        if (mounted) setSessionExpired(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadUser();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const updated = await updateUserDetails(user.id, {
        nome_completo: user.nome_completo,
        email: user.email,
        telefone: user.telefone,
        cidade: user.cidade,
      });
      setUser(updated);
      Alert.alert('Tudo certo', 'Seus dados foram atualizados.');
    } catch {
      Alert.alert('Não foi possível salvar', 'Confira sua conexão e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoff = async () => {
    setSigningOut(true);
    try {
      await logoffUser();
    } catch {
      // A sessão local será encerrada mesmo se o refresh token já estiver inválido.
    } finally {
      await clearSession();
      goToLogin();
      setSigningOut(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  if (sessionExpired || !user) {
    return (
      <View style={styles.center}>
        <View style={styles.expiredIcon}><Ionicons name="lock-closed-outline" size={30} color={colors.primary} /></View>
        <Text style={styles.expiredTitle}>Sessão não encontrada</Text>
        <Text style={styles.expiredText}>Entre novamente para acessar seu perfil.</Text>
        <Pressable style={styles.primaryButton} onPress={goToLogin}><Text style={styles.primaryButtonText}>Ir para o login</Text></Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(user.nome_completo || user.username || 'U').charAt(0).toUpperCase()}</Text></View>
          <Text style={styles.name}>{user.nome_completo || user.username || 'Seu perfil'}</Text>
          <Text style={styles.handle}>@{user.username || 'usuario'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Seus dados</Text>
          <Text style={styles.sectionSubtitle}>Mantenha suas informações atualizadas.</Text>
          <View style={styles.field}><Ionicons name="person-outline" size={18} color={colors.muted} /><TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor={colors.muted} value={user.nome_completo || ''} onChangeText={(value) => setUser({ ...user, nome_completo: value })} /></View>
          <View style={styles.field}><Ionicons name="mail-outline" size={18} color={colors.muted} /><TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={colors.muted} keyboardType="email-address" value={user.email || ''} onChangeText={(value) => setUser({ ...user, email: value })} /></View>
          <View style={styles.field}><Ionicons name="call-outline" size={18} color={colors.muted} /><TextInput style={styles.input} placeholder="Telefone" placeholderTextColor={colors.muted} keyboardType="phone-pad" value={user.telefone || ''} onChangeText={(value) => setUser({ ...user, telefone: value })} /></View>
          <View style={styles.field}><Ionicons name="location-outline" size={18} color={colors.muted} /><TextInput style={styles.input} placeholder="Cidade" placeholderTextColor={colors.muted} value={user.cidade || ''} onChangeText={(value) => setUser({ ...user, cidade: value })} /></View>
          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={colors.white} /> : <><Ionicons name="checkmark-circle-outline" size={19} color={colors.white} /><Text style={styles.primaryButtonText}>Salvar alterações</Text></>}
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogoff} disabled={signingOut}>
          {signingOut ? <ActivityIndicator color={colors.danger} /> : <><Ionicons name="log-out-outline" size={19} color={colors.danger} /><Text style={styles.logoutText}>Sair da conta</Text></>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.background },
  profileHeader: { alignItems: 'center', paddingVertical: spacing.lg },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  avatarText: { color: colors.white, fontSize: 36, fontWeight: '800' },
  name: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: spacing.md },
  handle: { color: colors.muted, fontSize: 14, marginTop: 3 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  sectionSubtitle: { color: colors.muted, fontSize: 13, marginTop: 4, marginBottom: spacing.lg },
  field: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm, backgroundColor: '#FBFDFC' },
  input: { flex: 1, color: colors.text, fontSize: 14, marginLeft: spacing.sm },
  primaryButton: { minHeight: 50, borderRadius: radius.sm, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.md },
  primaryButtonText: { color: colors.white, fontSize: 14, fontWeight: '800', marginLeft: spacing.xs },
  logoutButton: { minHeight: 50, borderRadius: radius.sm, backgroundColor: '#FDEEEE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: '800', marginLeft: spacing.xs },
  pressed: { opacity: 0.82 },
  expiredIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  expiredTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: spacing.md },
  expiredText: { color: colors.muted, fontSize: 14, marginTop: spacing.xs, textAlign: 'center' },
});

export default UserDetailsModern;
