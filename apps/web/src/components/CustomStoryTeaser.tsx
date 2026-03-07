import React from "react";
import { useNavigate } from "react-router-dom";
import ChapterCover from "./common/ChapterCover";

export default function CustomStoryTeaser() {
  const navigate = useNavigate();

  const teasers = [
  {
    description: `"Entre ces pages, le temps s'arrête. Plongez dans l'intimité de vos pensées et laissez la magie de vos mots dessiner l'invisible."`,
    buttonTitle: "Commencer l'aventure",
  },
  {
    description:
      "Rendez immortelle chaque émotion. Laissez ce journal être le sanctuaire où vos vérités les plus profondes prennent forme.",
      buttonTitle: "Créer ma légende",
  },
  {
    description:
      "Déverrouillez les portes de votre monde intérieur. Chaque ligne tracée est un pas vers la découverte de soi et l'accomplissement.",
      buttonTitle: "Explorer l'infini",
  },
  {
    description: "Dans le silence de ces pages, trouvez le réconfort. Un espace sacré pour apaiser l'âme et éclairer le chemin.",
    buttonTitle: "Ouvrir ce sanctuaire",
  },
];
  const teaser = teasers[Math.floor(Math.random() * teasers.length)];

  return (
    <section className="relative py-16 px-8 overflow-hidden">
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-gold/60"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-gold/60"></div>
        <div className="max-w-[1280px] mx-auto px-8 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="max-w-2xl space-y-8">
            <h3 className="text-3xl md:text-4xl font-display italic text-stone-700 dark:text-stone-100 newsreader">
              Créez votre{" "}
              <span className="handwriting text-6xl text-gold">destin</span>
            </h3>
            <p className="handwriting text-xl md:text-2xl text-primary-caramel !-mt-1">
              Chaque secret mérite d'être écrit...
            </p>
            <div className="space-y-6 text-lg text-charcoal/80 dark:text-white/70 font-light leading-relaxed">
              <p className="italic text-xl md:text-2xl text-charcoal dark:text-white/70 leading-relaxed mb-8 newsreader">
               {teaser.description}
              </p>
              <p>
                Vous avez une histoire sensuelle à partager ? Une protagoniste
                qui vous hante ? Des rêves secrets à explorer ?
              </p>
              <p className="italic">
                Proposez-nous les éléments de{" "}
                <span className="font-medium">votre</span> histoire
                personnalisée :
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-soft-gold text-base">
                    star
                  </span>
                  <span>Le nom et l'apparence de votre protagoniste</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-soft-gold text-base">
                    star
                  </span>
                  <span>Sa personnalité, ses désirs et ses secrets</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-soft-gold text-base">
                    star
                  </span>
                  <span>L'intensité émotionnelle de son univers</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-soft-gold text-base">
                    star
                  </span>
                  <span>Les lieux et événements clés des 10 volumes</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-soft-gold text-base">
                    star
                  </span>
                  <span>Comment vous imaginez la fin</span>
                </li>
              </ul>
              <p className="text-sm italic text-accent-prune font-medium pt-4">
                Les histoires approuvées seront créées gratuitement pour vous.
                Vous aurez accès à votre histoire en bundle et en édition
                imprimée.
              </p>
            </div>
            <div className="pt-8">
              <button
                type="button"
                onClick={() => navigate("/create-story")}
                className="bg-brand-prune hover:bg-[#2d1620] text-soft-gold border border-gold/30 px-12 py-4 rounded-xl font-bold tracking-wider uppercase text-sm shadow-xl transition-all transform hover:-translate-y-1">
                {teaser.buttonTitle}
              </button>
            </div>
          </div>
          <div className="relative flex-shrink-0 group">
            <div className="absolute -inset-8 bg-[#c5a059]/10 blur-3xl rounded-full"></div>
            <div className="relative z-10 transform -rotate-2 group-hover:rotate-0 transition-transform duration-700">
              <ChapterCover
                imageUrl={"/assets/images/anonyme_cover.png"}
                title={"Titre de l'histoire"}
                showPremiumBadge={false}
                showLimitedEditionBadge={false}
                // hasGrayscaleEffect={true}
                textSize="auto"
                showTitleOverlay={true}
                //showBookmarkIcon={hasStartedReading}
                // showFavoriteIcon={isFavorite}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }
