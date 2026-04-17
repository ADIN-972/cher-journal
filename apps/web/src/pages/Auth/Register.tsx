import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../lib/i18n';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!formData.firstName.trim()) {
      setValidationError(t('auth.register.validation_firstname_required'));
      return;
    }
    if (!formData.lastName.trim()) {
      setValidationError(t('auth.register.validation_lastname_required'));
      return;
    }
    if (formData.password.length < 6) {
      setValidationError(t('auth.register.validation_password_weak'));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError(t('auth.register.validation_password_mismatch'));
      return;
    }

    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      const { user } = useAuthStore.getState();
      if (user && user.emailVerified === false) {
        navigate('/verify-email');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen bg-[#F2EDE9] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden selection:bg-[#e9c176]/30">
      <div className="fixed top-0 right-0 -z-10 w-64 h-64 bg-[#e3bcca]/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-96 h-96 bg-[#e9c176]/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-sm flex flex-col items-center">
        {/* Hero */}
        <section className="mb-8 w-full">
          <h1 className="font-serif italic text-4xl leading-tight text-[#2A1720]">
            Ecrivons votre <br />
            <span className="bg-gradient-to-r from-[#7a5763] to-[#e9c176] bg-clip-text text-transparent">premier chapitre.</span>
          </h1>
          <p className="text-sm text-[#2A1720]/50 max-w-[280px] leading-relaxed mt-3">
            Rejoignez le Boudoir Moderne et laissez-vous porter par une experience litteraire sur-mesure.
          </p>
        </section>

        {/* Form */}
        <form className="space-y-5 w-full" onSubmit={handleSubmit}>
          {displayError && (
            <div className="bg-red-50 border border-red-200/60 text-red-700 px-4 py-3 rounded-2xl flex items-start gap-3 text-sm">
              <span className="material-symbols-outlined text-base mt-0.5">error</span>
              <span>{displayError}</span>
            </div>
          )}

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50 mb-2 ml-1">
                {t('auth.register.firstname_label')}
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-white border-none rounded-2xl px-4 py-3.5 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder={t('auth.register.firstname_placeholder')}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50 mb-2 ml-1">
                {t('auth.register.lastname_label')}
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-white border-none rounded-2xl px-4 py-3.5 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder={t('auth.register.lastname_placeholder')}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50 mb-2 ml-1">
              {t('auth.register.email_label')}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border-none rounded-2xl px-5 py-4 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder={t('auth.register.email_placeholder')}
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#2A1720]/30 text-lg">
                mail
              </span>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50 mb-2 ml-1">
              {t('auth.register.password_label')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white border-none rounded-2xl px-5 py-4 pr-12 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder={t('auth.register.password_placeholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2A1720]/30 hover:text-[#7a5763] transition-colors">
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <p className="mt-1.5 ml-1 text-[10px] text-[#2A1720]/30">{t('auth.register.password_helper')}</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50 mb-2 ml-1">
              {t('auth.register.confirm_password_label')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-white border-none rounded-2xl px-5 py-4 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder={t('auth.register.confirm_password_placeholder')}
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-lg">
                {formData.confirmPassword && formData.password === formData.confirmPassword ? (
                  <span className="text-green-500">check_circle</span>
                ) : formData.confirmPassword ? (
                  <span className="text-red-400">cancel</span>
                ) : (
                  <span className="text-[#2A1720]/30">lock</span>
                )}
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#7a5763] to-[#2A1720] rounded-full text-white font-bold tracking-wider uppercase text-xs shadow-lg shadow-[#7a5763]/20 hover:opacity-90 transition-opacity active:scale-[0.98] duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  {t('auth.register.loading')}
                </span>
              ) : (
                t('auth.register.button_register')
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-10 text-center pb-8">
          <p className="text-[#2A1720]/50 text-sm">
            {t('auth.register.login_prompt')}{' '}
            <Link
              to="/login"
              className="text-[#7a5763] font-bold border-b border-[#7a5763]/40 pb-0.5 ml-1">
              {t('auth.register.login_link')}
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
