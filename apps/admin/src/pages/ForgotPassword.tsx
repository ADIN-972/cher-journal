import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-purple-500/30 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              E-mail envoyé
            </h2>
            <p className="text-gray-400 text-center mb-6">
              Si un compte administrateur avec cette adresse e-mail existe, vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <Link
              to="/login"
              className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-medium transition-colors">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-purple-500/30 p-8 rounded-lg">
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Cher Journal
          </h1>
          <h2 className="text-lg font-semibold text-gray-300 text-center mb-6">
            Réinitialiser le mot de passe
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adresse Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="admin@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded transition-colors">
              {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
