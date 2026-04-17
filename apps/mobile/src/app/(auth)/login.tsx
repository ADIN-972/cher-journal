import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@stores/authStore';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';
import { useThemeColors } from '@/theme/ThemeContext';

export default function LoginScreen() {
  const router = useRouter();
  const tc = useThemeColors();
  const { login, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      await login(email.trim(), password);
    } catch {
      // Error is handled by store
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <Image
              source={require('../../../assets/logo-cher-journal.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <Text style={styles.brandName}>Cher Journal</Text>
          <Text style={[styles.tagline, { color: tc.textSecondary }]}>
            Entrez dans votre salon prive
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Error */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Text style={styles.errorDismiss}>x</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="votre@mail.com"
                placeholderTextColor="rgba(42, 23, 32, 0.3)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Mot de passe</Text>
              <TouchableOpacity onPress={() => router.push('/reset-password')}>
                <Text style={styles.forgotText}>Oublie ?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="rgba(42, 23, 32, 0.3)"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.showPasswordBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? 'Masquer' : 'Afficher'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading || !email.trim() || !password.trim()}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Se Connecter</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Nouveau ici ?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.footerLink}>Creer un compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const BG = '#F2EDE9';
const DARK = '#2A1720';
const WINE = '#7a5763';
const GOLD = '#e9c176';
const ROSE_LIGHT = '#e3bcca';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['4xl'],
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  logoGlow: {
    position: 'absolute',
    top: -16,
    left: -16,
    right: -16,
    bottom: -16,
    backgroundColor: ROSE_LIGHT,
    opacity: 0.3,
    borderRadius: 999,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: `${GOLD}33`,
  },
  brandName: {
    fontSize: fontSize['4xl'],
    fontFamily: 'Newsreader_400Regular_Italic',
    color: DARK,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: `${DARK}80`,
    fontWeight: '600',
  },

  // Form
  formContainer: {
    width: '100%',
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#DC2626',
  },
  errorDismiss: {
    fontSize: fontSize.lg,
    color: '#DC2626',
    paddingLeft: spacing.sm,
    fontWeight: '300',
  },

  // Inputs
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: `${DARK}80`,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginLeft: 4,
    marginRight: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: fontSize.sm,
    color: DARK,
  },
  passwordInput: {
    flex: 1,
  },
  showPasswordBtn: {
    paddingHorizontal: 16,
  },
  showPasswordText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: WINE,
  },
  forgotText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: `${WINE}CC`,
  },

  // Login Button
  loginButton: {
    backgroundColor: WINE,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    shadowColor: WINE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: `${DARK}15`,
  },
  dividerText: {
    paddingHorizontal: spacing.lg,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: `${DARK}40`,
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${GOLD}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: `${DARK}60`,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
  },
  footerText: {
    fontSize: fontSize.sm,
    color: `${DARK}80`,
  },
  footerLink: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: WINE,
    borderBottomWidth: 1,
    borderBottomColor: `${WINE}66`,
    paddingBottom: 1,
  },
});
