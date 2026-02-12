interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'page' | 'inline';
}

export default function ErrorMessage({
  title = 'Une erreur est survenue',
  message,
  onRetry,
  variant = 'page'
}: ErrorMessageProps) {
  if (variant === 'inline') {
    return (
      <div className="bg-parchment dark:bg-background-dark/40 border border-gold/20 dark:border-gold/10 rounded-lg p-6 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 dark:bg-gold/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-gold/80 dark:text-gold/60 text-xl">
              info
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-serif font-semibold text-charcoal dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-charcoal/70 dark:text-white/60 leading-relaxed">{message}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 dark:bg-gold/5 dark:hover:bg-gold/10 text-gold-dark dark:text-gold border border-gold/30 dark:border-gold/20 rounded-lg transition-all font-medium text-sm">
                <span className="material-symbols-outlined text-base">
                  refresh
                </span>
                Réessayer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Page variant - centered, elegant
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-parchment dark:bg-background-dark/60 border border-gold/20 dark:border-gold/10 rounded-2xl p-10 text-center shadow-2xl backdrop-blur-sm">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/10 dark:bg-gold/5">
            <span className="material-symbols-outlined text-6xl text-gold/80 dark:text-gold/60">
              sentiment_dissatisfied
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold mb-4 text-charcoal dark:text-white">
            {title}
          </h2>
          <p className="text-charcoal/70 dark:text-white/60 mb-8 leading-relaxed">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gold hover:bg-gold-dark text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl">
              <span className="material-symbols-outlined">
                refresh
              </span>
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
