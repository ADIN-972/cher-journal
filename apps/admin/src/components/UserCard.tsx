import React, { MouseEvent } from "react";
import type { User } from "@cher-journal/types";

interface UserCardProps {
  user: User & {
    subscription?: { status: string } | null;
    _count?: { orders: number; entitlements: number };
    chaptersCount?: number;
    lastActivity?: string | null;
  };
  selected?: boolean;
  onClick?: () => void;
  onSelect?: () => void;
  onContextMenu?: (e: MouseEvent) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "A l'instant";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hier";
  if (days < 30) return `${days}j`;
  const months = Math.floor(days / 30);
  return `${months} mois`;
}

export default function UserCard({ user, selected, onClick, onSelect, onContextMenu }: UserCardProps) {
  const isClubMember = user.subscription?.status === "ACTIVE";
  const isSuspended = user.status !== "ACTIVE";
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email.split("@")[0];
  const initial = (user.firstName?.[0] || user.email[0]).toUpperCase();

  const handleCardClick = (e: MouseEvent) => {
    e.preventDefault();
    if (onSelect) onSelect();
  };

  return (
    <div
      className={`bg-[#F2EDE9] rounded-2xl p-6 flex flex-col items-center text-center transition-all hover:bg-white hover:shadow-xl group relative overflow-hidden cursor-pointer border-2 ${
        selected
          ? "border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/30"
          : "border-[#e9c176]/10"
      } ${isSuspended ? "opacity-70 grayscale-[0.3]" : ""}`}
      onClick={handleCardClick}
      onContextMenu={onContextMenu}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-3 left-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-sm">check</span>
        </div>
      )}

      {/* Avatar */}
      <div className="relative mb-4">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 transition-all ${
            isClubMember
              ? "bg-gradient-to-br from-[#e9c176] to-[#c5a059] border-[#e9c176]/10 group-hover:border-[#e9c176]/40"
              : isSuspended
              ? "bg-gray-400 border-red-200/10 group-hover:border-red-300/40"
              : "bg-gradient-to-br from-primary/80 to-primary border-primary/10 group-hover:border-primary/40"
          }`}
        >
          {initial}
        </div>
        {!isSuspended && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-[#F2EDE9] rounded-full group-hover:border-white transition-all" />
        )}
      </div>

      {/* Name */}
      <h3 className="text-[#2A1720] text-xl font-bold mb-0.5">{name}</h3>
      {user.username && (
        <p className="text-[10px] text-primary font-semibold mb-0.5">@{user.username}</p>
      )}
      <p className="text-[10px] uppercase tracking-widest text-[#2A1720]/60 mb-4 font-bold">
        {user.email}
      </p>

      {/* Badge */}
      <div className="inline-flex mb-5">
        {isClubMember ? (
          <span className="bg-[#e9c176]/10 text-[#e9c176] text-[9px] px-3 py-1 rounded-full border border-[#e9c176]/20 font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">workspace_premium</span>
            Membre Club Prive
          </span>
        ) : isSuspended ? (
          <span className="bg-red-500/10 text-red-600 text-[9px] px-3 py-1 rounded-full border border-red-500/20 font-bold uppercase tracking-widest">
            Suspendu
          </span>
        ) : (
          <span className="bg-primary/10 text-primary text-[9px] px-3 py-1 rounded-full border border-primary/20 font-bold uppercase tracking-widest">
            Actif
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="w-full grid grid-cols-2 gap-4 border-t border-[#e9c176]/10 pt-5 mb-5">
        <div className="text-left">
          <span className="block uppercase text-[8px] text-[#2A1720]/50 tracking-widest mb-1 font-bold">
            Chapitres
          </span>
          <p className="text-[#2A1720] text-xs font-semibold">
            {user.chaptersCount ?? 0} chapitre{(user.chaptersCount ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right">
          <span className="block uppercase text-[8px] text-[#2A1720]/50 tracking-widest mb-1 font-bold">
            Activite
          </span>
          <p className="text-[#2A1720] text-xs font-semibold">
            {user.lastActivity ? timeAgo(user.lastActivity) : "Aucune"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full">
        <button
          type="button"
          className="flex-1 px-4 py-2.5 bg-[#e5dcd6] text-[#2A1720] uppercase text-[10px] tracking-widest rounded-full hover:bg-[#e9c176] transition-all font-bold"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          Voir le profil
        </button>
      </div>
    </div>
  );
}
