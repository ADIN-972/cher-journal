import type { Chapter } from "../../stores/catalogStore";

interface WomenOfCherJournalQuoteProps {
  chapters: Chapter[];
}

export default function WomenOfCherJournalQuote({
  chapters,
}: WomenOfCherJournalQuoteProps) {
  return (
    <section className="py-20 md:py-24 bg-white border-slate-200 dark:bg-white/5 dark:border-white/10 border-y">
      <div className="max-w-3xl mx-auto px-6">
        {/* Script Title */}
        <h4 className="text-4xl md:text-5xl text-gold mb-8 handwriting">
          Les Femmes de Cher Journal...
        </h4>

        {/* Quote */}
        <p className="italic text-xl md:text-3xl text-slate-500 dark:text-white/70 leading-relaxed mb-8 Newsreader">
          "Une collection de récits intimes et sensoriels."
        </p>

        <p className="text-lg text-slate-500 dark:text-white/70 leading-relaxed mb-8 Newsreader">
          Cher Journal est une série de récits écrits à la première personne,
          où chaque femme incarne une rencontre singulière, un territoire
          émotionnel et charnel, un moment de bascule.
        </p>

        <p className="text-lg text-slate-500 dark:text-white/70 leading-relaxed mb-8 Newsreader">
          Ces histoires ne racontent pas des conquêtes, elles racontent des
          liens.
        </p>

        <p className="text-lg text-slate-500 dark:text-white/70 leading-relaxed mb-8 Newsreader">
          Chaque protagoniste donne naissance à un cycle de volumes, des
          instants suspendus, vécus dans des lieux précis, chargés de tension,
          de désir, de silences et de choix.
        </p>

        <p className="text-lg text-slate-500 dark:text-white/70 leading-relaxed mb-8 Newsreader">
          Certaines histoires s'éteignent doucement... D'autres transforment à
          jamais.
          <br />
          Ici, l'érotisme n'est jamais gratuit. Il est sensoriel,
          introspectif, guidé par l'écoute et la présence.
        </p>

        {/* Quote */}
        <p className="italic text-xl md:text-3xl text-slate-500 dark:text-white/70 leading-relaxed mb-8 Newsreader">
          "Une galerie de femmes, libres et complexes."
        </p>

        <p className="text-lg text-slate-500 dark:text-white/70 leading-relaxed mb-8 Newsreader">
          Les femmes de Cher Journal ne sont ni idéalisées, ni soumises à un
          archétype unique. <br />
          Elles sont multiples, parfois contradictoires, toujours incarnées.{" "}
          <br /> <br />
          Certaines cherchent la douceur, d'autres explorent la domination,
          l'abandon, la réappropriation du corps.
          <br />
          Toutes refusent d'être réduites à un rôle. Chaque récit est raconté
          dans un journal intime, où le narrateur, homme attentif, dominant
          mais profondément à l'écoute, accompagne sans jamais effacer, guide
          sans jamais posséder.
        </p>

        {/* Attribution */}
        <div className="flex items-center justify-center gap-4">
          <span className="w-12 h-px bg-boudoir-700"></span>
          <p className="text-xs uppercase tracking-[0.3em] text-charcoal dark:text-white/70">
            Stéphane A.
          </p>
          <span className="w-12 h-px bg-boudoir-700"></span>
        </div>
      </div>
    </section>
  );
}
