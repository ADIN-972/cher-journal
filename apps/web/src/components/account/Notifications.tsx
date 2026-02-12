import { useState } from 'react';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  icon: string;
}

export default function Notifications() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'new-chapters',
      label: 'Nouveaux chapitres',
      description: 'Recevez une notification pour les nouvelles publications',
      email: true,
      push: true,
      icon: 'auto_stories',
    },
    {
      id: 'promotions',
      label: 'Promotions et offres',
      description: 'Restez informé des offres spéciales et réductions',
      email: true,
      push: false,
      icon: 'sell',
    },
    {
      id: 'reviews',
      label: 'Réponses aux avis',
      description: 'Notifications lorsque quelqu\'un répond à vos avis',
      email: false,
      push: true,
      icon: 'rate_review',
    },
    {
      id: 'newsletter',
      label: 'Newsletter',
      description: 'Recevez notre newsletter hebdomadaire',
      email: true,
      push: false,
      icon: 'mail',
    },
  ]);

  const toggleEmail = (id: string) => {
    setSettings(
      settings.map((s) => (s.id === id ? { ...s, email: !s.email } : s))
    );
  };

  const togglePush = (id: string) => {
    setSettings(
      settings.map((s) => (s.id === id ? { ...s, push: !s.push } : s))
    );
  };

  return (
    <div>
      <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
        Notifications
      </h2>
      <p className="text-charcoal dark:text-white/70 mb-8">
        Gérez vos préférences de notifications.
      </p>

      <div className="space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-200 dark:border-[#c5a059]/30 p-6"
          >
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#c5a059] text-2xl mt-1">
                {setting.icon}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-display italic text-charcoal dark:text-white mb-1">
                  {setting.label}
                </h3>
                <p className="text-sm text-charcoal dark:text-white/70 mb-4">
                  {setting.description}
                </p>

                <div className="flex gap-6">
                  {/* Email Toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleEmail(setting.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.email ? 'bg-[#c5a059]' : 'bg-boudoir-300 dark:bg-boudoir-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-charcoal dark:text-white/70">
                        mail
                      </span>
                      <span className="text-sm text-charcoal dark:text-white">
                        Email
                      </span>
                    </div>
                  </div>

                  {/* Push Toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePush(setting.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.push ? 'bg-[#c5a059]' : 'bg-boudoir-300 dark:bg-boudoir-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-charcoal dark:text-white/70">
                        notifications
                      </span>
                      <span className="text-sm text-charcoal dark:text-white">
                        Push
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Frequency */}
      <div className="mt-6 bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-200 dark:border-[#c5a059]/30 p-6">
        <h3 className="text-lg font-display italic text-charcoal dark:text-white mb-4">
          Fréquence des notifications
        </h3>
        <div className="space-y-2">
          {['Immédiatement', 'Une fois par jour', 'Une fois par semaine'].map(
            (option) => (
              <label
                key={option}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-boudoir-100/50 dark:hover:bg-boudoir-900/30 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="frequency"
                  className="w-4 h-4 text-[#c5a059] focus:ring-[#c5a059]"
                  defaultChecked={option === 'Immédiatement'}
                />
                <span className="text-charcoal dark:text-white">{option}</span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full mt-6 bg-[#c5a059] hover:bg-[#b8935a] text-white py-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-all">
        Sauvegarder
      </button>
    </div>
  );
}
