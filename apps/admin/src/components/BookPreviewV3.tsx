import React from "react";
import type { Chapter } from "@cher-journal/types";
import { getImageUrl } from "../lib/imageUtils";
import { useI18n } from "../lib/i18n";

interface BookPreviewV3Props {
  chapter: Chapter;
  onView: () => void;
  onEdit: () => void;
  onArchiveToggle: () => void;
}

function BookPreviewV3({
  chapter,
  onView,
  onEdit,
  onArchiveToggle,
}: BookPreviewV3Props) {
  const { t } = useI18n();
  const isArchived = chapter.isArchived;

  // Get status badge config
  const getStatusBadge = () => {
    if (isArchived) {
      return {
        label: t("chapter.status_archived"),
        bgColor: "bg-slate-400/90",
        icon: "archive",
      };
    }

    switch (chapter.status) {
      case "PUBLISHED":
        return {
          label: t("chapter.status_published"),
          bgColor: "bg-emerald-500/90",
          icon: "verified",
        };
      case "DRAFT":
        return {
          label: t("chapter.status_draft"),
          bgColor: "bg-amber-500/90",
          icon: "pending",
        };
      case "IN_PROGRESS":
        return {
          label: t("chapter.status_in_progress"),
          bgColor: "bg-blue-500/90",
          icon: "hourglass_empty",
        };
      default:
        return {
          label: t("chapter.status_draft"),
          bgColor: "bg-amber-500/90",
          icon: "pending",
        };
    }
  };

  const statusBadge = getStatusBadge();
  const stats = chapter.stats || {
    volumesWithText: 0,
    totalVolumes: 0,
    volumesWithIllustration: 0,
    coloringPagesCount: 0,
  };

  const coverImageUrl = chapter.coverAsset
    ? getImageUrl(chapter.coverAsset)
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuAolRfmVfFKerMY0h6VAt30Ev3wxoFnzMHgYCaWMYMhh6wjtVQJHJ5vFX_SCmtcevI513yKpzHVLhEYhp_yQ8lcnmvTYdiHrgYE-1q7jhKhaD0igguAh3DhyPVs8g7S-PHX0TvhjlvWd2muwU-RpM6QtyKA-wYsptSazPbiNRli7ESSrfBiCL7X9akvkYR_EMxsHplwA9a_yrBPN_s92sXQWSP7fdSQveE0p_L0IpBKTtqFJqj_IRi-LNnOWZXVDH5GoNOC3Q01a0c";

  return (
    <div className="book-card group shadow-book-published">
      <div
        className={`p-5 flex flex-col flex-1 ${isArchived ? "grayscale-[0.5]" : ""}`}>
        <p
          className={`text-sm font-medium italic mb-4 ${isArchived ? "text-gold/60" : "text-gold"}`}>
          Protagoniste: {chapter.protagonistName || "Non défini"}
        </p>
        <div
          className={`grid grid-cols-3 gap-2 mb-6 ${isArchived ? "opacity-40" : ""}`}>
          <div className="flex flex-col items-center bg-light-plum border-border-light/50 dark:bg-black/20 p-2 rounded-lg border dark:border-white/5">
            <span className="material-symbols-outlined text-primary text-lg">
              auto_stories
            </span>
            <span className="text-charcoal dark:text-white text-[11px] font-bold mt-1">
              {stats.volumesWithText}/{stats.totalVolumes}
            </span>
            <span className="text-[#c992a0] text-[9px] uppercase">Chaps</span>
          </div>
          <div className="flex flex-col items-center bg-light-plum border-border-light/50 dark:bg-black/20 p-2 rounded-lg border border-white/5">
            <span className="material-symbols-outlined text-primary text-lg">
              image
            </span>
            <span className="text-charcoal dark:text-white text-[11px] font-bold mt-1">
              {stats.volumesWithIllustration}/{stats.totalVolumes}
            </span>
            <span className="text-[#c992a0] text-[9px] uppercase">Illus</span>
          </div>
          <div className="flex flex-col items-center bg-light-plum border-border-light/50 dark:bg-black/20 p-2 rounded-lg border border-white/5">
            <span className="material-symbols-outlined text-primary text-lg">
              palette
            </span>
            <span className="text-charcoal dark:text-white text-[11px] font-bold mt-1">
              {stats.coloringPagesCount}
            </span>
            <span className="text-[#c992a0] text-[9px] uppercase">Color</span>
          </div>
        </div>
        <div className="mt-auto flex justify-between gap-2 border-t border-black/10 dark:border-white/5 pt-4">
          <button
            onClick={onView}
            className={`flex-1 flex items-center justify-center h-10 bg-light-plum  dark:bg-white/5 hover:bg-primary/10 hover:text-primary dark:hover:bg-white/10 rounded-lg transition-colors ${
              isArchived ? "text-white/50" : "text-charcoal dark:text-white"
            }`}
            title="Voir contenu">
            <span className="material-symbols-outlined">visibility</span>
          </button>
          <button
            onClick={onEdit}
            className={`flex-1 flex items-center justify-center h-10 bg-light-plum  dark:bg-white/5 hover:bg-primary/10 hover:text-primary dark:hover:bg-white/10 rounded-lg transition-colors ${
              isArchived ? "text-white/50" : "text-charcoal dark:text-white"
            }`}
            title="Modifier">
            <span className="material-symbols-outlined">edit_square</span>
          </button>
          <button
            onClick={onArchiveToggle}
            className={`flex-1 flex items-center justify-center h-10 rounded-lg transition-colors ${
              isArchived
                ? "bg-primary/20 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/40 text-primary"
                : "bg-light-plum  dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-red-500/20 text-red-400"
            }`}
            title={isArchived ? "Restaurer" : "Archiver"}>
            <span className="material-symbols-outlined">
              {isArchived ? "unarchive" : "archive"}
            </span>
          </button>
        </div>
      </div>
      <div className="book-spine-crease"></div>
      <div className="book-right">
        <div className="page-texture"></div>{" "}
        <img
          alt="Illustration chapitre 1"
          className="book-illustration transition-transform duration-700 group-hover:scale-110"
          src={coverImageUrl}
        />
        <h3
          className={`absolute -bottom-1 p-2 font-serif text-2xl bottom-2 handwriting bg-black/60 w-full ${isArchived ? "text-white/70" : "text-charcoal dark:text-white"}`}>
          {chapter.title}
        </h3>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/10"></div>
      </div>
    </div>
  );
}

export default BookPreviewV3;
