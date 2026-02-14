import {
  MdEdit,
  MdDelete,
  MdExpandMore,
  MdExpandLess,
  MdCardGiftcard,
  MdPercent,
  MdAttachMoney,
} from "react-icons/md";
import { useState } from "react";
import PromotionOverallImpact from "./PromotionOverallImpact";

interface Promotion {
  id: string;
  name: string;
  description?: string;
  scope: string;
  type: string;
  value?: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  targetType: string;
  targetedUsersCount?: number;
  _count?: {
    applied: number;
  };
}

interface PromotionCardProps {
  promotion: Promotion;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const scopeColors: Record<string, string> = {
  VOLUME: "from-blue-500 to-blue-600",
  CHAPTER: "from-purple-500 to-purple-600",
  EPILOGUE: "from-pink-500 to-pink-600",
  POV: "from-indigo-500 to-indigo-600",
  COLORING: "from-orange-500 to-orange-600",
  BUNDLE: "from-green-500 to-green-600",
  SUBSCRIPTION: "from-red-500 to-red-600",
};

const bgColors: Record<string, string> = {
  VOLUME: "bg-blue-600",
  CHAPTER: "bg-purple-600",
  EPILOGUE: "bg-pink-600",
  POV: "bg-indigo-600",
  COLORING: "bg-orange-600",
  BUNDLE: "bg-green-600",
  SUBSCRIPTION: "bg-red-600",
};

const scopeLineColors: Record<string, string> = {
  VOLUME: "border-blue-800",
  CHAPTER: "border-purple-800",
  EPILOGUE: "border-pink-800",
  POV: "border-indigo-800",
  COLORING: "border-orange-800",
  BUNDLE: "border-green-800",
  SUBSCRIPTION: "border-red-800",
};
const scopeLabels: Record<string, string> = {
  VOLUME: "Volume",
  CHAPTER: "Chapitre",
  EPILOGUE: "Épilogue",
  POV: "Perspective",
  COLORING: "Coloriage",
  BUNDLE: "Bundle",
  SUBSCRIPTION: "Abonnement",
};

const getPromotionValue = (type: string, value?: number): string => {
  if (type === "FREE") return "GRATUIT";
  if (type === "PERCENT" && value) return `-${value}%`;
  if (type === "FIXED" && value) return `-${(value / 100).toFixed(2)}€`;
  return "";
};

const getPromotionValueDisplay = (type: string, value?: number): string => {
  if (type === "FREE") return "100.00";
  if (type === "PERCENT" && value) return value.toString();
  if (type === "FIXED" && value !== undefined) return (value / 100).toFixed(2);
  return "0.00";
};

export default function PromotionCard({
  promotion,
  onEdit,
  onDelete,
}: PromotionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const scopeColor =
    scopeColors[promotion.scope] || "from-gray-500 to-gray-600";
  const scopeLabel = scopeLabels[promotion.scope] || promotion.scope;

  const isExpired = new Date(promotion.endsAt) < new Date();
  const isActive = promotion.isActive && !isExpired;

  return (
    <div
      className={`relative grid grid-rows-[auto_auto_1fr_auto] rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gray-200 p-3`}>
      {/* Coupon-style top section with perforations */}
      <div
        className={`rounded-t-xl  ${
          !isActive ? "dashed" : ""
        } ${bgColors[promotion.scope] || "bg-gray-600"} bg-opacity-60 ${scopeLineColors[promotion.scope] || "border-gray-600"} border-b px-3 pt-3 pb-3 text-white relative `}>
        {/* Scope badge at the top */}
        <div
          className={`flex py-1 px-3 shadow-md rounded-full w-min text-xs font-semibold uppercase tracking-wider mb-1 opacity-90  ${bgColors[promotion.scope] || "bg-gray-600"}`}>
          {scopeLabel}
        </div>

        {/* Promotion name */}
        <h3 className="text-md text-center font-bold mb-2 line-clamp-2">
          {promotion.name}
        </h3>

        {/* Promotion value - BIG and centered */}
        <div className="text-center my-4">
          {promotion.type === "FREE" ? (
            <div className="flex flex-col items-center justify-center">
            
              <div className="text-2xl font-black"><MdCardGiftcard className="inline" /> GRATUIT</div>
              <div className="text-sm opacity-90 mt-2">Accès complet</div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                {promotion.type === "PERCENT" ? (
                  <MdPercent
                    size={32}
                    className="opacity-80"
                  />
                ) : (
                  <MdAttachMoney
                    size={32}
                    className="opacity-80"
                  />
                )}
              </div>
              <div className="text-5xl font-black">
                {getPromotionValueDisplay(promotion.type, promotion.value)}
                {promotion.type === "PERCENT" ? "%" : "€"}
              </div>
              <div className="text-sm opacity-90 mt-1">
                {promotion.type === "PERCENT" ? "de réduction" : "de rabais"}
              </div>
            </>
          )}
        </div>

        {/* Status badge */}
        {!isActive && (
          <div className="absolute top-3 right-4 bg-rose-600 shadow-md backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
            {isExpired ? "Expirée" : "Inactive"}
          </div>
        )}

        {/* Perforation effect at bottom */}
        {/* <div className="absolute -bottom-3 left-0 right-0 flex justify-center">
          <div className="flex space-x-2">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gray-50 rounded-full"
              ></div>
            ))}
          </div>
        </div> */}
      </div>
      <div className="relative z-[1] border-2 border-gray-500 border-dashed">
        <div className="absolute flex bg-gray-200 w-10 h-10 -left-5 -bottom-5 rounded-full"></div>
        <div className="absolute flex bg-gray-200 w-10 h-10 -right-5 -bottom-5 rounded-full"></div>
      </div>
      {/* Bottom section with info and actions */}
      <div className="grid  bg-white  relative items-center justify-center">
        
          <PromotionOverallImpact promotion={promotion as any} />
       
        {/* Description */}
        {/* <p className="text-sm text-gray-600 line-clamp-2">
        {promotion.description && (
          <div className="mb-2 bg-gray-100 border-gray-300 border p-2 rounded">
            {promotion.description}
            </div>
        )}
          </p> */}

        {/* Stats */}
        {/* <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500">Utilisateurs ciblés</div>
            <div className="text-lg font-bold text-gray-900">
              {promotion.targetedUsersCount !== undefined
                ? promotion.targetedUsersCount.toLocaleString()
                : "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Fois appliquée</div>
            <div className="text-lg font-bold text-gray-900">
              {promotion._count?.applied || 0}
            </div>
          </div>
        </div> */}

        {/* Dates */}
        {/* <div className="text-xs text-gray-500 py-2">
          Du {new Date(promotion.startsAt).toLocaleDateString("fr-FR")} au{" "}
          {new Date(promotion.endsAt).toLocaleDateString("fr-FR")}
        </div> */}

        {/* Expandable Details Section */}
        {/* <div className="flex flex-col h-full mb-6 justify-start items-start">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors py-2">
            <span>Détails de la promotion</span>
            {isExpanded ? (
              <MdExpandLess size={20} />
            ) : (
              <MdExpandMore size={20} />
            )}
          </button>

          {isExpanded && (
            <div className="transition-all duration-300 ease-in-out  mb-auto">
              <PromotionOverallImpact promotion={promotion as any} />
            </div>
          )}
        </div> */}
      </div>

      <div className="relative z-[1] border-b border-gray-500 border-dashed">
        <div className="absolute flex bg-gray-200 w-10 h-10 -left-5 -bottom-5 rounded-full"></div>
        <div className="absolute flex bg-gray-200 w-10 h-10 -right-5 -bottom-5 rounded-full"></div>
      </div>
      <div className="rounded-b-xl bg-white relative grid grid-cols-2 border-t border-dashed border-gray-500 text-xs">
        <div className="border-r border-dashed border-gray-500">
          <button
            onClick={() => onEdit(promotion.id)}
            className="flex flex-1 flex gap-2 items-center py-5 justify-center w-full h-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors">
            <MdEdit size={18} />
            <span>Modifier</span>
          </button>
        </div>
        <div className="">
          <button
            onClick={() => onDelete(promotion.id)}
            className="flex flex-1 gap-2 items-center py-5 justify-center w-full h-full bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors">
            <MdDelete size={18} />
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
