import { NavLink, Outlet } from "react-router-dom";
import { MdSchema, MdBook, MdHistory } from "react-icons/md";

export default function PricingLayout() {
  const tabs = [
    {
      path: "/pricing/schemas",
      label: "Schémas de prix",
      icon: MdSchema,
      description: "Gérer les modèles de tarification par défaut",
    },
    {
      path: "/pricing/chapters",
      label: "Prix par chapitre",
      icon: MdBook,
      description: "Exceptions de prix pour des chapitres spécifiques",
    },
    {
      path: "/pricing/history",
      label: "Historique",
      icon: MdHistory,
      description: "Audit des changements de prix",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Gestion de la Tarification
          </h1>
          <p className="text-gray-600 mb-3">
            Système V2 : Gestion centralisée des prix avec historique complet
          </p>

          {/* Guide rapide */}
          <div className="bg-white border border-indigo-200 rounded-lg p-4 text-sm">
            <h3 className="font-semibold text-indigo-900 mb-2">
              🎯 Guide rapide
            </h3>
            <div className="grid grid-cols-3 gap-4 text-gray-700">
              <div>
                <strong className="text-indigo-600">1. Schémas</strong>
                <p className="text-xs mt-1">
                  Créez un modèle de prix par défaut et activez-le
                </p>
              </div>
              <div>
                <strong className="text-indigo-600">2. Exceptions</strong>
                <p className="text-xs mt-1">
                  Définissez des prix spéciaux pour certains chapitres
                </p>
              </div>
              <div>
                <strong className="text-indigo-600">3. Historique</strong>
                <p className="text-xs mt-1">
                  Consultez tous les changements avec traçabilité complète
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex-1 px-6 py-4 flex items-center justify-center gap-3 transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-b-4 border-purple-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }>
                {({ isActive }) => (
                  <>
                    <tab.icon
                      className={`text-2xl ${isActive ? "animate-pulse" : ""}`}
                    />
                    <div className="text-left">
                      <div className="font-semibold">{tab.label}</div>
                      <div
                        className={`text-xs ${isActive ? "text-purple-100" : "text-gray-500"}`}>
                        {tab.description}
                      </div>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <Outlet />
      </div>
    </div>
  );
}
