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
import { spacing, fontSize } from '@/utils/theme';

const BG = '#F2EDE9';
const DARK = '#2A1720';
const WINE = '#7a5763';
const GOLD = '#e9c176';
const ROSE_LIGHT = '#e3bcca';

export default function SignupScreen() {
  const router = useRouter();
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroHeadline}>
            Ecrivons votre{'\n'}
            <Text style={styles.heroGradient}>premier chapitre.</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Rejoignez le Boudoir Moderne et laissez-vous porter par une experience litteraire sur-mesure.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Error */}
          {displayError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{displayError}</Text>
              <TouchableOpacity onPress={clearAllErrors}>
                <Text style={styles.errorDismiss}>x</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Name row */}
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Text style={styles.label}>Prenom</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Marie"
                  placeholderTextColor={`${DARK}4D`}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>
            <View style={styles.nameField}>
              <Text style={styles.label}>Nom</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Dupont"
                  placeholderTextColor={`${DARK}4D`}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="votre@mail.com"
                placeholderTextColor={`${DARK}4D`}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrapperRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 8 caracteres"
                placeholderTextColor={`${DARK}4D`}
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

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Retapez votre mot de passe"
                placeholderTextColor={`${DARK}4D`}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
            {confirmPassword.length > 0 && (
              <Text style={[
                styles.matchHint,
                { color: password === confirmPassword ? '#22c55e' : '#ef4444' }
              ]}>
                {password === confirmPassword ? '✓ Les mots de passe correspondent' : '✕ Les mots de passe ne correspondent pas'}
              </Text>
            )}
          </View>

          {/* Signup button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Creer Mon Compte</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login link */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>J'ai deja un compte</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          En creant un compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialite
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['3xl'],
  },

  // Hero
  heroSection: {
    marginBottom: spacing['2xl'],
  },
  heroHeadline: {
    fontSize: fontSize['4xl'],
    fontFamily: 'Newsreader_400Regular_Italic',
    color: DARK,
    lineHeight: 44,
  },
  heroGradient: {
    color: WINE,
  },
  heroDescription: {
    fontSize: fontSize.sm,
    color: `${DARK}80`,
    lineHeight: 20,
    marginTop: spacing.md,
    maxWidth: 280,
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
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  nameField: {
    flex: 1,
  },
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
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapperRow: {
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
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  matchHint: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    marginLeft: 4,
  },

  // Buttons
  primaryButton: {
    backgroundColor: WINE,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    shadowColor: WINE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
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
  secondaryButton: {
    borderWidth: 1,
    borderColor: `${WINE}66`,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: WINE,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Footer
  footer: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: `${DARK}50`,
    marginTop: spacing['2xl'],
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
  },
});
