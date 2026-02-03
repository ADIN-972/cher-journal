import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />

      {/* Login Card */}
      <div className="relative max-w-md w-full bg-gradient-to-br from-purple-900/50 via-blue-900/30 to-slate-900/50 rounded-3xl shadow-2xl backdrop-blur-xl border border-pink-400/20 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-rose-500/50">
            <span className="text-2xl">📖</span>
          </div>
          <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-rose-400 to-pink-300 bg-clip-text text-transparent mb-2">
            {t('auth.login.brand_name')}
          </h1>
          <p className="text-pink-200/80">{t('auth.login.tagline')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/20 border border-rose-400/50 text-rose-200 px-4 py-3 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-serif font-semibold text-pink-200 mb-3">
              {t('auth.login.email_label')}
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-purple-500/20 border border-purple-400/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
              placeholder={t('auth.login.email_placeholder')}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-serif font-semibold text-pink-200 mb-3">
              {t('auth.login.password_label')}
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-purple-500/20 border border-purple-400/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
              placeholder={t('auth.login.password_placeholder')}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-rose-500/30 hover:shadow-lg hover:shadow-rose-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                <span>{t('auth.login.loading')}</span>
              </>
            ) : (
              <>
                <span>{t('auth.login.button_login')}</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-purple-400/0 via-pink-400/30 to-purple-400/0" />
          <span className="text-pink-300/60 text-sm">{t('auth.login.divider')}</span>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-400/0 via-pink-400/30 to-purple-400/0" />
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-400">
          {t('auth.login.no_account')}{' '}
          <Link
            to="/register"
            className="text-pink-300 hover:text-pink-200 font-semibold transition-colors duration-300"
          >
            {t('auth.login.register_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
