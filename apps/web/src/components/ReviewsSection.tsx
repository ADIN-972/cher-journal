interface Review {
  rating: number;
  text: string;
  author: string;
  initials: string;
}

interface ReviewsSectionProps {
  reviews?: Review[];
  onWriteReview?: () => void;
}

const defaultReviews: Review[] = [
  {
    rating: 5,
    text: "Une écriture d'une finesse rare. On est transporté dès les premières lignes. Le mystère est aussi haletant que les scènes de passion sont sublimes.",
    author: "Élodie L.",
    initials: "EL",
  },
  {
    rating: 4,
    text: "Captivant du début à la fin. Les deux chapitres offerts m'ont immédiatement convaincue de prendre l'intégrale. Une très belle découverte.",
    author: "Julien M.",
    initials: "JM",
  },
  {
    rating: 5,
    text: "Un chef-d'œuvre du genre. L'ambiance du manoir est parfaitement rendue. J'ai dévoré le conte en une seule soirée.",
    author: "Sophie C.",
    initials: "SC",
  },
];

export default function ReviewsSection({
  reviews = defaultReviews,
  onWriteReview,
}: ReviewsSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold italic font-display">
          Paroles de Lecteurs
        </h2>
        {onWriteReview && (
          <button
            onClick={onWriteReview}
            className="text-primary font-bold hover:underline"
          >
            Écrire un avis
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="p-8 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm"
          >
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`material-symbols-outlined text-sm ${
                    i < review.rating ? "gold-fill" : "text-gray-400"
                  }`}
                >
                  star
                </span>
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-300 italic mb-6 leading-relaxed">
              "{review.text}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                {review.initials}
              </div>
              <span className="text-sm font-bold uppercase tracking-wider">
                {review.author}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
