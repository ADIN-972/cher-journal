import { useAuthStore } from '../stores/authStore';

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-gold to-eros-gold bg-clip-text text-transparent mb-2">
          Mon Profil
        </h1>
        <p className="text-boudoir-600 dark:text-boudoir-300">Gérez vos informations personnelles</p>
      </div>

      {/* Profile Card - Boudoir Moderne */}
      <div className="bg-gradient-to-br from-boudoir-900/50 via-boudoir-800/30 to-boudoir-900/50 rounded-3xl shadow-2xl backdrop-blur-xl border border-gold/20 p-8 mb-6">
        {/* Profile Header with Avatar */}
        <div className="flex items-center gap-6 pb-8 border-b border-gold/20 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-eros-gold to-gold flex items-center justify-center shadow-lg shadow-gold/30">
            <span className="material-symbols-outlined text-3xl text-boudoir-950">person</span>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-boudoir-300 text-sm">{user?.email}</p>
            <p className="text-gold/80 text-xs mt-1 uppercase tracking-wide font-medium">
              Rôle: {user?.role}
            </p>
          </div>
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Prénom */}
          <div className="bg-boudoir-800/20 border border-gold/20 rounded-lg p-4">
            <label className="text-xs font-serif font-semibold text-gold/80 uppercase tracking-wide block mb-2">
              Prénom
            </label>
            <p className="text-white text-lg font-medium">{user?.firstName}</p>
          </div>

          {/* Nom */}
          <div className="bg-boudoir-800/20 border border-gold/20 rounded-lg p-4">
            <label className="text-xs font-serif font-semibold text-gold/80 uppercase tracking-wide block mb-2">
              Nom de Famille
            </label>
            <p className="text-white text-lg font-medium">{user?.lastName}</p>
          </div>

          {/* Email */}
          <div className="bg-boudoir-800/20 border border-gold/20 rounded-lg p-4 md:col-span-2">
            <label className="text-xs font-serif font-semibold text-gold/80 uppercase tracking-wide block mb-2">
              Adresse Email
            </label>
            <p className="text-white text-lg font-medium">{user?.email}</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-t border-gold/20 pt-8">
          <h3 className="text-sm font-serif font-semibold text-gold/80 mb-4 uppercase tracking-wide">
            Statistiques de Lecture
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-boudoir-800/20 rounded-lg border border-gold/20">
              <p className="text-2xl font-bold text-gold">0</p>
              <p className="text-xs text-boudoir-300/80 mt-1">Histoires Lues</p>
            </div>
            <div className="text-center p-4 bg-boudoir-800/20 rounded-lg border border-gold/20">
              <p className="text-2xl font-bold text-gold">0</p>
              <p className="text-xs text-boudoir-300/80 mt-1">Favoris</p>
            </div>
            <div className="text-center p-4 bg-boudoir-800/20 rounded-lg border border-gold/20">
              <p className="text-2xl font-bold text-gold">0</p>
              <p className="text-xs text-boudoir-300/80 mt-1">Pages Lues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notice Section */}
      <div className="bg-boudoir-800/30 border border-gold/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="text-sm font-serif font-semibold text-gold/80 mb-1">Paramètres Avancés</h4>
            <p className="text-sm text-boudoir-300/80">
              Les paramètres avancés de profil (modification du mot de passe, préférences de notification, etc.) seront disponibles dans une prochaine mise à jour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
