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
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';
import { useThemeColors } from '@/theme/ThemeContext';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const tc = useThemeColors();
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
          {success ? (
            /* Success state */
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
              <Text style={[styles.title, { color: tc.text }]}>Email envoye</Text>
              <Text style={[styles.successMessage, { color: tc.textSecondary }]}>
                Si un compte existe avec l'adresse {email}, vous recevrez un email avec les instructions pour reinitialiser votre mot de passe.
              </Text>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: tc.rose }]}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Retour a la connexion</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Form state */
            <>
              <Text style={[styles.title, { color: tc.text }]}>Mot de passe oublie</Text>
              <Text style={[styles.description, { color: tc.textSecondary }]}>
                Saisissez votre adresse email et nous vous enverrons un lien pour reinitialiser votre mot de passe.
              </Text>

              {/* Error */}
              {error && (
                <View style={styles.errorBanner}>
                  <Text style={[styles.errorText, { color: tc.error }]}>{error}</Text>
                  <TouchableOpacity onPress={() => setError(null)}>
                    <Text style={[styles.errorDismiss, { color: tc.error }]}>x</Text>
                  </TouchableOpacity>
                </View>
              )}

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
                  autoFocus
                  editable={!loading}
                />
              </View>

              {/* Submit button */}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: tc.rose }, loading && styles.buttonDisabled]}
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
                <View style={[styles.dividerLine, { backgroundColor: tc.separator }]} />
                <Text style={[styles.dividerText, { color: tc.textTertiary }]}>ou</Text>
                <View style={[styles.dividerLine, { backgroundColor: tc.separator }]} />
              </View>

              {/* Back to login */}
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: tc.boudoir800 }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.secondaryButtonText, { color: tc.boudoir800 }]}>Retour a la connexion</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: tc.textTertiary }]}>
          Verifiez vos spams si vous ne recevez pas l'email
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
    lineHeight: 20,
  },

  // Success
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successIconText: {
    fontSize: fontSize['2xl'],
    color: '#22c55e',
    fontWeight: '700',
  },
  successMessage: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
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
    marginBottom: spacing['2xl'],
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

  // Buttons
  primaryButton: {
    backgroundColor: colors.rose,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
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
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.boudoir[800],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  secondaryButtonText: {
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
