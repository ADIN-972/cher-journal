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
import { authAPI } from '@/services/api/auth';
import { spacing, fontSize } from '@/utils/theme';

const BG = '#F2EDE9';
const DARK = '#2A1720';
const WINE = '#7a5763';
const GOLD = '#e9c176';
const ROSE_LIGHT = '#e3bcca';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authAPI.resetPassword(email.trim());
      setSuccess(true);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Une erreur est survenue';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successCenter}>
          <View style={styles.successIcon}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Email envoye</Text>
          <Text style={styles.successMessage}>
            Si un compte existe avec l'adresse {email}, vous recevrez un email avec les instructions pour reinitialiser votre mot de passe.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Retour a la connexion</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          <Text style={styles.heroIcon}>🔒</Text>
          <Text style={styles.heroTitle}>Mot de passe oublie</Text>
          <Text style={styles.heroSubtitle}>Reinitialisation par email</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.description}>
            Saisissez votre adresse email et nous vous enverrons un lien pour reinitialiser votre mot de passe.
          </Text>

          {/* Error */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => setError(null)}>
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
                placeholder="votre@email.com"
                placeholderTextColor={`${DARK}4D`}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                editable={!loading}
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading || !email.trim()}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Envoyer le lien</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Back */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Retour a la connexion</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Verifiez vos spams si vous ne recevez pas l'email
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
    paddingVertical: spacing['4xl'],
  },

  // Success
  successCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successCheck: {
    fontSize: 24,
    color: '#22c55e',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: fontSize['2xl'],
    fontFamily: 'Newsreader_400Regular_Italic',
    color: DARK,
    marginBottom: spacing.md,
  },
  successMessage: {
    fontSize: fontSize.sm,
    color: `${DARK}80`,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing['2xl'],
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: fontSize['3xl'],
    fontFamily: 'Newsreader_400Regular_Italic',
    color: DARK,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
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
  description: {
    fontSize: fontSize.sm,
    color: `${DARK}80`,
    lineHeight: 20,
    marginBottom: spacing['2xl'],
    textAlign: 'center',
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
    marginBottom: spacing['2xl'],
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
  input: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: fontSize.sm,
    color: DARK,
  },

  // Buttons
  primaryButton: {
    backgroundColor: WINE,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});
