import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/auth";
import { useI18n } from "../lib/i18n";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      toast.success(t("login.success_message"));
    } catch (err: any) {
      const errorMsg = err.message || t("login.error_message");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <h2 className="font-serif text-4xl italic text-[#2A1720] mb-2">Cher Journal</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#2A1720]/50 font-semibold">
            Administration
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
              {t("login.email_label")}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-none rounded-2xl px-5 py-4 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder="admin@cherjournal.com"
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
                {t("login.password_label")}
              </label>
              <Link
                to="/forgot-password"
                className="text-[10px] font-bold tracking-widest uppercase text-[#7a5763]/80 hover:text-[#7a5763]">
                {t("auth.login.forgot_password")}
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-none rounded-2xl px-5 py-4 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder="••••••••"
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
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#7a5763] to-[#2A1720] rounded-full text-white font-bold tracking-wider uppercase text-xs shadow-lg shadow-[#7a5763]/20 hover:opacity-90 transition-opacity active:scale-[0.98] duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t("messages.loading")}
                </span>
              ) : (
                t("login.submit_button")
              )}
            </button>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-white/60 rounded-2xl border border-[#e9c176]/10 w-full">
          <p className="text-[9px] text-[#2A1720]/40 text-center mb-2 font-bold uppercase tracking-widest">
            {t("login.test_account_title")}
          </p>
          <div className="text-xs text-[#2A1720]/60 space-y-1 text-center">
            <p>
              <span className="font-mono bg-[#F2EDE9] px-3 py-1 rounded-lg text-[#7a5763]">
                admin@cherjournal.com
              </span>
            </p>
            <p>
              <span className="font-mono bg-[#F2EDE9] px-3 py-1 rounded-lg text-[#7a5763]">
                admin123
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-[#2A1720]/50 text-sm">
            {t("auth.no_account_yet")}{" "}
            <Link
              to="/register"
              className="text-[#7a5763] font-bold border-b border-[#7a5763]/40 pb-0.5 ml-1">
              {t("auth.create_account")}
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
