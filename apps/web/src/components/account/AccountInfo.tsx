import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../hooks/useToast';
import { showErrorToast, showSuccessToast } from '../../lib/toastHelper';

export default function AccountInfo() {
  const { user } = useAuthStore();
  const toast = useToast();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });

  // Sync when user data becomes available (e.g. after async load)
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user?.id]);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handlePersonalInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to update personal info
    showSuccessToast(toast, 'PROFILE_UPDATED');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      showErrorToast(toast, 'PASSWORD_MISMATCH');
      return;
    }

    // TODO: Call API to change password
    showSuccessToast(toast, 'PASSWORD_CHANGED');
    setIsEditingPassword(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleDeleteAccount = async () => {
    // TODO: Call API to delete account
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
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

          <form onSubmit={handlePersonalInfoSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-white/70 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={personalInfo.firstName}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, firstName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-white/70 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={personalInfo.lastName}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, lastName: e.target.value })
                  }
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
                value={personalInfo.email}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
              />
            </div>

            <button
              type="submit"
              className="bg-[#c5a059] hover:bg-[#b8935a] text-white px-6 py-2 rounded-xl font-medium text-sm transition-all"
            >
              Mettre à jour
            </button>
          </form>
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
              <span className="material-symbols-outlined">lock</span>
              <span className="text-sm">Mot de passe protégé</span>
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
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium text-sm transition-all"
              >
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2d1620] rounded-2xl border border-red-300 dark:border-red-800 p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-red-600 text-3xl">
                warning
              </span>
              <h3 className="text-xl font-display italic text-red-900 dark:text-red-300">
                Confirmer la suppression
              </h3>
            </div>
            <p className="text-sm text-charcoal dark:text-white/70 mb-6">
              Cette action est irréversible. Toutes vos données, achats et préférences seront définitivement supprimés.
            </p>
            <p className="text-sm font-medium text-charcoal dark:text-white/70 mb-2">
              Tapez <span className="font-bold text-red-600">SUPPRIMER</span> pour confirmer :
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full px-4 py-3 rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'SUPPRIMER'}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all"
              >
                Supprimer définitivement
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 bg-boudoir-200 dark:bg-boudoir-800 text-charcoal dark:text-white py-3 rounded-xl font-medium hover:bg-boudoir-300 dark:hover:bg-boudoir-700 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
