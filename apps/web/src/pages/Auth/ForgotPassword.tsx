import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { showSuccessToast, showErrorToast } from '../../lib/toastHelper';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.forgotPassword(email);
      setIsSubmitted(true);
      showSuccessToast('Un e-mail a été envoyé avec un lien de réinitialisation');
    } catch (error: any) {
      showErrorToast(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#1a0b10cc] to-[#1a0b10e6] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#1a0b10e6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="w-full max-w-md">
          {/* Success Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-amber-600/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-gray-950/80 backdrop-blur-2xl border border-amber-600/30 p-10 rounded-2xl shadow-2xl">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <span className="text-5xl">✓</span>
                </div>
                <h2 className="text-2xl font-serif italic text-gray-50/90 mb-4">
                  E-mail envoyé
                </h2>
                <p className="text-gray-400 text-sm mb-2">
                  Si un compte avec cette adresse e-mail existe, vous recevrez bientôt un lien pour réinitialiser votre mot de passe.
                </p>
                <p className="text-gray-500 text-xs mb-6">
                  Le lien expire dans 1 heure.
                </p>

                <Link
                  to="/login"
                  className="inline-block w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white py-3 rounded-lg font-bold text-sm transition-all active:scale-[0.98] shadow-xl shadow-rose-600/20">
                  Retour à la connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Forgot Password Card with Glow Effect */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-amber-600/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative bg-gray-950/80 backdrop-blur-2xl border border-amber-600/30 p-10 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-serif italic text-center mb-8 text-gray-50/90">
              Réinitialiser votre mot de passe
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-amber-600/80 mb-2 uppercase tracking-widest text-[10px]">
                  Adresse Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900/50 border border-amber-600/20 rounded-lg py-3 px-4 text-gray-50 focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition-all font-serif outline-none placeholder-gray-500"
                  placeholder="votre@email.com"
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
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">mail</span>
                    Envoyer le lien
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-8 border-t border-gray-700/50 flex flex-col items-center gap-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-widest">
                Vous vous souvenez de votre mot de passe?{" "}
                <Link
                  to="/login"
                  className="text-amber-600/60 hover:text-amber-600 transition-colors">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
