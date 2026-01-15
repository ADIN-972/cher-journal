import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useI18n } from "../lib/i18n";
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdPerson,
} from "react-icons/md";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!firstName.trim()) {
      const msg =
        t("register.errors.first_name_required") ||
        "Le prénom est obligatoire.";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!lastName.trim()) {
      const msg =
        t("register.errors.last_name_required") || "Le nom est obligatoire.";
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

  const passwordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6)
      return {
        strength: 1,
        label: t("register.strength.weak"),
        color: "bg-red-500",
      };
    if (password.length < 10)
      return {
        strength: 2,
        label: t("register.strength.medium"),
        color: "bg-yellow-500",
      };
    if (
      password.length >= 10 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    )
      return {
        strength: 3,
        label: t("register.strength.strong"),
        color: "bg-green-500",
      };
    return {
      strength: 2,
      label: t("register.strength.medium"),
      color: "bg-yellow-500",
    };
  };

  const strength = passwordStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        {/* Logo or Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">CJ</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {t("register.title")}
          </h1>
          <p className="text-gray-600 mt-2 text-sm">{t("register.subtitle")}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 animate-shake">
            <svg
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5">
          {/* First Name Input */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("register.first_name_label")}
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white/50"
              placeholder={t("register.first_name_placeholder")}
              required
            />
          </div>

          {/* Last Name Input */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("register.last_name_label")}
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white/50"
              placeholder={t("register.last_name_placeholder")}
              required
            />
          </div>

          {/* Username Input (optional) */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("register.username_label")}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white/50"
              placeholder={t("register.username_placeholder")}
            />
          </div>

          {/* Email Input */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("register.email_label")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MdEmail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white/50"
                placeholder={t("register.email_placeholder")}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("register.password_label")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MdLock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white/50"
                placeholder={t("register.password_placeholder")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? (
                  <MdVisibilityOff className="h-5 w-5" />
                ) : (
                  <MdVisibility className="h-5 w-5" />
                )}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        level <= strength.strength
                          ? strength.color
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className="text-xs text-gray-600">
                    {t("register.password_strength")}
                    <span className="font-semibold">{strength.label}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("register.confirm_password_label")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MdLock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white/50"
                placeholder={t("register.confirm_password_placeholder")}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                {showConfirmPassword ? (
                  <MdVisibilityOff className="h-5 w-5" />
                ) : (
                  <MdVisibility className="h-5 w-5" />
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("register.errors.password_mismatch")}
              </p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("register.errors.password_match")}
              </p>
            )}
          </div>

          {/* Terms and conditions */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              required
              className="w-4 h-4 mt-0.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
            />
            <label className="text-xs text-gray-600">
              {t("register.terms.prefix")} {""}
              <a
                href="#"
                className="text-indigo-600 hover:text-indigo-700 font-semibold">
                {t("register.terms.tos")}
              </a>{" "}
              {t("register.terms.and")} {""}
              <a
                href="#"
                className="text-indigo-600 hover:text-indigo-700 font-semibold">
                {t("register.terms.privacy")}
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t("register.submitting")}
              </span>
            ) : (
              t("register.submit")
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {t("register.already_account")} {""}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
              {t("register.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
