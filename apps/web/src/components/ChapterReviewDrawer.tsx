import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface ChapterReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: {
    chapterId: string;
    chapterTitle: string;
    coverAsset?: {
      objectKey: string;
    };
  } | null;
}

export default function ChapterReviewDrawer({ isOpen, onClose, chapter }: ChapterReviewDrawerProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing review when drawer opens
  useEffect(() => {
    if (isOpen && chapter) {
      loadExistingReview();
    } else {
      // Reset form when drawer closes
      setRating(0);
      setReviewText('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, chapter?.chapterId]);

  const loadExistingReview = async () => {
    if (!chapter) return;

    setIsLoading(true);
    try {
      const existingReview = await api.getUserReview(chapter.chapterId);
      if (existingReview) {
        setRating(existingReview.rating);
        setReviewText(existingReview.reviewText);
      }
    } catch (err: any) {
      // No existing review or error - that's okay, just keep form empty
      console.log('No existing review found');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !chapter) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await api.createOrUpdateReview({
        chapterId: chapter.chapterId,
        rating,
        reviewText,
      });

      setSuccess(true);

      // Close drawer after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de votre impression');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl  bg-parchment dark:bg-background-dark shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              {chapter.coverAsset?.objectKey && (
                <div className="w-16 h-24 rounded-lg overflow-hidden shadow-lg border border-[#c5a059]/20">
                  <img
                    src={`${import.meta.env.VITE_API_URL ?? ""}/uploads/${chapter.coverAsset.objectKey}`}
                    alt={chapter.chapterTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-display italic text-[#c5a059] font-bold mb-1">
                  Mes Impressions
                </h2>
                <p className="text-charcoal dark:text-white/70 text-sm">
                  {chapter.chapterTitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-charcoal dark:text-white/70 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="dark:bg-white/5 rounded-2xl border border-[#c5a059]/30 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="relative z-10">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5a059] mx-auto mb-4"></div>
                    <p className="text-charcoal dark:text-white/70">
                      Chargement...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-[#c5a059]">
                      history_edu
                    </span>
                    <h3 className="text-xl font-display italic text-charcoal dark:text-white font-bold">
                      Confiez vos ressentis
                    </h3>
                  </div>
                  <p className="text-charcoal dark:text-white/70 italic text-sm leading-relaxed mb-6">
                    Vos mots resteront secrets jusqu'à leur validation.
                  </p>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 bg-[#ee2b5b]/10 border border-[#ee2b5b]/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#ee2b5b] text-lg">
                          error
                        </span>
                        <p className="text-[#ee2b5b] text-sm flex-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="mb-6 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#c5a059] text-lg">
                          check_circle
                        </span>
                        <div className="flex-1">
                          <p className="text-[#c5a059] text-sm font-bold">
                            Votre impression a été confiée avec succès !
                          </p>
                          <p className="text-charcoal dark:text-white/60 text-xs mt-1">
                            Elle sera visible après validation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex flex-col gap-3 mb-8">
                    <label className="text-xs uppercase tracking-widest text-[#c5a059]/60 font-bold">
                      Note de lecture
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition-transform hover:scale-110">
                          <span
                            className={`material-symbols-outlined text-3xl ${
                              star <= (hoveredRating || rating)
                                ? "text-[#c5a059] fill-1"
                                : "text-[#c5a059]/30"
                            }`}>
                            star
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4">
                    <div className="relative">
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full bg-white dark:bg-[#1a0f14]/50 border border-[#c5a059]/20 rounded-xl p-6 text-charcoal dark:text-white font-display italic focus:ring-1 focus:ring-[#c5a059]/50 focus:border-[#c5a059]/50 placeholder:text-white/20 dark:placeholder:text-white/20min-h-[200px] resize-none"
                        placeholder="Qu'avez-vous ressenti au fil des pages ?"
                      />
                      <div className="absolute bottom-4 right-6 flex items-center gap-2">
                        <span className="text-[10px] text-[#c5a059]/40 uppercase tracking-tighter">
                          Votre plume est libre...
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c5a059]/5 border border-[#c5a059]/10">
                        <span className="material-symbols-outlined text-sm text-[#c5a059]">
                          visibility_off
                        </span>
                        <span className="text-[10px] text-charcoal dark:text-white/60 font-bold uppercase tracking-widest">
                          En attente de murmure
                        </span>
                      </div>
                      <button
                        type="submit"
                        className="bg-[#c5a059] text-[#1a0f14] px-8 py-3 rounded-full font-bold uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-white transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={
                          !rating ||
                          !reviewText.trim() ||
                          isSubmitting ||
                          success
                        }>
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-[#1a0f14]"></div>
                            Envoi en cours...
                          </>
                        ) : success ? (
                          <>
                            <span className="material-symbols-outlined text-sm">
                              check
                            </span>
                            Envoyé
                          </>
                        ) : (
                          "Confier mon secret"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
