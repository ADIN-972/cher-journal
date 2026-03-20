import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useI18n } from "../lib/i18n";

interface MuseUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface MuseData {
  id: string;
  chapterId: string;
  userId: string;
  customStoryId: string | null;
  promotionId: string | null;
  user: MuseUser;
  customStory: { id: string; protagonistName: string } | null;
  promotion: { id: string; name: string } | null;
}

interface SearchedUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface ChapterMuseSectionProps {
  chapterId: string;
}

export default function ChapterMuseSection({ chapterId }: ChapterMuseSectionProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [muse, setMuse] = useState<MuseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [museNotFound, setMuseNotFound] = useState(false);

  // Assignment form state
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchedUser | null>(null);
  const [searchError, setSearchError] = useState("");
  const [customStoryId, setCustomStoryId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Remove muse state
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    loadMuse();
  }, [chapterId]);

  const loadMuse = async () => {
    setLoading(true);
    setMuseNotFound(false);
    try {
      const response = await api.get(`/admin/chapter-muse/${chapterId}`);
      setMuse(response.data);
    } catch (error: any) {
      if (error.message?.includes("404") || error.message?.includes("MUSE_NOT_FOUND")) {
        setMuseNotFound(true);
        setMuse(null);
      } else {
        console.error("Failed to load muse:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) return;

    setSearching(true);
    setSearchError("");
    setSearchResult(null);

    try {
      const response = await api.get("/admin/users", {
        params: { searchQuery: searchEmail.trim() },
      });

      const users = response.data as SearchedUser[];
      if (users && users.length > 0) {
        // Find exact email match first, otherwise take first result
        const exactMatch = users.find(
          (u: SearchedUser) => u.email.toLowerCase() === searchEmail.trim().toLowerCase()
        );
        setSearchResult(exactMatch || users[0]);
      } else {
        setSearchError("Aucun utilisateur trouve avec cet email");
      }
    } catch (error: any) {
      setSearchError(error.message || "Erreur lors de la recherche");
    } finally {
      setSearching(false);
    }
  };

  const handleAssignMuse = async () => {
    if (!searchResult) return;

    setAssigning(true);
    try {
      const body: { chapterId: string; userId: string; customStoryId?: string } = {
        chapterId,
        userId: searchResult.id,
      };
      if (customStoryId.trim()) {
        body.customStoryId = customStoryId.trim();
      }

      await api.post("/admin/chapter-muse", body);
      toast.success("Muse assignee avec succes");

      // Reset form and reload
      setSearchEmail("");
      setSearchResult(null);
      setCustomStoryId("");
      await loadMuse();
    } catch (error: any) {
      if (error.message?.includes("CHAPTER_ALREADY_HAS_MUSE")) {
        toast.error("Ce chapitre a deja une muse assignee");
      } else {
        toast.error(error.message || "Erreur lors de l'assignation");
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveMuse = async () => {
    if (!window.confirm("Etes-vous sur de vouloir retirer la muse de ce chapitre ?")) {
      return;
    }

    setRemoving(true);
    try {
      await api.delete(`/admin/chapter-muse/${chapterId}`);
      toast.success("Muse retiree avec succes");
      setMuse(null);
      setMuseNotFound(true);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du retrait de la muse");
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow p-6 mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-boudoir-gold">auto_awesome</span>
          Muse du chapitre
        </h3>
        <p className="text-sm text-zinc-400">Chargement...</p>
      </div>
    );
  }

  // Muse is assigned — show info
  if (muse && !museNotFound) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow p-6 mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-boudoir-gold">auto_awesome</span>
          Muse du chapitre
        </h3>

        <div className="space-y-3">
          {/* User info */}
          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <div className="w-10 h-10 rounded-full bg-boudoir-purple/10 dark:bg-boudoir-gold/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-boudoir-purple dark:text-boudoir-gold text-xl">person</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-zinc-900 dark:text-white text-sm">
                {[muse.user.firstName, muse.user.lastName].filter(Boolean).join(" ") || "Sans nom"}
              </p>
              <p className="text-xs text-zinc-500">{muse.user.email}</p>
            </div>
            <button
              onClick={() => navigate(`/users/${muse.user.id}`)}
              className="text-xs text-blue-600 hover:underline"
            >
              Voir le profil
            </button>
          </div>

          {/* Custom story link */}
          {muse.customStory && (
            <div className="flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-zinc-400 text-base">auto_stories</span>
              <span className="text-zinc-600 dark:text-zinc-400">Histoire custom :</span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {muse.customStory.protagonistName || muse.customStoryId}
              </span>
            </div>
          )}

          {/* Promotion link */}
          {muse.promotion && (
            <div className="flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-zinc-400 text-base">sell</span>
              <span className="text-zinc-600 dark:text-zinc-400">Promotion :</span>
              <button
                onClick={() => navigate(`/promotions/${muse.promotion!.id}`)}
                className="font-medium text-blue-600 hover:underline"
              >
                {muse.promotion.name}
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() =>
                navigate(
                  `/promotions/create?targetType=SPECIFIC_USERS&targetUserId=${muse.user.id}&scope=CHAPTER&refId=${chapterId}`
                )
              }
              className="px-4 py-2 bg-boudoir-purple text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Creer une promotion
            </button>
            <button
              onClick={handleRemoveMuse}
              disabled={removing}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {removing ? "Retrait..." : "Retirer la Muse"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No muse assigned — show assignment form
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow p-6 mb-6">
      <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-boudoir-gold">auto_awesome</span>
        Muse du chapitre
      </h3>

      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        Aucune muse assignee a ce chapitre. Recherchez un utilisateur par email pour l'assigner.
      </p>

      <div className="space-y-4">
        {/* Email search */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            Email de l'utilisateur
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchUser();
              }}
              placeholder="email@exemple.com"
              className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-boudoir-purple/50"
            />
            <button
              onClick={handleSearchUser}
              disabled={searching || !searchEmail.trim()}
              className="px-4 py-2 bg-zinc-800 dark:bg-zinc-700 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50"
            >
              {searching ? "..." : "Rechercher"}
            </button>
          </div>
          {searchError && (
            <p className="mt-1.5 text-xs text-red-500">{searchError}</p>
          )}
        </div>

        {/* Search result */}
        {searchResult && (
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg">check_circle</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-zinc-900 dark:text-white text-sm">
                {[searchResult.firstName, searchResult.lastName].filter(Boolean).join(" ") || "Sans nom"}
              </p>
              <p className="text-xs text-zinc-500">{searchResult.email}</p>
            </div>
          </div>
        )}

        {/* Custom story ID (optional) */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            ID Histoire custom (optionnel)
          </label>
          <input
            type="text"
            value={customStoryId}
            onChange={(e) => setCustomStoryId(e.target.value)}
            placeholder="UUID de l'histoire custom"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-boudoir-purple/50"
          />
        </div>

        {/* Assign button */}
        <button
          onClick={handleAssignMuse}
          disabled={!searchResult || assigning}
          className="w-full px-4 py-2.5 bg-boudoir-purple text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {assigning ? "Assignation en cours..." : "Assigner la Muse"}
        </button>
      </div>
    </div>
  );
}
