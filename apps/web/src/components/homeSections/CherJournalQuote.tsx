import type { Chapter } from "../../stores/catalogStore";

interface CherJournalQuoteProps {
  chapters: Chapter[];
}

export default function CherJournalQuote({ chapters }: CherJournalQuoteProps) {


const quotes = [{
  text :"La passion n'est pas une émotion qui se vit, c'est une atmosphère qui se respire, un parfum qui s'imprègne sur la peau et dans l'âme."  , 
  author: ""
}, 
{
  text :"L'érotisme est l'approbation de la vie jusque dans la mort. C'est le moment où la peau devient le seul langage que l'on accepte de parler.", 
  author : "Éléonore de Valmont"
}]

  return (
    <section className="py-20 md:py-24 bg-white border-slate-200 dark:bg-white/5 dark:border-white/10 border-y">
      <div className="max-w-3xl mx-auto px-6 text-center">
        {/* Script Title */}
        <h4 className="text-4xl md:text-5xl text-gold mb-8 handwriting">
          Cher Journal...
        </h4>

        {/* Quote */}
        <p className="italic text-xl md:text-3xl text-slate-500 dark:text-white/70 leading-relaxed mb-8 Newsreader">
          "La passion n'est pas une émotion qui se vit, c'est une atmosphère
          qui se respire, un parfum qui s'imprègne sur la peau et dans l'âme."
        </p>

        {/* Attribution */}
        <div className="flex items-center justify-center gap-4">
          <span className="w-12 h-px bg-boudoir-700"></span>
          <p className="text-xs uppercase tracking-[0.3em] text-charcoal dark:text-white/70">
            Secrets de Boudoir
          </p>
          <span className="w-12 h-px bg-boudoir-700"></span>
        </div>
      </div>
    </section>
  );
}
