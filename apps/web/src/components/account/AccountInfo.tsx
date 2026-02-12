import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

export default function AccountInfo() {
  const { user } = useAuthStore();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    // TODO: Call API to change password
    alert('Mot de passe modifié avec succès');
    setIsEditingPassword(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <div>
      <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
        Informations de Compte
      </h2>
      <p className="text-charcoal dark:text-white/70 mb-8">
        Gérez vos informations personnelles et votre sécurité.
      </p>

      <div className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-200 dark:border-[#c5a059]/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#c5a059] text-2xl">
              person
            </span>
            <h3 className="text-xl font-display italic text-charcoal dark:text-white">
              Informations Personnelles
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-white/70 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  defaultValue={user?.firstName}
                  className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-white/70 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  defaultValue={user?.lastName}
                  className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-white/70 mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
              />
            </div>

            <button className="bg-[#c5a059] hover:bg-[#b8935a] text-white px-6 py-2 rounded-xl font-medium text-sm transition-all">
              Mettre à jour
            </button>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-200 dark:border-[#c5a059]/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#c5a059] text-2xl">
                lock
              </span>
              <h3 className="text-xl font-display italic text-charcoal dark:text-white">
                Sécurité
              </h3>
            </div>
            {!isEditingPassword && (
              <button
                onClick={() => setIsEditingPassword(true)}
                className="text-[#c5a059] hover:text-[#b8935a] font-medium text-sm transition-colors"
              >
                Changer le mot de passe
              </button>
            )}
          </div>

          {isEditingPassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-white/70 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-white/70 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-white/70 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#c5a059] hover:bg-[#b8935a] text-white py-3 rounded-xl font-medium transition-all"
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPassword(false)}
                  className="flex-1 bg-boudoir-200 dark:bg-boudoir-800 text-charcoal dark:text-white py-3 rounded-xl font-medium hover:bg-boudoir-300 dark:hover:bg-boudoir-700 transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-3 text-charcoal dark:text-white/70">
              <span className="material-symbols-outlined">check_circle</span>
              <span className="text-sm">
                Dernière modification il y a 3 mois
              </span>
            </div>
          )}
        </div>

        {/* Account Deletion */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">
              warning
            </span>
            <div>
              <h3 className="text-lg font-display italic text-red-900 dark:text-red-300 mb-2">
                Zone de danger
              </h3>
              <p className="text-sm text-red-800 dark:text-red-400 mb-4">
                La suppression de votre compte est définitive et irréversible. Toutes vos données seront perdues.
              </p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium text-sm transition-all">
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
