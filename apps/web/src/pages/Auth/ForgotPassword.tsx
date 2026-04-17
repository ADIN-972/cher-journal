import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
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
      showSuccessToast('Un e-mail a ete envoye avec un lien de reinitialisation');
    } catch (error: any) {
      showErrorToast(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F2EDE9] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="fixed top-0 right-0 -z-10 w-64 h-64 bg-[#e3bcca]/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="fixed bottom-0 left-0 -z-10 w-96 h-96 bg-[#e9c176]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-sm text-center">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-green-600 text-2xl">check</span>
            </div>
            <h2 className="font-serif text-2xl italic text-[#2A1720] mb-3">E-mail envoye</h2>
            <p className="text-sm text-[#2A1720]/50 leading-relaxed mb-2">
              Si un compte avec cette adresse e-mail existe, vous recevrez bientot un lien pour reinitialiser votre mot de passe.
            </p>
            <p className="text-xs text-[#2A1720]/30">Le lien expire dans 1 heure.</p>
          </div>

          <Link
            to="/login"
            className="block w-full py-4 bg-gradient-to-r from-[#7a5763] to-[#2A1720] rounded-full text-white font-bold tracking-wider uppercase text-xs shadow-lg shadow-[#7a5763]/20 hover:opacity-90 transition-opacity text-center">
            Retour a la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2EDE9] flex flex-col items-center justify-center px-4 relative overflow-hidden selection:bg-[#e9c176]/30">
      <div className="fixed top-0 right-0 -z-10 w-64 h-64 bg-[#e3bcca]/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-96 h-96 bg-[#e9c176]/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-sm flex flex-col items-center">
        {/* Hero */}
        <section className="mb-10 text-center">
          <span className="material-symbols-outlined text-[#e9c176] text-5xl mb-4 block">lock_reset</span>
          <h2 className="font-serif text-3xl italic text-[#2A1720] mb-2">Mot de passe oublie</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#2A1720]/50 font-semibold">
            Reinitialisation par email
          </p>
        </section>

        {/* Form */}
        <form className="space-y-6 w-full" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#2A1720]/50 mb-2 ml-1">
              Adresse Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-none rounded-2xl px-5 py-4 text-[#2A1720] placeholder:text-[#2A1720]/30 focus:ring-2 focus:ring-[#e9c176]/40 transition-all outline-none shadow-sm text-sm"
                placeholder="votre@email.com"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#2A1720]/30 text-lg">
                mail
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#7a5763] to-[#2A1720] rounded-full text-white font-bold tracking-wider uppercase text-xs shadow-lg shadow-[#7a5763]/20 hover:opacity-90 transition-opacity active:scale-[0.98] duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Envoi en cours...
                </span>
              ) : (
                'Envoyer le lien'
              )}
            </button>
          </div>
        </form>

        <footer className="mt-10 text-center">
          <p className="text-[#2A1720]/50 text-sm">
            Vous vous souvenez ?{' '}
            <Link
              to="/login"
              className="text-[#7a5763] font-bold border-b border-[#7a5763]/40 pb-0.5 ml-1">
              Se connecter
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
