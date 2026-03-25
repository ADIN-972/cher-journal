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
import { useThemeColors } from '@/theme/ThemeContext';

export default function SignupScreen() {
  const router = useRouter();
  const tc = useThemeColors();
  const { signup, loading, error, clearError } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError || error;

  const handleSignup = async () => {
    setLocalError(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setLocalError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caracteres');
      return;
    }

    try {
      await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
    } catch {
      // Error is handled by store
    }
  };

  const clearAllErrors = () => {
    setLocalError(null);
    clearError();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: tc.boudoir950 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>Cher Journal</Text>
          <Text style={[styles.subtitle, { color: tc.softGold }]}>L'Ecrin des Desirs</Text>
          <View style={[styles.separator, { backgroundColor: tc.gold }]} />
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: tc.card }]}>
          <Text style={[styles.title, { color: tc.text }]}>Creer un compte</Text>
          <Text style={[styles.description, { color: tc.textSecondary }]}>
            Rejoignez notre univers litteraire
          </Text>

          {/* Error */}
          {displayError && (
            <View style={styles.errorBanner}>
              <Text style={[styles.errorText, { color: tc.error }]}>{displayError}</Text>
              <TouchableOpacity onPress={clearAllErrors}>
                <Text style={[styles.errorDismiss, { color: tc.error }]}>x</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Name row */}
          <View style={styles.nameRow}>
            <View style={[styles.inputGroup, styles.nameField]}>
              <Text style={[styles.label, { color: tc.text }]}>Prenom</Text>
              <TextInput
                style={[styles.input, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Marie"
                placeholderTextColor={tc.placeholder}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
            <View style={[styles.inputGroup, styles.nameField]}>
              <Text style={[styles.label, { color: tc.text }]}>Nom</Text>
              <TextInput
                style={[styles.input, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Dupont"
                placeholderTextColor={tc.placeholder}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: tc.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              placeholderTextColor={tc.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: tc.text }]}>Mot de passe</Text>
            <View style={[styles.passwordContainer, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder }]}>
              <TextInput
                style={[styles.passwordInput, { color: tc.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 8 caracteres"
                placeholderTextColor={tc.placeholder}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.showPasswordBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={[styles.showPasswordText, { color: tc.rose }]}>
                  {showPassword ? 'Masquer' : 'Afficher'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: tc.text }]}>Confirmer le mot de passe</Text>
            <TextInput
              style={[styles.input, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Retapez votre mot de passe"
              placeholderTextColor={tc.placeholder}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Signup button */}
          <TouchableOpacity
            style={[styles.signupButton, { backgroundColor: tc.rose }, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signupButtonText}>Creer mon compte</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: tc.separator }]} />
            <Text style={[styles.dividerText, { color: tc.textTertiary }]}>ou</Text>
            <View style={[styles.dividerLine, { backgroundColor: tc.separator }]} />
          </View>

          {/* Login link */}
          <TouchableOpacity
            style={[styles.loginButton, { borderColor: tc.boudoir800 }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.loginButtonText, { color: tc.boudoir800 }]}>J'ai deja un compte</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: tc.textTertiary }]}>
          En creant un compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialite
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
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  nameField: {
    flex: 1,
  },
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

  // Buttons
  signupButton: {
    backgroundColor: colors.rose,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
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
  loginButton: {
    borderWidth: 1,
    borderColor: colors.boudoir[800],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  loginButtonText: {
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
