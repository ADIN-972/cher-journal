import { useState, useEffect } from "react";
import { MdClose, MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useDebugInterface } from "../hooks/useDebugInterface";
import type { Volume, Chapter } from "@cher-journal/types";

interface VolumeVersion {
  id: string;
  volumeId: string;
  perspective: "NARRATOR" | "PROTAGONIST";
  textBlobId?: string | null;
  hasText?: boolean;
  text?: string | null;
}

interface VolumePerspectiverDrawerProps {
  isOpen: boolean;
  volume: Volume | null;
  chapter?: Chapter | null;
  selectedPerspective?: "NARRATOR" | "PROTAGONIST" | null;
  onClose: () => void;
  onSelectPerspective?: (perspective: "NARRATOR" | "PROTAGONIST") => void;
}

export default function VolumePerspectiverDrawer({
  isOpen,
  volume,
  chapter,
  selectedPerspective,
  onClose,
  onSelectPerspective,
}: VolumePerspectiverDrawerProps) {
  const { canDebug } = useDebugInterface();
  const [versions, setVersions] = useState<VolumeVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingVersion, setDeletingVersion] = useState<string | null>(null);
  const [perspectiveText, setPerspectiveText] = useState<string>("");
  const [loadingText, setLoadingText] = useState(false);
  const [activeTab, setActiveTab] = useState<"NARRATOR" | "PROTAGONIST">(
    "NARRATOR"
  );

  useEffect(() => {
    if (canDebug)
      console.log("=== EFFECT: isOpen or volume changed ===", {
        isOpen,
        volumeId: volume?.id,
      });
    if (isOpen && volume) {
      // Utiliser les versions du volume prop au lieu de faire un appel API
      if (volume.versions && volume.versions.length > 0) {
        if (canDebug)
          console.log("Using versions from volume prop:", volume.versions);
        setVersions(volume.versions);
      } else {
        // Fallback: faire un appel API si les versions ne sont pas dans le volume
        if (canDebug)
          console.log("No versions in volume prop, calling loadVersions()");
        loadVersions();
      }
    }
  }, [isOpen, volume]);

  useEffect(() => {
    if (activeTab && versions.length > 0) {
      if (canDebug)
        console.log("=== EFFECT: activeTab or versions changed ===");
      if (canDebug) console.log("Active tab:", activeTab);
      if (canDebug) console.log("Available versions:", versions);
      const version = versions.find((v) => v.perspective === activeTab);
      if (canDebug) console.log("Found version for tab:", version);

      if (version && !version.id.startsWith("placeholder-")) {
        if (canDebug) console.log("Loading text for version:", version.id);
        // Reset text first to avoid showing old text while loading
        setPerspectiveText("");
        setLoadingText(true);
        // Load text from dedicated endpoint only if it's a real version (not placeholder)
        (async () => {
          await loadPerspectiveText(version.id);
        })();
      } else {
        if (canDebug)
          console.log(
            "No real version found (placeholder or missing), clearing text"
          );
        setPerspectiveText("");
        setLoadingText(false);
      }
    } else {
      if (canDebug)
        console.log("Skipping effect: activeTab or versions not ready");
    }
  }, [activeTab, versions]);

  const loadVersions = async () => {
    if (!volume) return;
    setLoading(true);
    try {
      const response = await api.get(`/admin/volumes/${volume.id}/versions`);
      if (canDebug) console.log("Versions loaded:", response.data);
      // L'API retourne soit le tableau directement, soit { success, data: [...] }
      const versions = Array.isArray(response.data)
        ? response.data
        : response.data.data;
      setVersions(versions);
    } catch (error) {
      console.error("Error loading versions:", error);
      toast.error("Erreur lors du chargement des perspectives");
    } finally {
      setLoading(false);
    }
  };

  const loadPerspectiveText = async (versionId: string) => {
    if (canDebug)
      console.log("=== loadPerspectiveText called ===", { versionId });
    try {
      const response = await api.get(
        `/admin/volume-versions/${versionId}/text`
      );
      if (canDebug) console.log("API response:", response);
      if (canDebug) console.log("API response.data:", response.data);

      // Handle both wrapped and unwrapped responses
      let text = "";
      if (response.data?.data?.text !== undefined) {
        text = response.data.data.text;
      } else if (response.data?.text !== undefined) {
        text = response.data.text;
      }

      if (canDebug) console.log("Extracted text length:", text?.length || 0);
      if (canDebug)
        console.log(
          "Setting perspectiveText to:",
          text?.substring(0, 100) + "..."
        );
      setPerspectiveText(text || "");

      if (text?.length > 0) {
        if (canDebug) console.log(`✓ Text loaded: ${text.length} caractères`);
      } else {
        if (canDebug) console.log("⚠️ No text found for this perspective");
      }
    } catch (error: any) {
      console.error("❌ Error loading perspective text:", error);
      // If text doesn't exist, just clear the field
      if (error.response?.status === 404) {
        if (canDebug) console.log("Text not found (404)");
        setPerspectiveText("");
      } else {
        console.error("Unexpected error:", error.message);
        toast.error("Erreur lors du chargement du texte");
      }
    } finally {
      setLoadingText(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingVersion) return;
    try {
      await api.delete(`/admin/volume-versions/${deletingVersion}`);
      toast.success("Perspective supprimée");
      setDeletingVersion(null);
      await loadVersions();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const savePerspectiveDetail = async (
    perspective: "NARRATOR" | "PROTAGONIST"
  ) => {
    if (!volume) return;
    const version = versions.find((v) => v.perspective === perspective);

    // Check if version is a placeholder (doesn't exist in database)
    const isPlaceholder = version?.id.startsWith("placeholder-");

    try {
      if (version && !isPlaceholder) {
        // Update existing version: use dedicated /text endpoint for saving text
        await api.patch(`/admin/volume-versions/${version.id}/text`, {
          text: perspectiveText || "",
        });
        toast.success("Perspective mise à jour");
        // Reload versions to get updated hasText flag
        await loadVersions();
      } else {
        // Create a new version
        const createResponse = await api.post(
          `/admin/volumes/${volume.id}/versions`,
          {
            perspective,
          }
        );
        const createdVersion = createResponse.data?.data;

        // If there's text to save, save it immediately
        if (createdVersion && perspectiveText) {
          await api.patch(`/admin/volume-versions/${createdVersion.id}/text`, {
            text: perspectiveText,
          });
        }

        toast.success("Perspective créée");
        await loadVersions();
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("Cette perspective existe déjà pour ce volume");
      } else {
        toast.error(
          error.response?.data?.error?.message ||
            error.response?.data?.error ||
            "Erreur lors de la sauvegarde"
        );
      }
    }
  };
  if (!isOpen || !volume) return null;

  const renderPerspectiveDetail = (
    perspective: "NARRATOR" | "PROTAGONIST",
    versionsList: VolumeVersion[]
  ) => {
    const version = versionsList.find((v) => v.perspective === perspective);
    const isNarrator = perspective === "NARRATOR";

    if (canDebug) {
      console.log("=== renderPerspectiveDetail ===", {
        perspective,
        versionId: version?.id,
        perspectiveTextLength: perspectiveText.length,
        perspectiveText: perspectiveText?.substring(0, 50) + "...",
        loadingText,
      });
    }

    return (
      <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Card */}
        <div
          className={`bg-gradient-to-br ${isNarrator ? "from-blue-50 via-blue-50/50 to-white" : "from-purple-50 via-purple-50/50 to-white"} p-6 border-b border-slate-200`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2.5 ${isNarrator ? "bg-blue-100" : "bg-purple-100"} rounded-xl`}>
                  <span className="text-2xl">{isNarrator ? "📖" : "👤"}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isNarrator ? "Version Narrateur" : "Version Protagoniste"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isNarrator
                      ? version
                        ? "Perspective existante"
                        : "Nouvelle perspective"
                      : chapter?.protagonistName || "Protagoniste"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col gap-2">
              {version ? (
                <>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Perspective créée
                  </div>
                  {version.hasText || version.textBlobId ? (
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 ${isNarrator ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"} rounded-full text-xs font-semibold`}>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Texte chiffré
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Aucun texte
                    </div>
                  )}
                </>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  À créer
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-6 min-h-0 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Contenu de la perspective
            </label>
            <div className="flex items-center gap-3">
              {loadingText && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <svg
                    className="w-3 h-3 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement...
                </span>
              )}
              <span
                className={`text-xs font-semibold ${perspectiveText.length > 0 ? "text-green-600" : "text-slate-400"}`}>
                {perspectiveText.length} caractères
              </span>
            </div>
          </div>

          {canDebug && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 text-xs font-mono">
              <div>DEBUG - perspectiveText state:</div>
              <div className="mt-1 max-h-20 overflow-y-auto text-yellow-800">
                {perspectiveText.substring(0, 200)}
                {perspectiveText.length > 200 ? "..." : ""}
              </div>
              <div className="mt-1">Length: {perspectiveText.length}</div>
            </div>
          )}

          <textarea
            value={perspectiveText}
            onChange={(e) => setPerspectiveText(e.target.value)}
            disabled={loadingText}
            placeholder={`Écrivez le contenu complet de la perspective ${isNarrator ? "narrateur" : "protagoniste"}...`}
            className={`flex-1 w-full px-4 py-4 bg-slate-50 border-2 ${isNarrator ? "border-blue-100 focus:border-blue-500 focus:ring-blue-500" : "border-purple-100 focus:border-purple-500 focus:ring-purple-500"} rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 font-mono leading-relaxed resize-none disabled:opacity-50 disabled:cursor-wait`}
          />

          <div
            className={`flex items-center gap-2 px-4 py-3 ${isNarrator ? "bg-blue-50 border-blue-200" : "bg-purple-50 border-purple-200"} border rounded-xl`}>
            <svg
              className="w-4 h-4 text-current opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p
              className={`text-xs ${isNarrator ? "text-blue-700" : "text-purple-700"} font-medium`}>
              Le contenu sera automatiquement chiffré avec AES-256-GCM avant
              stockage
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 border-t border-slate-200 bg-slate-50/50">
          <button
            onClick={() => savePerspectiveDetail(activeTab)}
            className={`group relative w-full px-6 py-4 ${isNarrator ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-500/30" : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-purple-500/30"} text-white rounded-xl font-bold text-sm shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 overflow-hidden`}>
            <div className="relative z-10 flex items-center justify-center gap-2">
              {version ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Enregistrer les modifications</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Créer la perspective</span>
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[70vw] max-w-4xl bg-white shadow-2xl z-50 flex flex-col transform transition-all duration-300 ease-out">
        {/* Header */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">
                Gestion des perspectives
              </h2>
              {volume && (
                <p className="text-sm text-slate-500 font-medium">
                  <span className="font-bold">
                    {chapter?.protagonistName &&
                      `${chapter.protagonistName} • `}
                  </span>{" "}
                  [Vol {volume.volumeNumber}] •{" "}
                  <span className="italic text-slate-400">
                    "{volume.title || "Sans titre"}"
                  </span>
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              title="Fermer">
              <MdClose className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
          {/* Tabs - Modern segmented control style */}
          <div className="px-8 pt-6 pb-4">
            <div className="inline-flex w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5">
              <button
                onClick={() => {
                  if (canDebug) console.log("=== CLICKING NARRATOR TAB ===");
                  setActiveTab("NARRATOR");
                }}
                className={`flex-1 px-6 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 relative ${
                  activeTab === "NARRATOR"
                    ? "text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-lg">📖</span>
                  <span className="tracking-wide">Narrateur</span>
                  {versions.some((v) => v.perspective === "NARRATOR") && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeTab === "NARRATOR" ? "bg-white" : "bg-blue-500"
                      }`}></span>
                  )}
                </div>
              </button>
              <button
                onClick={() => {
                  if (canDebug) console.log("=== CLICKING PROTAGONIST TAB ===");
                  setActiveTab("PROTAGONIST");
                }}
                className={`flex-1 px-6 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 relative ${
                  activeTab === "PROTAGONIST"
                    ? "text-white bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg shadow-purple-500/30"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-lg">👤</span>
                  <span className="tracking-wide">Protagoniste</span>
                  {versions.some((v) => v.perspective === "PROTAGONIST") && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeTab === "PROTAGONIST"
                          ? "bg-white"
                          : "bg-purple-500"
                      }`}></span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-500 font-medium">
                    Chargement des perspectives...
                  </p>
                </div>
              </div>
            ) : (
              renderPerspectiveDetail(activeTab, versions)
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingVersion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6 transform transition-all duration-200 scale-100">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <MdDelete className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Confirmer la suppression
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Cette action est irréversible
                </p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer cette perspective ? Tout le
              texte associé sera également supprimé définitivement.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingVersion(null)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95">
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 font-semibold transition-all duration-200 shadow-lg shadow-red-500/30 hover:scale-[1.02] active:scale-95">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
