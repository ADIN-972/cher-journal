import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';

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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-red-500/30 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              Lien invalide
            </h2>
            <p className="text-gray-400 text-center mb-6">
              Le lien de réinitialisation n'est pas valide ou a expiré.
            </p>
            <Link
              to="/forgot-password"
              className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-medium transition-colors">
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

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
      navigate('/login');
    } catch (err: any) {
      if (err.code === 'INVALID_OR_EXPIRED_TOKEN') {
        setError('Le lien a expiré ou est invalide. Veuillez demander un nouveau lien.');
      } else {
        setError(err.message || 'Une erreur est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };

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
                Nouveau mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Au moins 8 caractères"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Répétez le mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded transition-colors">
              {isLoading ? 'Traitement...' : 'Réinitialiser le mot de passe'}
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
