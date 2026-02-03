import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (formData.password.length < 6) {
      setValidationError(t('auth.register.validation_password_weak'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError(t('auth.register.validation_password_mismatch'));
      return;
    }

    if (!formData.firstName.trim()) {
      setValidationError(t('auth.register.validation_firstname_required'));
      return;
    }

    if (!formData.lastName.trim()) {
      setValidationError(t('auth.register.validation_lastname_required'));
      return;
    }

    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      navigate('/');
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />

      {/* Register Card */}
      <div className="relative max-w-md w-full bg-gradient-to-br from-purple-900/50 via-blue-900/30 to-slate-900/50 rounded-3xl shadow-2xl backdrop-blur-xl border border-pink-400/20 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-rose-500/50">
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-rose-400 to-pink-300 bg-clip-text text-transparent mb-2">
            {t('auth.register.heading')}
          </h1>
          <p className="text-pink-200/80">{t('auth.register.tagline')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {(error || validationError) && (
            <div className="bg-rose-500/20 border border-rose-400/50 text-rose-200 px-4 py-3 rounded-lg flex items-start gap-3 text-sm">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{validationError || error}</span>
            </div>
          )}

          {/* Name Fields Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-xs font-serif font-semibold text-pink-200 mb-2">
                {t('auth.register.firstname_label')}
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-purple-500/20 border border-purple-400/30 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                placeholder={t('auth.register.firstname_placeholder')}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-xs font-serif font-semibold text-pink-200 mb-2">
                {t('auth.register.lastname_label')}
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-purple-500/20 border border-purple-400/30 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                placeholder={t('auth.register.lastname_placeholder')}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs font-serif font-semibold text-pink-200 mb-2">
              {t('auth.register.email_label')}
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-purple-500/20 border border-purple-400/30 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
              placeholder={t('auth.register.email_placeholder')}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-xs font-serif font-semibold text-pink-200 mb-2">
              {t('auth.register.password_label')}
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-purple-500/20 border border-purple-400/30 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
              placeholder={t('auth.register.password_placeholder')}
            />
            <p className="mt-1 text-xs text-pink-300/60">{t('auth.register.password_helper')}</p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-serif font-semibold text-pink-200 mb-2">
              {t('auth.register.confirm_password_label')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 bg-purple-500/20 border border-purple-400/30 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
              placeholder={t('auth.register.confirm_password_placeholder')}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 mt-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-rose-500/30 hover:shadow-lg hover:shadow-rose-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>{t('auth.register.loading')}</span>
              </>
            ) : (
              <>
                <span>{t('auth.register.button_register')}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-purple-400/0 via-pink-400/30 to-purple-400/0" />
          <span className="text-pink-300/60 text-xs">{t('auth.register.divider')}</span>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-400/0 via-pink-400/30 to-purple-400/0" />
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-400">
          {t('auth.register.login_prompt')}{' '}
          <Link
            to="/login"
            className="text-pink-300 hover:text-pink-200 font-semibold transition-colors duration-300"
          >
            {t('auth.register.login_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
