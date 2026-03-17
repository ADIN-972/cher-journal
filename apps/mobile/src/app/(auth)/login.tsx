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
import { useRouter } from 'expo-router';
import { useAuthStore } from '@stores/authStore';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';

export default function LoginScreen() {
  const router = useRouter();
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>Cher Journal</Text>
          <Text style={styles.subtitle}>L'Ecrin des Desirs</Text>
          <View style={styles.separator} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.description}>
            Retrouvez vos histoires et votre progression
          </Text>

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
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              placeholderTextColor={colors.gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Votre mot de passe"
                placeholderTextColor={colors.gray[400]}
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

          {/* Forgot password */}
          <TouchableOpacity
            style={styles.forgotLink}
            onPress={() => router.push('/reset-password')}
          >
            <Text style={styles.forgotText}>Mot de passe oublie ?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading || !email.trim() || !password.trim()}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Signup link */}
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.signupButtonText}>Creer un compte</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          En vous connectant, vous acceptez nos conditions d'utilisation
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.boudoir[950],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['4xl'],
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  brand: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: colors.white,
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontWeight: '300',
    color: colors.goldLight,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  separator: {
    width: 50,
    height: 1,
    backgroundColor: colors.gold,
    marginTop: spacing.lg,
  },

  // Form
  form: {
    backgroundColor: colors.white,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing['2xl'],
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.error,
  },
  errorDismiss: {
    fontSize: fontSize.lg,
    color: colors.error,
    paddingLeft: spacing.sm,
    fontWeight: '300',
  },

  // Inputs
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.charcoal,
    backgroundColor: colors.gray[100],
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.charcoal,
  },
  showPasswordBtn: {
    paddingHorizontal: spacing.md,
  },
  showPasswordText: {
    fontSize: fontSize.xs,
    color: colors.rose,
    fontWeight: '500',
  },

  // Forgot
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing['2xl'],
  },
  forgotText: {
    fontSize: fontSize.sm,
    color: colors.rose,
    fontWeight: '500',
  },

  // Buttons
  loginButton: {
    backgroundColor: colors.rose,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.gray[400],
  },
  signupButton: {
    borderWidth: 1,
    borderColor: colors.boudoir[800],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  signupButtonText: {
    color: colors.boudoir[800],
    fontSize: fontSize.lg,
    fontWeight: '600',
  },

  // Footer
  footer: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.boudoir[200],
    marginTop: spacing['2xl'],
    lineHeight: 18,
  },
});
