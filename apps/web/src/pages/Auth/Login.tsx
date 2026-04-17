import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../lib/i18n';

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
      const { user } = useAuthStore.getState();
      if (user && user.emailVerified === false) {
        navigate('/verify-email');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2EDE9] flex flex-col items-center justify-center px-4 relative overflow-hidden selection:bg-[#e9c176]/30">
      {/* Visual Accents */}
      <div className="fixed top-0 right-0 -z-10 w-64 h-64 bg-[#e3bcca]/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-96 h-96 bg-[#e9c176]/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-sm flex flex-col items-center">
        {/* Hero Section */}
        <section className="mb-10 text-center">
          <div className="relative inline-block mb-5">
            <div className="absolute -inset-4 bg-[#e3bcca]/30 blur-2xl rounded-full" />
            <img
              src="/logo-cher-journal.png"
              alt="Cher Journal"
              className="relative w-20 h-20 object-contain rounded-full border-2 border-[#e9c176]/20 p-1 bg-white shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <h2 className="font-serif text-4xl italic text-[#2A1720] mb-2">
            {t('auth.login.brand_name')}
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#2A1720]/50 font-semibold">
            {t('auth.login.tagline')}
          </p>
        </section>

        {/* Login Form */}
        <form className="space-y-6 w-full" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200/60 text-red-700 px-4 py-3 rounded-2xl flex items-start gap-3 text-sm">
              <span className="material-symbols-outlined text-base mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50 mb-2 ml-1">
              {t('auth.login.email_label')}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border-none rounded-2xl px-5 py-4 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder={t('auth.login.email_placeholder')}
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#2A1720]/30 text-lg">
                mail
              </span>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50">
                {t('auth.login.password_label')}
              </label>
              <Link
                to="/forgot-password"
                className="text-[10px] font-bold tracking-widest uppercase text-[#7a5763]/80 hover:text-[#7a5763]">
                {t('auth.login.forgot_password')}
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white border-none rounded-2xl px-5 py-4 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder={t('auth.login.password_placeholder')}
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#2A1720]/30 text-lg">
                lock
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#7a5763] to-[#2A1720] rounded-full text-white font-bold tracking-wider uppercase text-xs shadow-lg shadow-[#7a5763]/20 hover:opacity-90 transition-opacity active:scale-[0.98] duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? t('auth.login.loading') : t('auth.login.button_login')}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-[#2A1720]/10" />
            <span className="text-[10px] uppercase tracking-widest text-[#2A1720]/30">Ou</span>
            <div className="h-[1px] flex-1 bg-[#2A1720]/10" />
          </div>

          {/* Social Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              className="flex-1 py-3 flex items-center justify-center gap-2 border border-[#e9c176]/20 rounded-full hover:bg-white transition-colors">
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-4 h-4"
              />
              <span className="text-[10px] font-bold uppercase tracking-tighter text-[#2A1720]/60">
                Google
              </span>
            </button>
            <button
              type="button"
              className="flex-1 py-3 flex items-center justify-center gap-2 border border-[#e9c176]/20 rounded-full hover:bg-white transition-colors">
              <span className="material-symbols-outlined text-base text-[#2A1720]/60">phone_iphone</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-[#2A1720]/60">
                Apple
              </span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-12 text-center pb-8">
          <p className="text-[#2A1720]/50 text-sm">
            {t('auth.login.no_account')}{' '}
            <Link
              to="/register"
              className="text-[#7a5763] font-bold border-b border-[#7a5763]/40 pb-0.5 ml-1">
              {t('auth.login.register_link')}
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
