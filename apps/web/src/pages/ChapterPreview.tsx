// apps/web/src/pages/ChapterPreview.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../stores/authStore";

interface PreviewData {
  id: string;
  title: string;
  description: string;
  protagonistName: string;
  coverAsset?: { url: string };
  volumeCount: number;
  volumes: Array<{ volumeNumber: number; title: string }>;
  genres: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}

export default function ChapterPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && id) {
      navigate(`/chapters/${id}`, { replace: true });
    }
  }, [isAuthenticated, id, navigate]);

  // Fetch preview data
  useEffect(() => {
    if (!id) return;

    const fetchPreview = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/chapters/${id}/preview`);
        if (response.success && response.data) {
          setPreview(response.data);
          // Update page title
          document.title = `${response.data.title} - Cher Journal`;
          // Update meta tags for SEO
          updateMetaTags(response.data);
        } else {
          setError("Chapter not found");
        }
      } catch (err) {
        setError("Failed to load chapter preview");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [id]);

  // Helper function to update meta tags
  const updateMetaTags = (data: PreviewData) => {
    const coverImageUrl = data.coverAsset?.url
      ? `${import.meta.env.VITE_API_URL ?? ""}${data.coverAsset.url}`
      : null;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", data.description);

    // Update og:title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", data.title);

    // Update og:description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute("content", data.description);

    // Update og:image
    if (coverImageUrl) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute("content", coverImageUrl);
    }

    // Update og:type
    let ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
      ogType = document.createElement("meta");
      ogType.setAttribute("property", "og:type");
      document.head.appendChild(ogType);
    }
    ogType.setAttribute("content", "book");

    // Add JSON-LD structured data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Book",
      name: data.title,
      description: data.description,
      image: coverImageUrl,
      genre: data.genres,
      author: {
        "@type": "Person",
        name: data.protagonistName,
      },
      hasPart: data.volumes.map((vol) => ({
        "@type": "CreativeWork",
        name: `Volume ${vol.volumeNumber}: ${vol.title}`,
        position: vol.volumeNumber,
      })),
    };

    let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.setAttribute("type", "application/ld+json");
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(jsonLd);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-charcoal dark:text-white/70 font-light">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link
          to="/catalogue"
          className="text-primary hover:underline mb-4 inline-block">
          ← Retour au catalogue
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">
            Erreur
          </h1>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {error || "Ce chapitre est introuvable."}
          </p>
          <Link
            to="/catalogue"
            className="text-primary hover:underline font-medium">
            Retourner au catalogue →
          </Link>
        </div>
      </div>
    );
  }

  const coverImageUrl = preview.coverAsset?.url
    ? `${import.meta.env.VITE_API_URL ?? ""}${preview.coverAsset.url}`
    : null;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link className="hover:text-primary transition-colors" to="/">
            Accueil
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <Link
            className="hover:text-primary transition-colors"
            to="/catalogue">
            Catalogue
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <span className="text-gray-900 dark:text-gray-100">
            {preview.title}
          </span>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Cover Image */}
          <div className="md:col-span-1">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={preview.title}
                className="w-full rounded-lg shadow-lg object-cover"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-gray-400">
                  auto_stories
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-charcoal dark:text-white mb-2">
              {preview.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 italic">
              par {preview.protagonistName}
            </p>

            {preview.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {preview.genres.map((genre) => (
                  <span
                    key={genre}
                    className="inline-block bg-primary/10 text-primary dark:bg-primary/20 px-3 py-1 rounded-full text-sm">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              {preview.description}
            </p>

            {/* CTA Button */}
            <Link
              to="/login"
              className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              Se connecter pour lire
            </Link>

            {/* Volume Count */}
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-charcoal dark:text-white">
                  {preview.volumeCount} volumes
                </span>{" "}
                disponibles dans ce chapitre
              </p>
            </div>
          </div>
        </div>

        {/* Volumes List */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-charcoal dark:text-white mb-6">
            Volumes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preview.volumes.map((volume) => (
              <div
                key={volume.volumeNumber}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vol {volume.volumeNumber}
                </p>
                <p className="text-lg font-semibold text-charcoal dark:text-white">
                  {volume.title}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-charcoal dark:text-white mb-3">
            Prêt à commencer votre lecture?
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Créez un compte ou connectez-vous pour accéder à tous les volumes
            de ce chapitre.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/login"
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Se connecter
            </Link>
            <Link
              to="/signup"
              className="border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-2 px-6 rounded-lg transition-colors">
              Créer un compte
            </Link>
          </div>
        </section>
      </main>
    );
}
