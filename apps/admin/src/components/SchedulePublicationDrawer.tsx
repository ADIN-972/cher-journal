import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import {
  MdClose,
  MdSchedule,
  MdCheckCircle,
  MdBook,
  MdLibraryBooks,
} from "react-icons/md";

interface Chapter {
  id: string;
  title: string;
  status: string;
  publishedAt: string | null;
}

interface Volume {
  id: string;
  volumeNumber: number;
  title: string;
  status: string;
  publishedAt: string | null;
  scheduledFor: string | null;
}

interface SchedulePublicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
}

export default function SchedulePublicationDrawer({
  isOpen,
  onClose,
  onScheduled,
}: SchedulePublicationDrawerProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [selectedVolumeIds, setSelectedVolumeIds] = useState<Set<string>>(
    new Set()
  );
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadChapters();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedChapterId) {
      loadVolumes(selectedChapterId);
    } else {
      setVolumes([]);
      setSelectedVolumeIds(new Set());
    }
  }, [selectedChapterId]);

  const loadChapters = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/chapters");
      // Show all chapters but we'll disable published ones visually
      setChapters(response.data || []);
    } catch (error) {
      console.error("Error loading chapters:", error);
      toast.error("Erreur lors du chargement des chapitres");
    } finally {
      setLoading(false);
    }
  };

  const loadVolumes = async (chapterId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/chapters/${chapterId}`);
      // The API returns data wrapped in { success, data }
      const chapterData = response.data?.data || response.data;
      const volumesList = chapterData?.volumes || [];
      // Show all volumes - we'll filter by status in the display
      setVolumes(volumesList);
      setSelectedVolumeIds(new Set());
    } catch (error) {
      console.error("Error loading volumes:", error);
      toast.error("Erreur lors du chargement des volumes");
    } finally {
      setLoading(false);
    }
  };

  const toggleVolumeSelection = (volumeId: string) => {
    const newSelection = new Set(selectedVolumeIds);
    if (newSelection.has(volumeId)) {
      newSelection.delete(volumeId);
    } else {
      newSelection.add(volumeId);
    }
    setSelectedVolumeIds(newSelection);
  };

  const handleSchedule = async () => {
    if (!selectedChapterId) {
      toast.error("Veuillez sélectionner un chapitre");
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error("Veuillez sélectionner une date et heure");
      return;
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}:00`);

    if (scheduledFor <= new Date()) {
      toast.error("La date doit être dans le futur");
      return;
    }

    setProcessing(true);

    try {
      // If no volumes selected, schedule the chapter
      if (selectedVolumeIds.size === 0) {
        await api.post("/admin/scheduling/schedule", {
          entityType: "chapter",
          entityId: selectedChapterId,
          scheduledFor: scheduledFor.toISOString(),
        });

        toast.success("Chapitre programmé avec succès");
      } else {
        // Schedule multiple volumes (bulk)
        await api.post("/admin/scheduling/schedule-bulk", {
          entityType: "volume",
          entityIds: Array.from(selectedVolumeIds),
          scheduledFor: scheduledFor.toISOString(),
        });

        toast.success(
          `${selectedVolumeIds.size} volume(s) programmé(s) avec succès`
        );
      }

      onScheduled();
      handleClose();
    } catch (error: any) {
      console.error("Error scheduling publication:", error);
      toast.error(
        error.response?.data?.error || "Erreur lors de la programmation"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedChapterId("");
    setVolumes([]);
    setSelectedVolumeIds(new Set());
    setScheduledDate("");
    setScheduledTime("12:00");
    onClose();
  };

  if (!isOpen) return null;

  const selectedChapter = chapters.find((c) => c.id === selectedChapterId);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      ></div>

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MdSchedule className="w-7 h-7" />
              Programmer une publication
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              Sélectionnez un chapitre et optionnellement des volumes
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Select Chapter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MdBook className="w-5 h-5 text-indigo-600" />
              1. Sélectionnez un chapitre
            </h3>

            {loading && !selectedChapterId ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {chapters.map((chapter) => {
                  const isPublished = chapter.status === "PUBLISHED";
                  const isInProgress = chapter.status === "IN_PROGRESS";
                  const isDraft = chapter.status === "DRAFT";
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => setSelectedChapterId(chapter.id)}
                      className={`p-4 rounded-lg border-2 text-left transition ${
                        selectedChapterId === chapter.id
                          ? "border-indigo-600 bg-indigo-50"
                          : `${isPublished ? "border-green-400 bg-green-50" : isInProgress ? "border-yellow-400 bg-yellow-50" : isDraft ? "border-gray-400 bg-gray-50" : "border-gray-200 bg-white"} hover:border-indigo-300`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-800">
                              {chapter.title}
                            </h4>
                            <div className="ml-auto">
                            {isPublished && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                Publié
                              </span>
                            )}
                            {isInProgress && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                En cours
                              </span>
                            )}
                            {isDraft && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                Brouillon
                              </span>
                            )}
                            </div>
                          </div>
                          {/* <p className="text-sm text-gray-500">
                            Statut: {chapter.status}
                          </p> */}
                        </div>
                        {selectedChapterId === chapter.id && (
                          <MdCheckCircle className="w-6 h-6 text-indigo-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Select Volumes (optional) */}
          {selectedChapterId && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MdLibraryBooks className="w-5 h-5 text-green-600" />
                2. Sélectionnez des volumes (optionnel)
              </h3>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Astuce :</strong> Si vous ne sélectionnez aucun
                  volume, le chapitre entier sera programmé. Sinon, seuls les
                  volumes sélectionnés le seront.
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  <strong>📅 Note :</strong> Vous pouvez programmer même des volumes
                  déjà publiés. Cela définira la date à partir de laquelle ils
                  seront accessibles à la lecture.
                </p>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              ) : volumes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MdLibraryBooks className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucun volume pour ce chapitre</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {volumes.map((volume) => {
                    const isPublished = volume.status === "PUBLISHED";
                    const hasScheduledDate = volume.scheduledFor !== null;
                    return (
                      <button
                        key={volume.id}
                        onClick={() => toggleVolumeSelection(volume.id)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition ${
                          selectedVolumeIds.has(volume.id)
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                                Volume {volume.volumeNumber}
                              </span>
                              {isPublished && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                  Publié
                                </span>
                              )}
                              {hasScheduledDate && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                  Programmé
                                </span>
                              )}
                            </div>
                            <h4 className="font-medium text-gray-800">
                              {volume.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Statut: {volume.status}
                              {hasScheduledDate && (
                                <span className="ml-2">
                                  • Prévu le{" "}
                                  {new Date(volume.scheduledFor).toLocaleDateString(
                                    "fr-FR"
                                  )}
                                </span>
                              )}
                            </p>
                          </div>
                          {selectedVolumeIds.has(volume.id) && (
                            <MdCheckCircle className="w-6 h-6 text-green-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {selectedChapterId && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MdSchedule className="w-5 h-5 text-purple-600" />
                3. Choisissez la date et l'heure
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure *
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {selectedChapterId && scheduledDate && scheduledTime && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">
                📋 Résumé de la programmation
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>
                  <strong>Chapitre:</strong> {selectedChapter?.title}
                </li>
                <li>
                  <strong>Type:</strong>{" "}
                  {selectedVolumeIds.size === 0
                    ? "Chapitre entier"
                    : `${selectedVolumeIds.size} volume(s)`}
                </li>
                <li>
                  <strong>Date de publication:</strong>{" "}
                  {new Date(
                    `${scheduledDate}T${scheduledTime}:00`
                  ).toLocaleString("fr-FR")}
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={handleClose}
            disabled={processing}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleSchedule}
            disabled={processing || !selectedChapterId || !scheduledDate}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            {processing ? (
              "Traitement..."
            ) : (
              <>
                <MdCheckCircle className="w-5 h-5" />
                Programmer
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
