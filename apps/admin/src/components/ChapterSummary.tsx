import type { Chapter } from "@cher-journal/types";
import { getImageUrl } from "../lib/imageUtils";
import { useI18n } from "../lib/i18n";

interface ChapterSummaryProps {
  chapter: Chapter;
  onEditCover?: () => void;
  onAddChapter?: () => void;
  onPreview?: () => void;
}

export default function ChapterSummary({
  chapter,
  onEditCover,
  onAddChapter,
  onPreview,
}: ChapterSummaryProps) {
  const { t } = useI18n();
  const coverImageUrl = chapter.coverAsset
    ? getImageUrl(chapter.coverAsset)
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuBwD3Uf_xFzfOpOf8PolvO0cBnN_tCAVXsbrogLHwEmWFpHSxMXZd5tl_KTkBjoJpjUndp2Fps69jP1Gs5hfB61vHjzsWgLKeO7yB2C7O78Mztx9pBrAp97NnErQqbvaCVxyP-tVvZUXHvjjkkI9_qMV0IBT2_a4y9gWARfNBjNx_B55AZwdhKjCYJr6fAd_9HHvUqIDg5hoWxTA0C0EGsTZ4TZOl7NPpq1ys2qs9WMHyd33QOD-4Vm7IreLiszSfEPBH_7nu6_C0E";

  const statusColors = {
    PUBLISHED: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    DRAFT: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  };

  const statusLabels = {
    PUBLISHED: "Publié",
    DRAFT: "Brouillon",
    IN_PROGRESS: "En cours",
  };

  const formatDate = (date?: Date | null) => {
    if (!date) return "Non défini";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Il y a 1 jour";
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} semaine${Math.floor(days / 7) > 1 ? 's' : ''}`;
    return `Il y a ${Math.floor(days / 30)} mois`;
  };

  const publishedCount = chapter.stats?.totalVolumes || 0;
  const totalCount = chapter.volumes?.length || 0;

  return (
    <section className=" rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 mb-10">
      <div className="grid grid-cols-[auto_1fr] md:flex-row gap-8 items-start">
        <div className="relative group">
          <div
            className={`aspect-[1/1] w-[200px] overflow-hidden book-binding-effect relative `}>
            <img
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500`}
              alt={chapter.title}
              src={coverImageUrl}
            />
          </div>
          {onEditCover && (
            <button
              onClick={onEditCover}
              className="absolute bottom-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg text-slate-700 dark:text-gray-300 shadow-md hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined text-[20px]">
                edit
              </span>
            </button>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="manrope text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {chapter.title}
              </h1>
              <p className="text-lg text-primary font-medium mt-1">
                Protagoniste : {chapter.protagonistName}
              </p>
            </div>
            <div className="flex gap-3">
              {onAddChapter && (
                <button
                  onClick={onAddChapter}
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                  <span className="material-symbols-outlined">add_circle</span>
                  Ajouter un volume
                </button>
              )}
              {onPreview && (
                <button
                  onClick={onPreview}
                  className="bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-300 font-bold py-2.5 px-4 rounded-lg transition-all border border-slate-200 dark:border-gray-600">
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-y border-slate-100 dark:border-gray-700">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-gray-500 font-bold mb-1">
                Protagoniste
              </p>
              <p className="font-semibold text-slate-700 dark:text-gray-300">
                {chapter.protagonistName}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-gray-500 font-bold mb-1">
                Volumes
              </p>
              <p className="font-semibold text-slate-700 dark:text-gray-300">
                {publishedCount} Publiés / {totalCount} Total
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-gray-500 font-bold mb-1">
                Statut
              </p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[chapter.status]}`}>
                {statusLabels[chapter.status]}
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-gray-500 font-bold mb-1">
                Dernière MAJ
              </p>
              <p className="font-semibold text-slate-700 dark:text-gray-300">
                {formatDate(chapter.publishedAt)}
              </p>
            </div>
          </div>
          {chapter.description && (
            <div className="pt-2">
              <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-gray-500 font-bold mb-2">
                Préface
              </p>
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl italic">
                {chapter.description}
              </p>
            </div>
          )}
          {chapter.genres && chapter.genres.length > 0 && (
            <div className="pt-2">
              <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-gray-500 font-bold mb-2">
                {t("genres.label", "Genres")}
              </p>
              <div className="flex flex-wrap gap-2">
                {chapter.genres.map((genreObj: any) => {
                  const genreKey = genreObj.genre || genreObj;
                  return (
                    <span
                      key={genreKey}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                      {t(`genres.${genreKey}`, genreKey)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          <p className="text-slate-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            Chapitre {chapter.id.slice(0, 8)}
          </p>
        </div>
      </div>
    </section>
  );
}
