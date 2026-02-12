import { useAuthStore } from '../stores/authStore';

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-rose-400 to-pink-300 bg-clip-text text-transparent mb-2">
          Mon Profil
        </h1>
        <p className="text-pink-200/70">Gérez vos informations personnelles</p>
      </div>

      {/* Profile Card - Boudoir Moderne */}
      <div className="bg-gradient-to-br from-purple-900/50 via-blue-900/30 to-slate-900/50 rounded-3xl shadow-2xl backdrop-blur-xl border border-pink-400/20 p-8 mb-6">
        {/* Profile Header with Avatar */}
        <div className="flex items-center gap-6 pb-8 border-b border-pink-400/20 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/50">
            <span className="text-3xl">👤</span>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-pink-200/70 text-sm">{user?.email}</p>
            <p className="text-pink-300/60 text-xs mt-1 uppercase tracking-wide font-medium">
              Rôle: {user?.role}
            </p>
          </div>
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Prénom */}
          <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-4">
            <label className="text-xs font-serif font-semibold text-pink-200 uppercase tracking-wide block mb-2">
              Prénom
            </label>
            <p className="text-white text-lg font-medium">{user?.firstName}</p>
          </div>

          {/* Nom */}
          <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-4">
            <label className="text-xs font-serif font-semibold text-pink-200 uppercase tracking-wide block mb-2">
              Nom de Famille
            </label>
            <p className="text-white text-lg font-medium">{user?.lastName}</p>
          </div>

          {/* Email */}
          <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-4 md:col-span-2">
            <label className="text-xs font-serif font-semibold text-pink-200 uppercase tracking-wide block mb-2">
              Adresse Email
            </label>
            <p className="text-white text-lg font-medium">{user?.email}</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-t border-pink-400/20 pt-8">
          <h3 className="text-sm font-serif font-semibold text-pink-200 mb-4 uppercase tracking-wide">
            Statistiques de Lecture
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-400/20">
              <p className="text-2xl font-bold text-pink-300">0</p>
              <p className="text-xs text-pink-200/60 mt-1">Histoires Lues</p>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-400/20">
              <p className="text-2xl font-bold text-pink-300">0</p>
              <p className="text-xs text-pink-200/60 mt-1">Favoris</p>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-400/20">
              <p className="text-2xl font-bold text-pink-300">0</p>
              <p className="text-xs text-pink-200/60 mt-1">Pages Lues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notice Section */}
      <div className="bg-purple-500/20 border border-purple-400/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="text-sm font-serif font-semibold text-pink-200 mb-1">Paramètres Avancés</h4>
            <p className="text-sm text-pink-200/70">
              Les paramètres avancés de profil (modification du mot de passe, préférences de notification, etc.) seront disponibles dans une prochaine mise à jour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
