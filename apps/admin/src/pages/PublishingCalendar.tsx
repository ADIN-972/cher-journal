import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import {
  MdCalendarToday,
  MdAdd,
  MdDelete,
  MdSchedule,
  MdBook,
  MdLibraryBooks,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";
import SchedulePublicationDrawer from "../components/SchedulePublicationDrawer";

interface ScheduledItem {
  id: string;
  type: "chapter" | "volume";
  title: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  status?: string;
  chapterTitle?: string;
  volumeNumber?: number;
}

export default function PublishingCalendar() {
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleDrawer, setShowScheduleDrawer] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadScheduledItems();
  }, []);

  const loadScheduledItems = async () => {
    try {
      const response = await api.get("/admin/scheduling/scheduled");
      // The backend returns the array directly, not wrapped
      const items = Array.isArray(response) ? response : (response as any)?.data || [];
      setScheduledItems(items);
    } catch (error) {
      console.error("Error loading scheduled items:", error);
      toast.error("Erreur lors du chargement du calendrier");
    } finally {
      setLoading(false);
    }
  };


  const toggleChapter = (chapterTitle: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterTitle)) {
      newExpanded.delete(chapterTitle);
    } else {
      newExpanded.add(chapterTitle);
    }
    setExpandedChapters(newExpanded);
  };

  const handleCancelSchedule = async (item: ScheduledItem) => {
    if (!window.confirm(`Annuler la publication programmée de "${item.title}" ?`)) {
      return;
    }

    try {
      await api.delete(
        `/admin/scheduling/schedule/${item.type}/${item.id}`
      );
      toast.success("Publication déprogrammée");
      loadScheduledItems();
    } catch (error: any) {
      console.error("Error canceling schedule:", error);
      toast.error(
        error.response?.data?.error || "Erreur lors de l'annulation"
      );
    }
  };


  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const groupByChapter = (items: ScheduledItem[]) => {
    const grouped: Record<string, ScheduledItem[]> = {};

    items.forEach((item) => {
      // Group chapters by their own title, volumes by their chapter title
      const groupKey = item.type === "chapter" ? item.title : item.chapterTitle || "Unknown";

      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(item);
    });

    // Sort items within each chapter by scheduled date and volume number
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        // Chapters first, then volumes
        if (a.type === "chapter" && b.type === "volume") return -1;
        if (a.type === "volume" && b.type === "chapter") return 1;

        // If both are volumes, sort by volume number
        if (a.type === "volume" && b.type === "volume") {
          return (a.volumeNumber || 0) - (b.volumeNumber || 0);
        }

        // Otherwise sort by scheduled date
        if (!a.scheduledFor || !b.scheduledFor) return 0;
        return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
      });
    });

    return grouped;
  };

  const groupedItems = groupByChapter(scheduledItems);
  const sortedChapters = Object.keys(groupedItems).sort((a, b) => {
    // Sort chapters by the earliest scheduled date in each group
    const earliestA = groupedItems[a][0].scheduledFor;
    const earliestB = groupedItems[b][0].scheduledFor;
    if (!earliestA || !earliestB) return 0;
    return new Date(earliestA).getTime() - new Date(earliestB).getTime();
  });

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <MdCalendarToday className="w-8 h-8 text-indigo-600" />
              Calendrier de Publication
            </h1>
            <p className="text-gray-600 mt-2">
              Planifiez la publication de vos chapitres et volumes
            </p>
          </div>
          <button
            onClick={() => setShowScheduleDrawer(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <MdAdd className="w-5 h-5" />
            Programmer une publication
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total programmées</p>
                <p className="text-3xl font-bold">{scheduledItems.length}</p>
              </div>
              <MdSchedule className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Chapitres</p>
                <p className="text-3xl font-bold">
                  {scheduledItems.filter((i) => i.type === "chapter").length}
                </p>
              </div>
              <MdBook className="w-12 h-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Volumes</p>
                <p className="text-3xl font-bold">
                  {scheduledItems.filter((i) => i.type === "volume").length}
                </p>
              </div>
              <MdLibraryBooks className="w-12 h-12 text-green-200" />
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-xl shadow-md">
          {scheduledItems.length > 0 && (
            <div className="p-4 border-b border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  if (expandedChapters.size === sortedChapters.length) {
                    setExpandedChapters(new Set());
                  } else {
                    setExpandedChapters(new Set(sortedChapters));
                  }
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
              >
                {expandedChapters.size === sortedChapters.length ? (
                  <>
                    <MdExpandLess className="w-5 h-5" />
                    Tout replier
                  </>
                ) : (
                  <>
                    <MdExpandMore className="w-5 h-5" />
                    Tout déplier
                  </>
                )}
              </button>
            </div>
          )}
          {scheduledItems.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <MdCalendarToday className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">Aucune publication programmée</p>
              <p className="text-sm">
                Cliquez sur "Programmer une publication" pour commencer
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedChapters.map((chapterTitle) => {
                const items = groupedItems[chapterTitle];
                const chapterItem = items.find((i) => i.type === "chapter");
                const volumeItems = items.filter((i) => i.type === "volume");

                const isExpanded = expandedChapters.has(chapterTitle);

                return (
                  <div key={chapterTitle} className="p-6">
                    <div
                      className="mb-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition"
                      onClick={() => toggleChapter(chapterTitle)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <MdExpandLess className="w-6 h-6 text-gray-600" />
                        ) : (
                          <MdExpandMore className="w-6 h-6 text-gray-600" />
                        )}
                        <MdBook className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-bold text-gray-800">
                          {chapterTitle}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({items.length} élément{items.length > 1 ? 's' : ''})
                        </span>
                      </div>
                      {chapterItem?.scheduledFor && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-lg">
                          <MdSchedule className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-purple-700 font-medium">
                            Chapitre: {formatDate(chapterItem.scheduledFor)}
                          </span>
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="space-y-2 ml-8">
                      {chapterItem && (
                        <div
                          key={chapterItem.id}
                          className="border-l-4 border-purple-400 bg-purple-50 rounded-lg p-4 hover:shadow-md transition flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <MdBook className="w-5 h-5 text-purple-600" />
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                Chapitre complet
                              </h4>
                              {chapterItem.scheduledFor && (
                                <p className="text-sm text-purple-600 mt-1">
                                  <MdSchedule className="inline w-4 h-4 mr-1" />
                                  {formatDate(chapterItem.scheduledFor)}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancelSchedule(chapterItem)}
                            className="ml-4 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Annuler"
                          >
                            <MdDelete className="w-5 h-5" />
                          </button>
                        </div>
                      )}

                      {volumeItems.map((item) => (
                        <div
                          key={item.id}
                          className="border-l-4 border-green-400 bg-green-50 rounded-lg p-4 hover:shadow-md transition flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <MdLibraryBooks className="w-5 h-5 text-green-600" />
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                Volume {item.volumeNumber}: {item.title}
                              </h4>
                              {item.scheduledFor && (
                                <p className="text-sm text-green-600 mt-1">
                                  <MdSchedule className="inline w-4 h-4 mr-1" />
                                  {formatDate(item.scheduledFor)}
                                </p>
                              )}
                              {item.status && (
                                <span className="inline-block mt-1 px-2 py-1 bg-white text-xs rounded">
                                  Statut: {item.status}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancelSchedule(item)}
                            className="ml-4 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Annuler"
                          >
                            <MdDelete className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Schedule Drawer */}
      <SchedulePublicationDrawer
        isOpen={showScheduleDrawer}
        onClose={() => setShowScheduleDrawer(false)}
        onScheduled={loadScheduledItems}
      />
    </>
  );
}
