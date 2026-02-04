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
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#1a0b10cc] to-g[#1a0b10e6] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#1a0b10e6]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md">
        {/* Brand Section */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="text-amber-600">
            
          </div>
          <h1 className="text-4xl font-display font-medium tracking-tight text-gold handwriting">
            {t("auth.login.brand_name")}
          </h1>
        </div>

        {/* Login Card with Glow Effect */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-amber-600/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative bg-gray-950/80 backdrop-blur-2xl border border-amber-600/30 p-10 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-display italic text-center mb-8 text-gray-50/90">
              {t("auth.login.tagline")}
            </h2>

            <form
              className="space-y-6"
              onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="bg-rose-500/20 border border-rose-400/50 text-rose-200 px-4 py-3 rounded-lg flex items-start gap-3">
                  <svg
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-amber-600/80 mb-2 uppercase tracking-widest text-[10px]">
                  {t("auth.login.email_label")}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-gray-900/50 border border-amber-600/20 rounded-lg py-3 px-4 text-gray-50 focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition-all font-serif outline-none placeholder-gray-500"
                  placeholder={t("auth.login.email_placeholder")}
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-amber-600/80 mb-2 uppercase tracking-widest text-[10px]">
                  {t("auth.login.password_label")}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-gray-900/50 border border-amber-600/20 rounded-lg py-3 px-4 text-gray-50 focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition-all font-serif outline-none placeholder-gray-500"
                  placeholder={t("auth.login.password_placeholder")}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white py-4 rounded-lg font-bold text-lg transition-all active:scale-[0.98] shadow-xl shadow-rose-600/20 flex items-center justify-center gap-3 mt-8 disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined text-xl">key</span>
                {isLoading
                  ? t("auth.login.loading")
                  : t("auth.login.button_login")}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-8 border-t border-gray-700/50 flex flex-col items-center gap-4">
              <Link
                to="#"
                className="text-sm text-gray-400 hover:text-amber-600 transition-colors font-serif italic">
                {t("auth.forgot_password")}
              </Link>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest">
                {t("auth.login.no_account")}{" "}
                <Link
                  to="/register"
                  className="text-amber-600/60 hover:text-amber-600 transition-colors">
                  {t("auth.login.register_link")}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-gray-500">
            <a
              href="#"
              className="hover:text-amber-600 transition-colors">
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-amber-600 transition-colors">
              Terms
            </a>
            <a
              href="#"
              className="hover:text-amber-600 transition-colors">
              Help
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
