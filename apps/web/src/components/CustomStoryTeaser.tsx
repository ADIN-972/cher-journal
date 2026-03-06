import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomStoryTeaser() {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Left: Text Content */}
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl md:text-5xl font-light text-rose-900 dark:text-rose-100 leading-tight">
              Créer votre histoire
            </h2>

            <p className="text-lg text-rose-800 dark:text-rose-200 font-light leading-relaxed">
              Vous avez une histoire sensuelle à partager? Une protagoniste qui vous hante?
              Des rêves secrets à explorer?
            </p>

            <p className="text-base text-rose-700 dark:text-rose-300 space-y-3">
              Proposez-nous les éléments de <em>votre</em> histoire personnalisée:
            </p>

            <ul className="space-y-2 text-rose-700 dark:text-rose-300">
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1">✨</span>
                <span>Le nom et l'apparence de votre protagoniste</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1">✨</span>
                <span>Sa personnalité, ses désirs et ses secrets</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1">✨</span>
                <span>L'intensité émotionnelle de son univers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1">✨</span>
                <span>Les lieux et événements clés des 10 volumes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1">✨</span>
                <span>Comment vous imaginez la fin</span>
              </li>
            </ul>

            <p className="text-sm text-rose-600 dark:text-rose-400 italic pt-4">
              Les histoires approuvées seront créées gratuitement pour vous.
              Vous aurez accès à votre histoire en bundle et en édition imprimée.
            </p>

            <button
              onClick={() => navigate('/create-story')}
              className="inline-block mt-8 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg">
              Oui, je le veux
            </button>
          </div>

          {/* Right: Visual Element */}
          <div className="flex-1 hidden md:flex items-center justify-center">
            <div className="w-64 h-80 bg-gradient-to-b from-red-300 to-rose-300 dark:from-red-900 dark:to-rose-900 rounded-2xl shadow-2xl backdrop-blur-sm border border-red-200 dark:border-red-800 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">📖</div>
                <p className="text-red-900 dark:text-red-100 font-light text-lg">
                  Votre histoire
                </p>
                <p className="text-red-800 dark:text-red-200 text-sm">
                  attend d'être écrite
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
