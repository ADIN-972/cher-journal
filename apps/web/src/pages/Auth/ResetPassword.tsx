import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { showSuccessToast, showErrorToast } from '../../lib/toastHelper';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#1a0b10cc] to-[#1a0b10e6] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#1a0b10e6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="w-full max-w-md">
          {/* Error Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-rose-600/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-gray-950/80 backdrop-blur-2xl border border-rose-600/30 p-10 rounded-2xl shadow-2xl">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <span className="text-5xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-serif italic text-gray-50/90 mb-4">
                  Lien invalide
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Le lien de réinitialisation n'est pas valide ou a expiré. Veuillez demander un nouveau lien.
                </p>

                <Link
                  to="/forgot-password"
                  className="inline-block w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white py-3 rounded-lg font-bold text-sm transition-all active:scale-[0.98] shadow-xl shadow-rose-600/20">
                  Demander un nouveau lien
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      await api.resetPassword(token, password);
      showSuccessToast('Mot de passe réinitialisé avec succès');
      navigate('/login');
    } catch (error: any) {
      if (error.code === 'INVALID_OR_EXPIRED_TOKEN') {
        setError('Le lien a expiré ou est invalide. Veuillez demander un nouveau lien.');
      } else {
        setError(error.message || 'Une erreur est survenue');
      }
      showErrorToast(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#1a0b10cc] to-[#1a0b10e6] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#1a0b10e6]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md">
        {/* Brand Section */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <h1 className="text-4xl font-serif font-medium tracking-tight text-gold handwriting">
            Cher Journal
          </h1>
        </div>

        {/* Reset Password Card with Glow Effect */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-amber-600/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative bg-gray-950/80 backdrop-blur-2xl border border-amber-600/30 p-10 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-serif italic text-center mb-2 text-gray-50/90">
              Nouveau mot de passe
            </h2>
            <p className="text-center text-gray-400 text-xs mb-8">
              Entrez un nouveau mot de passe pour votre compte
            </p>

            {error && (
              <div className="bg-rose-500/20 border border-rose-400/50 text-rose-200 px-4 py-3 rounded-lg flex items-start gap-3 mb-6">
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

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-amber-600/80 mb-2 uppercase tracking-widest text-[10px]">
                  Nouveau mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900/50 border border-amber-600/20 rounded-lg py-3 px-4 text-gray-50 focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition-all font-serif outline-none placeholder-gray-500"
                  placeholder="Au moins 8 caractères"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 caractères
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-amber-600/80 mb-2 uppercase tracking-widest text-[10px]">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-900/50 border border-amber-600/20 rounded-lg py-3 px-4 text-gray-50 focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition-all font-serif outline-none placeholder-gray-500"
                  placeholder="Répétez le mot de passe"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white py-4 rounded-lg font-bold text-lg transition-all active:scale-[0.98] shadow-xl shadow-rose-600/20 flex items-center justify-center gap-3 mt-8 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Traitement...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">lock</span>
                    Réinitialiser le mot de passe
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-8 border-t border-gray-700/50 flex flex-col items-center gap-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-widest">
                <Link to="/login" className="text-amber-600/60 hover:text-amber-600 transition-colors">
                  Retour à la connexion
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
