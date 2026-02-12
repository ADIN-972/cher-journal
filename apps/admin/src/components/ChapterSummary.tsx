import type { Chapter } from "@cher-journal/types";
import { getImageUrl } from "../lib/imageUtils";
import { useI18n, useGenreLabels } from "../lib/i18n";

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
  const { labels: genreLabels } = useGenreLabels();
  const coverImageUrl = chapter.coverAsset
    ? getImageUrl(chapter.coverAsset)
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuBwD3Uf_xFzfOpOf8PolvO0cBnN_tCAVXsbrogLHwEmWFpHSxMXZd5tl_KTkBjoJpjUndp2Fps69jP1Gs5hfB61vHjzsWgLKeO7yB2C7O78Mztx9pBrAp97NnErQqbvaCVxyP-tVvZUXHvjjkkI9_qMV0IBT2_a4y9gWARfNBjNx_B55AZwdhKjCYJr6fAd_9HHvUqIDg5hoWxTA0C0EGsTZ4TZOl7NPpq1ys2qs9WMHyd33QOD-4Vm7IreLiszSfEPBH_7nu6_C0E";

  const statusColors = {
    PUBLISHED:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    DRAFT:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
    IN_PROGRESS:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  };

  const statusLabels = {
    PUBLISHED: t("chapter.status_published"),
    DRAFT: t("chapter.status_draft"),
    IN_PROGRESS: t("chapter.status_in_progress"),
  };

  const formatDate = (date?: Date | null) => {
    if (!date) return "Non défini";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Il y a 1 jour";
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30)
      return `Il y a ${Math.floor(days / 7)} semaine${Math.floor(days / 7) > 1 ? "s" : ""}`;
    return `Il y a ${Math.floor(days / 30)} mois`;
  };

  const publishedCount = chapter.volumes?.filter(v => v.status === "PUBLISHED").length || 0;
  const totalCount = chapter.volumes?.length || 0;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
      {/* Main Info Card */}
      <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col md:flex-row gap-8">
        <div className="relative flex-shrink-0 group">
          <div className="w-[200px] h-[200px] rounded-r-lg overflow-hidden book-binding shadow-2xl relative">
            <img
              alt={chapter.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={coverImageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
          {onEditCover && (
            <button
              type="button"
              onClick={onEditCover}
              className="absolute top-3 right-3 size-10 bg-white dark:bg-zinc-800 shadow-lg rounded-full flex items-center justify-center text-primary border border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="serif-title text-4xl font-bold text-boudoir-purple dark:text-white leading-tight">
                {chapter.title}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-medium text-zinc-500">
                  Protagoniste:{" "}
                  <span className="text-zinc-900 dark:text-zinc-100 italic">
                    {chapter.protagonistName}
                  </span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${statusColors[chapter.status]}`}>
                  {statusLabels[chapter.status]}
                </span>
              </div>
            </div>
            {/* <div className="flex gap-2">
              {onPreview && (
                <button
                  type="button"
                  onClick={onPreview}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                  Aperçu
                </button>
              )}
              {onAddChapter && (
                <button
                  type="button"
                  onClick={onAddChapter}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-opacity">
                  Ajouter volume
                </button>
              )}
            </div> */}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">
                Volumes
              </p>
              <p className="text-xl font-bold text-boudoir-purple dark:text-boudoir-gold leading-none">
                {publishedCount}/{totalCount}{" "}
                <span className="text-xs font-medium text-zinc-400">
                  Publiés
                </span>
              </p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">
                Dernière MAJ
              </p>
              <p className="text-xl font-bold text-boudoir-purple dark:text-boudoir-gold leading-none text-sm">
                {formatDate(chapter.publishedAt)}
              </p>
            </div>
          </div>

          {/* Description */}
          {chapter.description && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mb-1">
                Préface
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 italic line-clamp-3">
                {chapter.description}
              </p>
            </div>
          )}

          {/* Accroches Preview */}
          {/* {((chapter as any)?.accroche_classic ||
            (chapter as any)?.accroche_dark ||
            (chapter as any)?.accroche_love ||
            (chapter as any)?.accroche_marketing ||
            (chapter as any)?.accroche_dark_collection) && (
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mb-2">
                Accroches
              </p>
              <div className="space-y-1.5 text-xs">
                {(chapter as any)?.accroche_classic && (
                  <p className="text-zinc-600 dark:text-zinc-400 italic line-clamp-2">
                    <span className="font-medium text-zinc-500 dark:text-zinc-500">Classique: </span>
                    {(chapter as any).accroche_classic}
                  </p>
                )}
                {(chapter as any)?.accroche_dark && (
                  <p className="text-zinc-600 dark:text-zinc-400 italic line-clamp-2">
                    <span className="font-medium text-zinc-500 dark:text-zinc-500">Sombre: </span>
                    {(chapter as any).accroche_dark}
                  </p>
                )}
                {(chapter as any)?.accroche_love && (
                  <p className="text-zinc-600 dark:text-zinc-400 italic line-clamp-2">
                    <span className="font-medium text-zinc-500 dark:text-zinc-500">Amour: </span>
                    {(chapter as any).accroche_love}
                  </p>
                )}
                {(chapter as any)?.accroche_marketing && (
                  <p className="text-zinc-600 dark:text-zinc-400 italic line-clamp-2">
                    <span className="font-medium text-zinc-500 dark:text-zinc-500">Marketing: </span>
                    {(chapter as any).accroche_marketing}
                  </p>
                )}
                {(chapter as any)?.accroche_dark_collection && (
                  <p className="text-zinc-600 dark:text-zinc-400 italic line-clamp-2">
                    <span className="font-medium text-zinc-500 dark:text-zinc-500">Collection Sombre: </span>
                    {(chapter as any).accroche_dark_collection}
                  </p>
                )}
              </div>
            </div>
          )} */}
        </div>
      </div>

      {/* Story Resonance Card */}
      {((chapter as any)?.niveau_intensite ||
        (chapter as any)?.niveau_douceur ||
        (chapter as any)?.niveau_danger ||
        (chapter as any)?.niveau_transformation) && (
        <div className="lg:col-span-4 bg-boudoir-purple text-white rounded-xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 size-40 bg-boudoir-gold/10 rounded-full blur-3xl"></div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-boudoir-gold mb-6 relative z-10">
            Niveaux Émotionnels
          </h3>
          <div className="space-y-2 relative z-10">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className=" tracking-wider">Intensité</span>
                <span className="text-red-300">
                  {((chapter as any)?.niveau_intensite || 3) * 20}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-500 h-2 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  style={{
                    width: `${((chapter as any)?.niveau_intensite || 3) * 20}%`,
                  }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className=" tracking-wider">Douceur</span>
                <span className="text-pink-300">
                  {((chapter as any)?.niveau_douceur || 3) * 20}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-pink-400 h-2 rounded-full shadow-[0_0_10px_rgba(244,114,182,0.5)]"
                  style={{
                    width: `${((chapter as any)?.niveau_douceur || 3) * 20}%`,
                  }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className=" tracking-wider">Danger</span>
                <span className="text-orange-300">
                  {((chapter as any)?.niveau_danger || 3) * 20}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-orange-500 h-2 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.5)]"
                  style={{
                    width: `${((chapter as any)?.niveau_danger || 3) * 20}%`,
                  }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className=" tracking-wider">Transformation</span>
                <span className="text-purple-300">
                  {((chapter as any)?.niveau_transformation || 3) * 20}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-400 h-2 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  style={{
                    width: `${((chapter as any)?.niveau_transformation || 3) * 20}%`,
                  }}></div>
              </div>
            </div>
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-boudoir-gold my-6 relative z-10">
            Genres
          </h3>
          <div className="">
            
            {/* Genres */}
            {chapter.genres && chapter.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {chapter.genres.map((genreObj: any) => {
                  const genreKey = genreObj.genre || genreObj;
                  return (
                    <span
                      key={genreKey}
                      className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs font-medium">
                      {genreLabels[genreKey] || genreKey}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
