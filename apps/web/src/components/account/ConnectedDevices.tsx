import { useState } from 'react';

interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function ConnectedDevices() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Windows PC',
      type: 'desktop',
      browser: 'Chrome 120',
      location: 'Paris, France',
      lastActive: '2024-01-15T10:00:00Z',
      isCurrent: true,
    },
    {
      id: '2',
      name: 'iPhone 13',
      type: 'mobile',
      browser: 'Safari iOS',
      location: 'Paris, France',
      lastActive: '2024-01-14T18:30:00Z',
      isCurrent: false,
    },
    {
      id: '3',
      name: 'iPad Pro',
      type: 'tablet',
      browser: 'Safari iPadOS',
      location: 'Lyon, France',
      lastActive: '2024-01-10T14:20:00Z',
      isCurrent: false,
    },
  ]);

  const getDeviceIcon = (type: Device['type']) => {
    const icons = {
      desktop: 'computer',
      mobile: 'smartphone',
      tablet: 'tablet',
    };
    return icons[type];
  };

  const handleRevokeDevice = (deviceId: string) => {
    if (confirm('Êtes-vous sûr de vouloir déconnecter cet appareil ?')) {
      setDevices(devices.filter((d) => d.id !== deviceId));
    }
  };

  const formatLastActive = (date: string) => {
    const now = new Date();
    const deviceDate = new Date(date);
    const diffMs = now.getTime() - deviceDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  };

  return (
    <div>
      <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
        Appareils Connectés
      </h2>
      <p className="text-charcoal dark:text-white/70 mb-8">
        Gérez les appareils ayant accès à votre compte.
      </p>

      {/* Security Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
            info
          </span>
          <div>
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
              Conseil de sécurité
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              Si vous ne reconnaissez pas un appareil, déconnectez-le immédiatement et
              changez votre mot de passe.
            </p>
          </div>
        </div>
      </div>

      {/* Devices List */}
      <div className="space-y-4">
        {devices.map((device) => (
          <div
            key={device.id}
            className={`bg-white dark:bg-[#2d1620]/60 rounded-2xl border p-6 ${
              device.isCurrent
                ? 'border-[#c5a059]'
                : 'border-boudoir-300 dark:border-boudoir-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`p-3 rounded-xl ${
                    device.isCurrent
                      ? 'bg-[#c5a059]/10'
                      : 'bg-boudoir-100 dark:bg-boudoir-900'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      device.isCurrent
                        ? 'text-[#c5a059]'
                        : 'text-charcoal dark:text-white/70'
                    }`}
                  >
                    {getDeviceIcon(device.type)}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-display italic text-charcoal dark:text-white">
                      {device.name}
                    </h3>
                    {device.isCurrent && (
                      <span className="text-xs bg-[#c5a059] text-white px-2 py-0.5 rounded-full">
                        Actuel
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-charcoal dark:text-white/70">
                      <span className="material-symbols-outlined text-base">
                        web
                      </span>
                      {device.browser}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-charcoal dark:text-white/70">
                      <span className="material-symbols-outlined text-base">
                        location_on
                      </span>
                      {device.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-charcoal dark:text-white/70">
                      <span className="material-symbols-outlined text-base">
                        schedule
                      </span>
                      {formatLastActive(device.lastActive)}
                    </div>
                  </div>
                </div>
              </div>

              {!device.isCurrent && (
                <button
                  onClick={() => handleRevokeDevice(device.id)}
                  className="ml-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Revoke All Button */}
      <button className="w-full mt-6 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 py-3 rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-red-200 dark:hover:bg-red-900/50 transition-all">
        Déconnecter tous les autres appareils
      </button>
    </div>
  );
}
