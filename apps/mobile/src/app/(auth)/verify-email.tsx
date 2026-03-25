import { useState, useRef, useEffect, useCallback } from 'react';
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
import { useAuthStore } from '@stores/authStore';
import { authAPI } from '@/services/api/auth';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';
import { useThemeColors } from '@/theme/ThemeContext';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyEmailScreen() {
  const tc = useThemeColors();
  const { user, setEmailVerified, logout } = useAuthStore();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Start countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Send initial verification code on mount
  useEffect(() => {
    handleSendCode();
  }, []);

  const handleSendCode = useCallback(async () => {
    if (countdown > 0 || sending) return;
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      await authAPI.sendVerificationCode();
      setCountdown(RESEND_COOLDOWN);
      setSuccess('Code envoye ! Verifiez votre boite mail.');
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.userMessage ||
        err.message ||
        'Impossible d\'envoyer le code.';
      // Handle rate limiting
      if (err.response?.status === 429 || err.statusCode === 429) {
        setError('Trop de tentatives. Veuillez patienter quelques minutes.');
        setCountdown(RESEND_COOLDOWN);
      } else {
        setError(message);
      }
    } finally {
      setSending(false);
    }
  }, [countdown, sending]);

  const handleDigitChange = useCallback(
    (text: string, index: number) => {
      // Only accept single digits
      const digit = text.replace(/[^0-9]/g, '').slice(-1);

      setDigits((prev) => {
        const next = [...prev];
        next[index] = digit;
        return next;
      });
      setError(null);
      setSuccess(null);

      // Auto-focus next input
      if (digit && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when last digit is entered
      if (digit && index === CODE_LENGTH - 1) {
        // Use timeout to let state update propagate
        setTimeout(() => {
          const currentDigits = [...digits];
          currentDigits[index] = digit;
          const code = currentDigits.join('');
          if (code.length === CODE_LENGTH) {
            handleVerify(code);
          }
        }, 50);
      }
    },
    [digits],
  );

  const handleKeyPress = useCallback(
    (e: any, index: number) => {
      if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
      }
    },
    [digits],
  );

  const handleVerify = useCallback(
    async (code?: string) => {
      const finalCode = code || digits.join('');
      if (finalCode.length !== CODE_LENGTH) {
        setError('Veuillez saisir le code complet a 6 chiffres.');
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        await authAPI.verifyEmail(finalCode);
        await setEmailVerified(true);
        // Navigation is handled by _layout.tsx detecting emailVerified change
      } catch (err: any) {
        const status = err.response?.status || err.statusCode;
        const message =
          err.response?.data?.message ||
          err.userMessage ||
          err.message ||
          '';

        if (status === 400 || message.toLowerCase().includes('invalid') || message.toLowerCase().includes('incorrect')) {
          setError('Code incorrect. Veuillez reessayer.');
        } else if (status === 410 || message.toLowerCase().includes('expir')) {
          setError('Code expire. Demandez un nouveau code.');
        } else if (status === 429) {
          setError('Trop de tentatives. Veuillez patienter quelques minutes.');
        } else {
          setError(message || 'Une erreur est survenue. Veuillez reessayer.');
        }
        // Clear digits on error
        setDigits(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    },
    [digits, setEmailVerified],
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const maskedEmail = user?.email
    ? user.email.replace(/^(.{2})(.*)(@.*)$/, (_, start, middle, end) => {
        return start + '*'.repeat(Math.min(middle.length, 6)) + end;
      })
    : '';

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
          <Text style={[styles.subtitle, { color: tc.softGold }]}>
            L'Ecrin des Desirs
          </Text>
          <View style={[styles.separator, { backgroundColor: tc.gold }]} />
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: tc.card }]}>
          <Text style={[styles.title, { color: tc.text }]}>
            Verification de l'email
          </Text>
          <Text style={[styles.description, { color: tc.textSecondary }]}>
            Un code a 6 chiffres a ete envoye a
          </Text>
          <Text style={[styles.emailText, { color: tc.gold }]}>
            {maskedEmail}
          </Text>

          {/* Success message */}
          {success && (
            <View style={[styles.successBanner, { borderColor: 'rgba(22, 163, 74, 0.2)' }]}>
              <Text style={[styles.successText, { color: tc.success }]}>
                {success}
              </Text>
            </View>
          )}

          {/* Error message */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={[styles.errorText, { color: tc.error }]}>
                {error}
              </Text>
              <TouchableOpacity onPress={() => setError(null)}>
                <Text style={[styles.errorDismiss, { color: tc.error }]}>
                  x
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Code input boxes */}
          <View style={styles.codeContainer}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.digitInput,
                  {
                    backgroundColor: tc.inputBg,
                    borderColor: digit
                      ? tc.gold
                      : error
                        ? tc.error
                        : tc.inputBorder,
                    color: tc.text,
                  },
                  digit && styles.digitInputFilled,
                ]}
                value={digit}
                onChangeText={(text) => handleDigitChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Verify button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              { backgroundColor: tc.gold },
              (loading || digits.join('').length !== CODE_LENGTH) &&
                styles.buttonDisabled,
            ]}
            onPress={() => handleVerify()}
            disabled={loading || digits.join('').length !== CODE_LENGTH}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Verifier</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[styles.dividerLine, { backgroundColor: tc.separator }]}
            />
            <View
              style={[styles.dividerLine, { backgroundColor: tc.separator }]}
            />
          </View>

          {/* Resend code */}
          <TouchableOpacity
            style={[
              styles.resendButton,
              { borderColor: tc.gold },
              (countdown > 0 || sending) && styles.resendButtonDisabled,
            ]}
            onPress={handleSendCode}
            disabled={countdown > 0 || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color={tc.gold} size="small" />
            ) : (
              <Text
                style={[
                  styles.resendButtonText,
                  { color: tc.gold },
                  (countdown > 0) && { color: tc.textTertiary },
                ]}
              >
                {countdown > 0
                  ? `Renvoyer le code (${countdown}s)`
                  : 'Renvoyer le code'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Logout link */}
          <TouchableOpacity
            style={styles.logoutLink}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutText, { color: tc.textTertiary }]}>
              Se deconnecter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: tc.textTertiary }]}>
          Verifiez votre dossier spam si vous ne trouvez pas l'email
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
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emailText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.gold,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    marginTop: spacing.xs,
  },

  // Success
  successBanner: {
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  successText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
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

  // Code inputs
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  digitInput: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    textAlign: 'center',
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    letterSpacing: 0,
  },
  digitInputFilled: {
    borderWidth: 2,
  },

  // Buttons
  verifyButton: {
    backgroundColor: colors.gold,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  resendButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  logoutLink: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  logoutText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    textDecorationLine: 'underline',
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
