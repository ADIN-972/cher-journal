import { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { showSuccessToast } from '../../lib/toastHelper';
import { api } from '../../lib/api';
import MySupportClaims from './MySupportClaims';

type ClaimCategory = 'technical' | 'billing' | 'content' | 'other';

export default function SupportClaims() {
  const toast = useToast();
  const [category, setCategory] = useState<ClaimCategory>('technical');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const categories = [
    { id: 'technical' as ClaimCategory, label: 'Problème Technique', icon: 'bug_report' },
    { id: 'billing' as ClaimCategory, label: 'Facturation', icon: 'receipt' },
    { id: 'content' as ClaimCategory, label: 'Contenu', icon: 'library_books' },
    { id: 'other' as ClaimCategory, label: 'Autre', icon: 'help' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.submitSupportClaim({
        category,
        subject,
        message,
      });
      setSubject('');
      setMessage('');
      setCategory('technical');
      setShowForm(false);
      showSuccessToast(toast, 'SUPPORT_CLAIM_SENT');
    } catch (error) {
      console.error('Failed to submit support claim:', error);
      toast.error('Erreur lors de l\'envoi de votre réclamation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display italic text-[#c5a059] mb-2">
            Support & Réclamations
          </h2>
          <p className="text-charcoal dark:text-white/70">
            Suivi de vos demandes et contact support
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            showForm
              ? 'bg-boudoir-200 dark:bg-boudoir-800 text-charcoal dark:text-white/70'
              : 'bg-[#c5a059] hover:bg-[#b8935a] text-white'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {showForm ? 'close' : 'add'}
          </span>
          {showForm ? 'Annuler' : 'Nouveau ticket'}
        </button>
      </div>

      {/* New Ticket Form — hidden by default */}
      {showForm && (
        <div className="mb-8 bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-300 dark:border-[#c5a059]/30 p-8">
          <h3 className="text-xl font-display italic text-[#c5a059] mb-6">
            Nouvelle demande
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-white mb-3">
                Catégorie
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      category === cat.id
                        ? "border-[#c5a059] bg-[#c5a059]/10"
                        : "border-boudoir-300 dark:border-boudoir-800 hover:border-[#c5a059]/50"
                    }`}>
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
                className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white/70 focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
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
                className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white/70 focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all resize-none"
                placeholder="Décrivez votre problème en détail..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#c5a059] hover:bg-[#b8935a] disabled:bg-boudoir-500 text-white py-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-all disabled:cursor-not-allowed">
                {isSubmitting ? "Envoi en cours..." : "Envoyer"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 text-charcoal dark:text-white/70 text-sm font-medium hover:bg-boudoir-100 dark:hover:bg-boudoir-800 transition-all">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Claims list — always visible */}
      <MySupportClaims />
    </div>
  );
}
