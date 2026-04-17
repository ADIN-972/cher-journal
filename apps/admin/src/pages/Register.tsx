import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useI18n } from "../lib/i18n";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) {
      const msg = t("register.errors.first_name_required") || "Le prenom est obligatoire.";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!lastName.trim()) {
      const msg = t("register.errors.last_name_required") || "Le nom est obligatoire.";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (password !== confirmPassword) {
      const mismatch = t("register.errors.password_mismatch");
      setError(mismatch);
      toast.error(mismatch);
      return;
    }
    if (password.length < 6) {
      const tooShort = t("register.errors.password_length");
      setError(tooShort);
      toast.error(tooShort);
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        email,
        password,
        firstName,
        lastName,
        username: username || undefined,
      });
      toast.success(t("register.toast.success"));
      navigate("/login");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error?.message ||
        err.message ||
        t("register.toast.error");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pw: string) => {
    if (pw.length === 0) return { strength: 0, label: "", color: "bg-[#2A1720]/10" };
    if (pw.length < 6) return { strength: 1, label: t("register.strength.weak"), color: "bg-red-400" };
    if (pw.length < 10) return { strength: 2, label: t("register.strength.medium"), color: "bg-[#e9c176]" };
    if (pw.length >= 10 && /[A-Z]/.test(pw) && /[0-9]/.test(pw))
      return { strength: 3, label: t("register.strength.strong"), color: "bg-green-500" };
    return { strength: 2, label: t("register.strength.medium"), color: "bg-[#e9c176]" };
  };

  const strength = passwordStrength(password);

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
          {error && (
            <div className="bg-red-50 border border-red-200/60 text-red-700 px-4 py-3 rounded-2xl flex items-start gap-3 text-sm">
              <span className="material-symbols-outlined text-base mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50 mb-2 ml-1">
                {t("register.first_name_label")}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-white border-none rounded-2xl px-4 py-3.5 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder={t("register.first_name_placeholder")}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50 mb-2 ml-1">
                {t("register.last_name_label")}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-white border-none rounded-2xl px-4 py-3.5 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder={t("register.last_name_placeholder")}
                required
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50 mb-2 ml-1">
              {t("register.username_label")}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border-none rounded-2xl px-5 py-4 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder={t("register.username_placeholder")}
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#2A1720]/30 text-lg">
                person
              </span>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50 mb-2 ml-1">
              {t("register.email_label")}
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-none rounded-2xl px-5 py-4 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder={t("register.email_placeholder")}
                required
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#2A1720]/30 text-lg">
                mail
              </span>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50 mb-2 ml-1">
              {t("register.password_label")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-none rounded-2xl px-5 py-4 pr-12 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder={t("register.password_placeholder")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2A1720]/30 hover:text-[#7a5763] transition-colors">
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {/* Strength indicator */}
            {password && (
              <div className="mt-2 ml-1">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        level <= strength.strength ? strength.color : "bg-[#2A1720]/10"
                      }`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className="text-[10px] text-[#2A1720]/40">
                    {t("register.password_strength")} <span className="font-bold">{strength.label}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50 mb-2 ml-1">
              {t("register.confirm_password_label")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white border-none rounded-2xl px-5 py-4 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder={t("register.confirm_password_placeholder")}
                required
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-lg">
                {confirmPassword && password === confirmPassword ? (
                  <span className="text-green-500">check_circle</span>
                ) : confirmPassword ? (
                  <span className="text-red-400">cancel</span>
                ) : (
                  <span className="text-[#2A1720]/30">lock</span>
                )}
              </span>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 pt-1">
            <input
              type="checkbox"
              required
              className="w-4 h-4 mt-0.5 text-[#7a5763] border-[#2A1720]/20 rounded focus:ring-[#e9c176] cursor-pointer accent-[#7a5763]"
            />
            <label className="text-xs text-[#2A1720]/50 leading-relaxed">
              {t("register.terms.prefix")}{" "}
              <a href="#" className="text-[#7a5763] font-bold">{t("register.terms.tos")}</a>{" "}
              {t("register.terms.and")}{" "}
              <a href="#" className="text-[#7a5763] font-bold">{t("register.terms.privacy")}</a>
            </label>
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
                  {t("register.submitting")}
                </span>
              ) : (
                t("register.submit")
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-10 text-center">
          <p className="text-[#2A1720]/50 text-sm">
            {t("register.already_account")}{" "}
            <Link
              to="/login"
              className="text-[#7a5763] font-bold border-b border-[#7a5763]/40 pb-0.5 ml-1">
              {t("register.login")}
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
