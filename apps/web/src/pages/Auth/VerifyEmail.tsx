import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../lib/i18n';
import api from '../../lib/api';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, loadUser } = useAuthStore();
  const { t } = useTranslation();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If user is already verified, redirect to home
  useEffect(() => {
    if (user?.emailVerified) {
      navigate('/', { replace: true });
    }
  }, [user?.emailVerified, navigate]);

  // Send verification code on mount
  useEffect(() => {
    if (user && !user.emailVerified && !codeSent) {
      handleSendCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleSendCode = async () => {
    if (countdown > 0 || isSending) return;
    setIsSending(true);
    setError(null);

    try {
      await api.sendVerificationCode();
      setCountdown(60);
      setCodeSent(true);
    } catch (err: any) {
      const code = err.code || '';
      if (code === 'RATE_LIMITED') {
        setError(t('auth.verify_email.error_rate_limited'));
        setCountdown(60);
      } else {
        setError(err.message || t('auth.verify_email.error_send_failed'));
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (code: string) => {
    if (isSubmitting || code.length !== 6) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await api.verifyEmail(code);
      setSuccess(true);
      // Reload user to update emailVerified status in store
      await loadUser();
      // Short delay so user sees the success state
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } catch (err: any) {
      const code = err.code || '';
      if (code === 'INVALID_CODE') {
        setError(t('auth.verify_email.error_invalid_code'));
      } else if (code === 'CODE_EXPIRED') {
        setError(t('auth.verify_email.error_code_expired'));
      } else if (code === 'TOO_MANY_ATTEMPTS') {
        setError(t('auth.verify_email.error_too_many_attempts'));
      } else {
        setError(err.message || t('auth.verify_email.error_generic'));
      }
      // Clear digits on error so user can re-enter
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (digit && index === 5) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    } else if (digit) {
      // Check if all digits are filled after updating a middle digit
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Move to previous input on backspace when current is empty
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const fullCode = digits.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);

    // Focus the next empty input or the last one
    const nextEmpty = newDigits.findIndex((d) => !d);
    if (nextEmpty >= 0) {
      inputRefs.current[nextEmpty]?.focus();
    } else {
      inputRefs.current[5]?.focus();
      // All filled, auto-submit
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const maskedEmail = user?.email
    ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#1a0b10cc] to-[#1a0b10e6] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#1a0b10e6]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md">
        {/* Brand Section */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="text-amber-600"></div>
          <h1 className="text-4xl font-display font-medium tracking-tight text-gold handwriting">
            {t('auth.verify_email.brand_name')}
          </h1>
        </div>

        {/* Verification Card with Glow Effect */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-amber-600/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative bg-gray-950/80 backdrop-blur-2xl border border-amber-600/30 p-10 rounded-2xl shadow-2xl">
            {/* Mail Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-600/10 border border-amber-600/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-amber-600">mail</span>
              </div>
            </div>

            <h2 className="text-2xl font-display italic text-center mb-3 text-gray-50/90">
              {t('auth.verify_email.title')}
            </h2>

            <p className="text-sm text-gray-400 text-center mb-8 font-serif">
              {t('auth.verify_email.description')}
              <br />
              <span className="text-amber-600/80 font-medium">{maskedEmail}</span>
            </p>

            {/* Success State */}
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
                </div>
                <p className="text-emerald-300 font-serif text-lg">
                  {t('auth.verify_email.success')}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {t('auth.verify_email.redirecting')}
                </p>
              </div>
            ) : (
              <>
                {/* Error Message */}
                {error && (
                  <div className="bg-rose-500/20 border border-rose-400/50 text-rose-200 px-4 py-3 rounded-lg flex items-start gap-3 mb-6">
                    <svg
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* 6-Digit Code Inputs */}
                <div className="flex justify-center gap-3 mb-8">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      disabled={isSubmitting}
                      className="w-12 h-14 text-center text-2xl font-bold bg-gray-900/50 border border-amber-600/20 rounded-lg text-gray-50 focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-all outline-none disabled:opacity-50 selection:bg-amber-600/30"
                      aria-label={`${t('auth.verify_email.digit_label')} ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Submit Button (fallback for users who don't trigger auto-submit) */}
                <button
                  type="button"
                  onClick={() => handleSubmit(digits.join(''))}
                  disabled={isSubmitting || digits.join('').length !== 6}
                  className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white py-4 rounded-lg font-bold text-lg transition-all active:scale-[0.98] shadow-xl shadow-rose-600/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>{t('auth.verify_email.verifying')}</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">verified</span>
                      {t('auth.verify_email.button_verify')}
                    </>
                  )}
                </button>

                {/* Resend Code */}
                <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
                  <p className="text-xs text-gray-500 mb-3">{t('auth.verify_email.no_code')}</p>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || isSending}
                    className="text-sm text-amber-600/80 hover:text-amber-600 transition-colors font-serif italic disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSending
                      ? t('auth.verify_email.sending')
                      : countdown > 0
                        ? `${t('auth.verify_email.resend_countdown')} (${countdown}s)`
                        : t('auth.verify_email.resend_button')
                    }
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-gray-500">
            <a href="#" className="hover:text-amber-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-amber-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-amber-600 transition-colors">
              Help
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
