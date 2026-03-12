import { useNavigate } from "react-router-dom";
import type { Chapter } from "@cher-journal/types";
import { getImageUrl } from "../lib/imageUtils";

interface ChaptersNavigationProps {
  chapters: Chapter[];
  currentChapterId: string;
}

export default function ChaptersNavigation({
  chapters,
  currentChapterId,
}: ChaptersNavigationProps) {
  const navigate = useNavigate();

  if (!chapters || chapters.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1">
          {chapters.map((chapter) => {
            const isCurrentChapter = chapter.id === currentChapterId;
            const coverAsset = chapter.coverAsset;
            const coverUrl = getImageUrl(coverAsset); // coverAsset?.url || coverAsset?.publicUrl;

            return (
              <button
                key={chapter.id}
                data-chapter-id={chapter.id}
                onClick={() => navigate(`/chapters/${chapter.id}`)}
                className={`flex-shrink-0 p-1`}>
                <div className={`w-20 h-28 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 flex flex-col  transition-all duration-200 ${
                  isCurrentChapter
                    ? "ring-2 ring-offset-2 ring-purple-600 dark:ring-offset-zinc-900"
                    : "hover:opacity-75"
                } `}>
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={chapter.title}
                      className="w-full h-20 object-cover"
                    />
                  ) : (
                    <div className="w-full h-20 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-400">
                        image
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex-1 flex items-end p-1 text-xs text-center items-center justify-center ${
                      chapter.status === "PUBLISHED"
                        ? "bg-green-300 dashed"
                        : chapter.status === "DRAFT"
                          ? "bg-gray-300 dashed"
                          : chapter.status === "IN_PROGRESS"
                            ? "bg-orange-300 dashed"
                            : ""
                    }`}>
                    <p className="w-full font-medium text-gray-700  truncate">
                      {chapter.protagonistName}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
