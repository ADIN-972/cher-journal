import { useState } from 'react';
import { useToast } from '../../hooks/useToast';

type ClaimCategory = 'technical' | 'billing' | 'content' | 'other';

export default function SupportClaims() {
  const toast = useToast();
  const [category, setCategory] = useState<ClaimCategory>('technical');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'technical' as ClaimCategory, label: 'Problème Technique', icon: 'bug_report' },
    { id: 'billing' as ClaimCategory, label: 'Facturation', icon: 'receipt' },
    { id: 'content' as ClaimCategory, label: 'Contenu', icon: 'library_books' },
    { id: 'other' as ClaimCategory, label: 'Autre', icon: 'help' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Submit to API
    setTimeout(() => {
      setIsSubmitting(false);
      setSubject('');
      setMessage('');
      toast.success('Votre demande a été envoyée avec succès');
    }, 1000);
  };

  return (
    <div>
      <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
        Support & Réclamations
      </h2>
      <p className="text-charcoal dark:text-white/70 mb-8">
        Besoin d'aide ? Contactez notre équipe support.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-white mb-3">
                Catégorie
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      category === cat.id
                        ? 'border-[#c5a059] bg-[#c5a059]/10'
                        : 'border-boudoir-300 dark:border-boudoir-800 hover:border-[#c5a059]/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[#c5a059]">
                      {cat.icon}
                    </span>
                    <span className="text-sm font-medium text-charcoal dark:text-white">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-white mb-2">
                Sujet
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
                placeholder="Décrivez brièvement votre problème..."
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-white mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all resize-none"
                placeholder="Décrivez votre problème en détail..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#c5a059] hover:bg-[#b8935a] disabled:bg-boudoir-500 text-white py-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-all disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </form>
        </div>

        {/* Quick Help */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#2d1620]/60 to-[#2d1620]/40 rounded-2xl border border-[#c5a059]/30 p-6">
            <h3 className="text-lg font-display italic text-[#c5a059] mb-4">
              Aide Rapide
            </h3>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-charcoal dark:text-white/70 hover:text-[#c5a059] transition-colors"
              >
                <span className="material-symbols-outlined text-base">
                  help
                </span>
                FAQ
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-charcoal dark:text-white/70 hover:text-[#c5a059] transition-colors"
              >
                <span className="material-symbols-outlined text-base">
                  mail
                </span>
                support@cherjournal.com
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-charcoal dark:text-white/70 hover:text-[#c5a059] transition-colors"
              >
                <span className="material-symbols-outlined text-base">
                  schedule
                </span>
                Lun-Ven 9h-18h
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
