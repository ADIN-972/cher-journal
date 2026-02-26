import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Chapter } from "../../stores/catalogStore";

interface ColoringPage {
  id: string;
  title: string;
  pageNumber: number;
  imageUrl: string;
  thumbnailUrl?: string;
  isAvailable: boolean;
  tags: string[];
}

interface ColoringGalleryProps {
  chapter: Chapter;
}

// Ensure Material Symbols are loaded
if (
  typeof document !== "undefined" &&
  !document.querySelector('link[href*="material-symbols"]')
) {
  const link = document.createElement("link");
  link.href =
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-200..200";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

export default function ColoringGallery({ chapter }: ColoringGalleryProps) {
  const [coloringPages, setColoringPages] = useState<ColoringPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColoringPages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Récupérer les assets du chapitre avec filtre pour 'coloring' tag
        const response = await api.get(`/chapters/${chapter.id}/assets?tag=coloring`);

        if (response.success && response.data) {
          const pages: ColoringPage[] = response.data.map((asset: any, index: number) => ({
            id: asset.id,
            title: asset.label || `Illustration ${index + 1}`,
            pageNumber: index + 1,
            imageUrl: asset.url,
            thumbnailUrl: asset.thumbnailUrl || asset.url,
            isAvailable: true,
            tags: asset.tags || [],
          }));
          setColoringPages(pages);
        }
      } catch (err) {
        console.error("Failed to fetch coloring pages:", err);
        setError("Impossible de charger les pages de coloriage");
        // Garder les pages vides pour afficher le placeholder
      } finally {
        setIsLoading(false);
      }
    };

    if (chapter?.id) {
      fetchColoringPages();
    }
  }, [chapter?.id]);

  return (
    <div className="relative z-10 w-full max-w-7xl px-6 py-12 flex flex-col gap-12">
      {/* <!-- Hero Section --> */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl newsreader">
          <h1 className="font-display font-light text-6xl md:text-8xl  text-slate-900 dark:text-slate-100 leading-tight mb-6">
            Livre de <span className="text-primary italic">Coloriage</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-400 font-display leading-relaxed">
            Plongez dans l'intimité de nos créations. Des designs exclusifs
            façonnés avec soin pour sublimer chaque chapitre de votre expérience
            Boudoir Moderne.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-bold tracking-wider uppercase text-sm shadow-xl shadow-primary/20 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined">auto_awesome</span>
            Débloquer l'accès complet
          </button>
        </div>
      </div>
      {/* <!-- Features Highlights --> */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4">
          <div className="size-12 rounded-lg bg-primary/5 dark:bg-primary/20 flex items-center justify-center text-red-600 dark:text-primary">
            <span className="material-symbols-outlined text-2xl">palette</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-xs tracking-widest">
              Designs Exclusifs
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-400">
              Illustrations haute couture
            </p>
          </div>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4">
          <div className="size-12 rounded-lg bg-amber-900/5 dark:bg-amber-900/40 flex items-center justify-center text-amber-500 dark:text-amber-500">
            <span className="material-symbols-outlined text-2xl">
              cloud_download
            </span>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-xs tracking-widest">
              Téléchargement Premium
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-400">
              Qualité 4K prête à imprimer
            </p>
          </div>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4">
          <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-400">
            <span className="material-symbols-outlined text-2xl">
              collections
            </span>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-xs tracking-widest">
              Galerie Personnelle
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-400">
              Sauvegardez vos chefs-d'œuvre
            </p>
          </div>
        </div>
      </div>
      {/* <!-- Main Gallery Card --> */}
      <GalleryCard chapter={chapter} pages={coloringPages} isLoading={isLoading} error={error} />
    </div>
  );
}

export function ColoringPageCard({ page }: { page: ColoringPage }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-primary/20 hover:border-primary/60 bg-slate-100 dark:bg-slate-900 transition-all cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <img
        src={page.thumbnailUrl || page.imageUrl}
        alt={page.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Overlay with info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
        <p className="text-xs uppercase tracking-tighter text-slate-300 mb-1">
          Page {page.pageNumber}
        </p>
        <p className="text-sm font-display italic text-white">{page.title}</p>
      </div>

      {/* Download button on hover */}
      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <span className="material-symbols-outlined text-lg">cloud_download</span>
            Télécharger
          </button>
        </div>
      )}
    </div>
  );
}

export function LockedCard({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-slate-100/50 dark:bg-slate-900/50 hover:border-primary/40 transition-all">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
        <p className="text-xs uppercase tracking-tighter text-slate-400">
          {title}
        </p>
        <p className="text-sm font-display italic text-white">{description}</p>
      </div>
      <div className="w-full h-full flex items-center justify-center opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all">
        <span className="material-symbols-outlined text-6xl">lock</span>
      </div>
    </div>
  );
}

export function GalleryCard({
  chapter,
  pages,
  isLoading,
  error,
}: {
  chapter: Chapter;
  pages: ColoringPage[];
  isLoading: boolean;
  error: string | null;
}) {
  const hasPages = pages && pages.length > 0;

  return (
    <section className="relative rounded-xl overflow-hidden border border-primary/20 dark:bg-background-dark/40 backdrop-blur-xl shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-amber-900/5 pointer-events-none"></div>
      <div className="px-8 py-10 flex flex-col gap-10">
        <div className="flex items-center justify-between border-b border-black/35 dark:border-white/5 pb-6">
          <h3 className="text-2xl font-display italic text-slate-900 dark:text-slate-200 newsreader">
            Collection : {chapter.protagonistName}
          </h3>
          {!hasPages && (
            <div className="flex items-center gap-2 text-primary/80">
              <span className="text-xs font-bold uppercase tracking-widest">
                Bientôt disponible
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </div>
          )}
        </div>

        {/* Affichage conditionnel */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin mb-4">
                <span className="material-symbols-outlined text-5xl text-primary">
                  palette
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Chargement des créations...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-red-500 mb-4 block">
                error
              </span>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        ) : hasPages ? (
          // Afficher les images de coloriage réelles
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pages.map((page) => (
              <ColoringPageCard key={page.id} page={page} />
            ))}
            {/* Ajouter une carte "en cours" si moins de 4 pages */}
            {pages.length < 4 && <InProgressCard />}
          </div>
        ) : (
          // Afficher le placeholder si aucune image
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <LockedCard
              title="Illustrations No. 01"
              description="Éveil des Sens"
            />
            <LockedCard
              title="Illustrations No. 02"
              description="Ombre et Lumière"
            />
            <LockedCard
              title="Illustrations No. 03"
              description="Détails de Soie"
            />
            <InProgressCard />
          </div>
        )}
      </div>
    </section>
  );
}

export function InProgressCard() {
  return (
    <div className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-primary/30 bg-primary/5 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-30 animate-pulse"></div>
      <div className="relative z-10 flex flex-col items-center gap-2 p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-primary/60">
          hourglass_empty
        </span>
        <h5 className="text-sm font-bold uppercase tracking-widest text-primary">
          Nouveau Design
        </h5>
        <p className="text-[10px] text-slate-400 italic">
          En cours de création par nos artistes
        </p>
      </div>
    </div>
  );
}
