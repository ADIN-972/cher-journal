import { Fragment, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import AddEntitlementModal from "../components/AddEntitlementModal";
import AssignPromoModal from "../components/AssignPromoModal";
import ConnectionStatsChart from "../components/ConnectionStatsChart";

// --- Interfaces (shared with UserDetailImproved) ---

interface Promotion {
  id: string;
  name: string;
  description?: string;
  scope: string;
  type: string;
  value?: number;
  code?: string;
  targetType: string;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
  maxUses?: number | null;
  perUserLimit?: number | null;
  _count?: { orders: number };
}

interface AssignedPromotion {
  id: string;
  appliedAt: string;
  promotion: Promotion;
}

interface SubscriptionInfo {
  id: string;
  status: string;
  planName: string;
  priceAmountCents: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string | null;
}

interface Order {
  id: string;
  type: string;
  status: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
  appliedPromotionId?: string | null;
  provider?: string;
  chapter?: { id: string; title: string } | null;
  volumeFrom?: number;
  volumeTo?: number;
  appliedPromotion?: {
    id: string;
    name: string;
    description?: string;
    type: string;
    value?: number;
    scope: string;
  } | null;
}

interface Entitlement {
  id: string;
  chapterId: string;
  volumeFrom: number;
  volumeTo: number;
  scopes: string[];
  source: string;
  grantedAt: string;
  chapter: { id: string; title: string; status: string };
}

interface VolumeRead {
  id: string;
  chapterId: string;
  volumeNumber: number;
  perspective: "NARRATOR" | "PROTAGONIST";
  progress: number;
  firstOpenedAt: string;
  completedAt: string | null;
  chapter: { id: string; title: string; protagonistName: string };
}

interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
}

interface VolumeAccessPerspective {
  isAccessible: boolean;
  blockageType: string | null;
}

interface UserChapterVolume {
  id: string;
  volumeNumber: number;
  title: string;
  isFree: boolean;
  illustrationAsset?: { id: string; url: string } | null;
  accessByPerspective: {
    NARRATOR: VolumeAccessPerspective;
    PROTAGONIST: VolumeAccessPerspective;
  };
  progressByPerspective: Record<string, number>;
  timeSpentByPerspective: Record<string, number>;
  completedAt: string | null;
}

interface UserChapter {
  id: string;
  title: string;
  protagonistName: string;
  status: string;
  coverAsset?: { id: string; url: string } | null;
  totalVolumes: number;
  volumes: UserChapterVolume[];
}

interface UserDetail {
  id: string;
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string | null;
  status: string;
  role: string;
  createdAt: string;
  orders: Order[];
  entitlements: Entitlement[];
  reads: VolumeRead[];
  sessions: Session[];
  subscription?: SubscriptionInfo | null;
  applicablePromotions?: Promotion[];
  appliedPromotions?: AssignedPromotion[];
}

// --- Helpers ---

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimeSpent(seconds: number): string {
  if (seconds === 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}m`;
  if (m > 0) return `${m}m${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

function formatPrice(cents: number) {
  return `${(cents / 100).toFixed(2)} EUR`;
}

const SOURCE_LABELS: Record<string, string> = {
  PURCHASE: "Achat",
  SUBSCRIPTION: "Abonnement",
  PREORDER: "Pre-commande",
  PACK: "Pack",
  PROMOTION: "Promotion",
};

const SOURCE_COLORS: Record<string, string> = {
  PURCHASE: "border-l-gold",
  SUBSCRIPTION: "border-l-purple-500",
  PREORDER: "border-l-blue-400",
  PACK: "border-l-green-500",
  PROMOTION: "border-l-amber-500",
};

const SOURCE_TEXT: Record<string, string> = {
  PURCHASE: "text-gold",
  SUBSCRIPTION: "text-purple-600",
  PREORDER: "text-blue-500",
  PACK: "text-green-600",
  PROMOTION: "text-amber-600",
};

// --- Component ---

export default function UserDetailV2() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [chapters, setChapters] = useState<UserChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [showAddEntitlementModal, setShowAddEntitlementModal] = useState(false);
  const [showAssignPromoModal, setShowAssignPromoModal] = useState(false);
  const [showClubModal, setShowClubModal] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });
  const [clubForm, setClubForm] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    infinite: true,
    reason: "",
  });

  const loadUser = async () => {
    setLoading(true);
    try {
      const [userRes, chaptersRes] = await Promise.all([
        api.get(`/admin/users/${id}`),
        api.get(`/admin/users/${id}/chapters`),
      ]);
      setUser(userRes.data);
      setChapters(chaptersRes.data);
    } catch {
      toast.error("Erreur lors du chargement");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  const isClubActive =
    user?.subscription?.status === "ACTIVE" &&
    new Date(user.subscription.currentPeriodEnd) > new Date();

  const handleGrantClub = async () => {
    try {
      await api.post(`/admin/users/${id}/club`, {
        startDate: clubForm.startDate,
        endDate: clubForm.infinite ? null : clubForm.endDate || null,
        reason: clubForm.reason || undefined,
      });
      toast.success("Acces Club Prive accorde");
      setShowClubModal(false);
      loadUser();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'attribution");
    }
  };

  const handleRevokeClub = async () => {
    if (!confirm("Revoquer l'acces Club Prive ?")) return;
    try {
      await api.delete(`/admin/users/${id}/club`);
      toast.success("Acces Club Prive revoque");
      loadUser();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  const handleSuspend = async () => {
    if (!confirm("Suspendre cet utilisateur ?")) return;
    try {
      const newStatus = user?.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await api.patch(`/admin/users/${id}`, { status: newStatus });
      toast.success(
        newStatus === "ACTIVE" ? "Utilisateur active" : "Utilisateur suspendu",
      );
      loadUser();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  const openEditDrawer = () => {
    if (!user) return;
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.email || "",
    });
    setShowEditDrawer(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.patch(`/admin/users/${id}`, editForm);
      toast.success("Utilisateur mis a jour");
      setShowEditDrawer(false);
      loadUser();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise a jour");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  // --- Computed data ---
  const paidOrders = user.orders.filter((o) => o.status === "PAID");
  const totalSpent = paidOrders.reduce((s, o) => s + (o.amountTotal || 0), 0);
  const uniqueChapters = new Set(user.entitlements.map((e) => e.chapterId))
    .size;
  const totalVolumesRead = user.reads.filter((r) => r.completedAt).length;
  const totalReads = user.reads.length;
  const completionRate =
    totalReads > 0 ? Math.round((totalVolumesRead / totalReads) * 100) : 0;

  // Build chapter lookup from admin chapters data
  const chapterLookup = new Map<string, UserChapter>();
  chapters.forEach((ch) => chapterLookup.set(ch.id, ch));

  // Group reads by chapter, sorted by volume number
  const readsByChapter: {
    chapterId: string;
    title: string;
    protagonistName: string;
    coverUrl: string | null;
    totalVolumes: number;
    reads: VolumeRead[];
  }[] = [];
  const chapterMap = new Map<string, VolumeRead[]>();
  user.reads.forEach((r) => {
    if (!chapterMap.has(r.chapterId)) chapterMap.set(r.chapterId, []);
    chapterMap.get(r.chapterId)!.push(r);
  });
  chapterMap.forEach((reads, chapterId) => {
    const sorted = [...reads].sort((a, b) => a.volumeNumber - b.volumeNumber);
    const chInfo = chapterLookup.get(chapterId);
    readsByChapter.push({
      chapterId,
      title: chInfo?.title || sorted[0].chapter.title,
      protagonistName: chInfo?.protagonistName || sorted[0].chapter.protagonistName,
      coverUrl: chInfo?.coverAsset?.url || null,
      totalVolumes: chInfo?.totalVolumes || Math.max(...sorted.map((r) => r.volumeNumber)),
      reads: sorted,
    });
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  const name = user.username || `${user.firstName} ${user.lastName}`.trim() || user.email;

  return (
    <main className="min-h-screen p-6 lg:p-10">
      {/* Back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate("/users")}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition flex-shrink-0">
          <span className="material-symbols-outlined text-xl text-gray-600">arrow_back</span>
        </button>
        <span className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Detail utilisateur</span>
      </div>

      {/* ===== HEADER ===== */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-14">
        <div className="relative">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl" />
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl border border-primary/20 p-1 bg-white shadow-sm flex items-center justify-center">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-4xl font-bold">
                  {name[0].toUpperCase()}
                </div>
              </div>
              <div
                className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase shadow-lg ${
                  user.status === "ACTIVE"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}>
                {user.status === "ACTIVE" ? "Actif" : "Suspendu"}
              </div>
            </div>
            {/* Name & info */}
            <div className="flex flex-col min-w-[260px]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-1">
                Membre depuis {formatDate(user.createdAt)}
              </p>
              <h1 className="text-2xl lg:text-5xl  italic text-primary mb-1 tracking-tight newsreader">
                {name}
              </h1>
              {user.username && (
                <p className="text-sm text-primary/60 font-medium mb-1">
                  @{user.username}
                </p>
              )}
              <p className="text-sm text-gray-500 mb-2">{user.email}</p>
              {isClubActive && (
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200">
                  <span className="material-symbols-outlined text-purple-600 text-sm mr-2">
                    workspace_premium
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-purple-700">
                    Membre Club Prive
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openEditDrawer}
            className="px-5 py-2 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-all flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">edit</span>
            Modifier
          </button>
          <button
            type="button"
            onClick={() => setShowAddEntitlementModal(true)}
            className="px-5 py-2 rounded-full bg-primary text-white hover:brightness-110 transition-all flex items-center gap-2 text-xs font-semibold uppercase tracking-widest shadow-md">
            <span className="material-symbols-outlined text-sm">book</span> +
            Acces
          </button>
          <button
            type="button"
            onClick={() => setShowAssignPromoModal(true)}
            className="px-5 py-2 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-all flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">
              local_offer
            </span>{" "}
            + Promo
          </button>
          <button
            type="button"
            onClick={() =>
              isClubActive ? handleRevokeClub() : setShowClubModal(true)
            }
            className="px-5 py-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-all text-gray-700 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest border border-primary/5">
            <span className="material-symbols-outlined text-sm text-purple-600">
              verified_user
            </span>
            Club :{" "}
            <span
              className={
                isClubActive ? "text-purple-600 font-bold" : "text-gray-400"
              }>
              {isClubActive ? "Actif" : "Inactif"}
            </span>
            {isClubActive ? (  <span className="border-2 border-red-400 rounded-full w-6 h-6 flex items-center justify-center text-red-400 text-xs font-bold">
              x
            </span>): (  <span className="border-2 border-green-400 rounded-full w-6 h-6 flex items-center justify-center text-green-400 text-xs font-bold">
              +
            </span>)}
          
          </button>
          <button
            type="button"
            onClick={handleSuspend}
            className="px-5 py-2 rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">
              {user.status === "ACTIVE" ? "block" : "check_circle"}
            </span>
            {user.status === "ACTIVE" ? "Suspendre" : "Reactiver"}
          </button>
        </div>
      </header>

      {/* ===== BENTO GRID: METRICS + PROMOTIONS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-12">
        {/* Total Invested */}
        <div className="md:col-span-3 p-7 rounded-2xl bg-white border border-gray-100 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-100 group-hover:bg-primary transition-colors" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
            Total depense
          </p>
          <h3 className="text-3xl font-bold text-primary">
            {formatPrice(totalSpent)}
          </h3>
          <div className="mt-5 text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
            {paidOrders.length} commande{paidOrders.length !== 1 ? "s" : ""}{" "}
            payee{paidOrders.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Archives Owned */}
        <div className="md:col-span-3 p-7 rounded-2xl bg-white border border-gray-100 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-100 group-hover:bg-primary transition-colors" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
            Chapitres accessibles
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">
              {uniqueChapters}
            </h3>
            <span className="text-xs font-semibold text-gray-400">
              CHAPITRES
            </span>
          </div>
          <div className="mt-5 text-[10px] text-gray-400 font-semibold uppercase">
            {user.entitlements.length} entitlement
            {user.entitlements.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Promotions & Benefits */}
        <div className="md:col-span-6 row-span-2 p-7 rounded-2xl bg-white border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold italic text-gray-700">
              Promotions & Avantages
            </h2>
            <button
              type="button"
              onClick={() => setShowAssignPromoModal(true)}
              className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/10">
              + Assigner
            </button>
          </div>

          {/* Applied promotions */}
          <div className="space-y-3 mb-6">
            {(user.appliedPromotions || []).length === 0 && (
              <p className="text-xs text-gray-400 italic">
                Aucune promotion appliquee
              </p>
            )}
            {(user.appliedPromotions || []).map((ap) => (
              <div
                key={ap.id}
                className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">
                      {ap.promotion.type === "PERCENT"
                        ? "percent"
                        : ap.promotion.type === "FREE"
                          ? "card_giftcard"
                          : "savings"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {ap.promotion.name}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                      Appliquee le {formatDate(ap.appliedAt)}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                  {ap.promotion.type === "PERCENT" && ap.promotion.value
                    ? `${ap.promotion.value}% OFF`
                    : ap.promotion.type === "FREE"
                      ? "GRATUIT"
                      : ap.promotion.type}
                </span>
              </div>
            ))}
          </div>

          {/* Available promotions */}
          {(user.applicablePromotions || []).length > 0 && (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
                Disponibles pour cet utilisateur
              </p>
              <div className="flex flex-wrap gap-2">
                {(user.applicablePromotions || []).map((p) => (
                  <span
                    key={p.id}
                    className="px-3 py-1.5 rounded-lg bg-gray-50 text-[10px] font-medium text-gray-500 border border-gray-100">
                    {p.code || p.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Volumes lus */}
        <div className="md:col-span-3 p-7 rounded-2xl bg-white border border-gray-100 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-100 group-hover:bg-primary transition-colors" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
            Volumes lus
          </p>
          <h3 className="text-3xl font-bold text-gray-900">
            {totalVolumesRead}
          </h3>
          <p className="mt-5 text-[10px] text-gray-400 font-semibold uppercase">
            sur {totalReads} commence{totalReads !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Completion rate */}
        <div className="md:col-span-3 p-7 rounded-2xl bg-white border border-gray-100 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-100 group-hover:bg-primary transition-colors" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
            Taux de completion
          </p>
          <h3 className="text-3xl font-bold text-gray-900">
            {completionRate}%
          </h3>
          <div className="mt-5 w-full bg-gray-100 h-1 rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* ===== SPECIAL ACCESS MANAGEMENT ===== */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold italic text-gray-800">
              Gestion des acces
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Entitlements accordes a cet utilisateur.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddEntitlementModal(true)}
            className="px-5 py-2 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-sm">
            + Ajouter un acces
          </button>
        </div>

        {user.entitlements.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-8 text-center">
            Aucun entitlement
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {user.entitlements.map((ent) => (
              <div
                key={ent.id}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const ch = chapterLookup.get(ent.chapterId);
                    const cover = ch?.coverAsset?.url || null;
                    return cover ? (
                      <img src={cover} alt={ent.chapter.title} className="w-12 h-16 rounded-md object-cover border border-gray-100 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-16 bg-gray-50 rounded-md overflow-hidden border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary/40 text-2xl">auto_stories</span>
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-xs font-bold text-gray-800 line-clamp-1">
                      {ent.chapter.title}
                    </p>
                    <p className="text-[10px] text-primary font-semibold uppercase tracking-tight">
                      Vol. {ent.volumeFrom}-{ent.volumeTo}
                    </p>
                    <p className="text-[9px] text-gray-400 uppercase">
                      {ent.scopes.join(", ")} -{" "}
                      {SOURCE_LABELS[ent.source] || ent.source}
                    </p>
                  </div>
                </div>
                <div
                  className="w-3 h-3 rounded-full bg-green-400"
                  title="Actif"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== READING ANALYTICS + ACCESS LEDGER ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Reading Breakdown Table */}
        <div className="lg:col-span-2">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-xl font-bold italic text-gray-800">
              Historique de lecture
            </h2>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
              Par volume
            </span>
          </div>

          {user.reads.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-8 text-center bg-white rounded-2xl border border-gray-100">
              Aucune lecture enregistree
            </p>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                      Volume
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                      Perspective
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-center">
                      Progression
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-right">
                      Temps de lecture
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {readsByChapter.map((group) => {
                    const isExpanded = expandedChapters.has(group.chapterId);
                    const narratorReads = group.reads.filter((r) => r.perspective === "NARRATOR");
                    const protagonistReads = group.reads.filter((r) => r.perspective === "PROTAGONIST");

                    // Get total volumes per perspective from the chapter data
                    const chData = chapterLookup.get(group.chapterId);
                    const totalNarratorVolumes = chData?.totalVolumes ?? group.totalVolumes;
                    const totalProtagonistVolumes = chData
                      ? chData.volumes.filter((v) => v.accessByPerspective?.PROTAGONIST !== undefined).length
                      : group.totalVolumes;

                    // Chapter progress = sum of each volume's progress / (totalVolumes per perspective)
                    const narratorProgress = totalNarratorVolumes > 0
                      ? Math.round(narratorReads.reduce((s, r) => s + r.progress, 0) / totalNarratorVolumes)
                      : 0;
                    const protagonistProgress = totalProtagonistVolumes > 0
                      ? Math.round(protagonistReads.reduce((s, r) => s + r.progress, 0) / totalProtagonistVolumes)
                      : 0;
                    return (
                      <Fragment key={group.chapterId}>
                        {/* Chapter header row */}
                        <tr
                          className="bg-gray-50/80 hover:bg-gray-100/80 cursor-pointer transition-colors border-t border-gray-100"
                          onClick={() => toggleChapter(group.chapterId)}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <span className={`material-symbols-outlined text-sm text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                                chevron_right
                              </span>
                              {group.coverUrl ? (
                                <img
                                  src={group.coverUrl}
                                  alt={group.title}
                                  className="w-8 h-11 rounded object-cover border border-gray-100 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-11 rounded bg-gray-100 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                  <span className="material-symbols-outlined text-gray-300 text-sm">auto_stories</span>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-gray-800">{group.title}</p>
                                <p className="text-[10px] text-gray-400">
                                  {group.protagonistName} — {totalNarratorVolumes} volume{totalNarratorVolumes !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="space-y-1">
                              {narratorReads.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-primary text-xs">menu_book</span>
                                  <span className="text-[10px] text-gray-500 font-semibold">{narratorReads.length}/{totalNarratorVolumes} vol.</span>
                                </div>
                              )}
                              {protagonistReads.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-pink-500 text-xs">person</span>
                                  <span className="text-[10px] text-gray-500 font-semibold">{protagonistReads.length}/{totalProtagonistVolumes} vol.</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="space-y-1.5">
                              {narratorReads.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-primary text-xs">menu_book</span>
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-primary" style={{ width: `${narratorProgress}%` }} />
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-600 w-8 text-right">{narratorProgress}%</span>
                                </div>
                              )}
                              {protagonistReads.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-pink-500 text-xs">person</span>
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-pink-500" style={{ width: `${protagonistProgress}%` }} />
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-600 w-8 text-right">{protagonistProgress}%</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="space-y-1">
                              {narratorReads.length > 0 && (() => {
                                const totalNarratorSeconds = chData?.volumes.reduce(
                                  (s, v) => s + (v.timeSpentByPerspective?.NARRATOR || 0), 0
                                ) || 0;
                                return (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <span className="material-symbols-outlined text-primary text-xs">menu_book</span>
                                    <span className="text-[10px] text-gray-600 font-semibold">{formatTimeSpent(totalNarratorSeconds)}</span>
                                  </div>
                                );
                              })()}
                              {protagonistReads.length > 0 && (() => {
                                const totalProtaSeconds = chData?.volumes.reduce(
                                  (s, v) => s + (v.timeSpentByPerspective?.PROTAGONIST || 0), 0
                                ) || 0;
                                return (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <span className="material-symbols-outlined text-pink-500 text-xs">person</span>
                                    <span className="text-[10px] text-gray-600 font-semibold">{formatTimeSpent(totalProtaSeconds)}</span>
                                  </div>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>

                        {/* Volume rows (visible when expanded) */}
                        {isExpanded &&
                          group.reads.map((read) => (
                            <tr
                              key={read.id}
                              className="hover:bg-gray-50/50 transition-colors border-t border-gray-50"
                            >
                              <td className="px-5 py-2.5 pl-12">
                                <p className="text-sm text-gray-700">
                                  Vol. {read.volumeNumber}
                                </p>
                              </td>
                              <td className="px-5 py-2.5">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    read.perspective === "PROTAGONIST"
                                      ? "bg-pink-50 text-pink-600 border border-pink-200"
                                      : "bg-primary/10 text-primary border border-primary/20"
                                  }`}
                                >
                                  {read.perspective === "PROTAGONIST" ? "Protagoniste" : "Narrateur"}
                                </span>
                              </td>
                              <td className="px-5 py-2.5">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${read.completedAt ? "bg-green-500" : "bg-primary"}`}
                                      style={{ width: `${read.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-gray-700">{read.progress}%</span>
                                </div>
                              </td>
                              <td className="px-5 py-2.5 text-right text-xs font-semibold text-gray-600">
                                {(() => {
                                  const vol = chData?.volumes.find(
                                    (v) => v.volumeNumber === read.volumeNumber
                                  );
                                  const seconds = vol?.timeSpentByPerspective?.[read.perspective] || 0;
                                  return formatTimeSpent(seconds);
                                })()}
                              </td>
                            </tr>
                          ))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Access Ledger */}
        <div className="lg:col-span-1">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-xl font-bold italic text-gray-800">
              Journal des acces
            </h2>
            <span className="material-symbols-outlined text-primary text-sm">
              history
            </span>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {/* Entitlements as ledger items */}
            {user.entitlements.map((ent) => (
              <div
                key={ent.id}
                className={`p-4 rounded-xl bg-white border border-gray-100 border-l-4 shadow-sm ${
                  SOURCE_COLORS[ent.source] || "border-l-gray-300"
                }`}>
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      SOURCE_TEXT[ent.source] || "text-gray-500"
                    }`}>
                    {SOURCE_LABELS[ent.source] || ent.source}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">
                    {formatDate(ent.grantedAt)}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-800">
                  {ent.chapter.title}
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Vol. {ent.volumeFrom}-{ent.volumeTo} ({ent.scopes.join(", ")})
                </p>
              </div>
            ))}

            {/* Orders as ledger items */}
            {paidOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-white border border-gray-100 border-l-4 border-l-gold shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
                    Paiement
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-800">
                  {order.chapter?.title || `Commande #${order.id.slice(0, 8)}`}
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {formatPrice(order.amountTotal)}
                </p>
              </div>
            ))}

            {user.entitlements.length === 0 && paidOrders.length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-6">
                Aucun historique
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ===== SESSIONS ===== */}
      <section className="mb-12">
        <h2 className="text-xl font-bold italic text-gray-800 mb-5">
          Sessions actives
        </h2>
        {user.sessions.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Aucune session</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {user.sessions.slice(0, 8).map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                  Session
                </p>
                <p className="text-xs font-mono text-gray-600 truncate">
                  {s.id.slice(0, 16)}...
                </p>
                <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                  <span>Cree: {formatDate(s.createdAt)}</span>
                  <span>Exp: {formatDate(s.expiresAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== DANGER ZONE ===== */}
      <footer className="mt-16 pt-8 border-t border-gray-100">
        <div className="bg-red-50 rounded-2xl p-7 flex flex-col md:flex-row items-center justify-between gap-6 border border-red-100">
          <div>
            <h4 className="text-lg font-bold text-red-700 mb-1">
              Zone de danger
            </h4>
            <p className="text-sm text-gray-500">
              La suspension permanente revoquera tous les acces immediatement.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSuspend}
            className="px-7 py-3 bg-red-600 text-white rounded-full font-semibold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-sm">
            {user.status === "ACTIVE"
              ? "Suspendre le membre"
              : "Reactiver le membre"}
          </button>
        </div>
      </footer>

      {/* ===== MODALS ===== */}

      {/* Add Entitlement */}
      {showAddEntitlementModal && (
        <AddEntitlementModal
          isOpen={showAddEntitlementModal}
          userId={user.id}
          onClose={() => setShowAddEntitlementModal(false)}
          onSuccess={() => {
            loadUser();
            setShowAddEntitlementModal(false);
          }}
        />
      )}

      {/* Assign Promo */}
      {showAssignPromoModal && (
        <AssignPromoModal
          userId={user.id}
          userEmail={user.email}
          onClose={() => setShowAssignPromoModal(false)}
          onSuccess={() => {
            loadUser();
            setShowAssignPromoModal(false);
          }}
        />
      )}

      {/* Club Grant Modal */}
      {showClubModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-purple-600 text-2xl">
                workspace_premium
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                Attribuer le Club Prive
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Attribuer manuellement l'acces Club Prive a{" "}
              <strong>{user.email}</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de debut
                </label>
                <input
                  type="date"
                  value={clubForm.startDate}
                  onChange={(e) =>
                    setClubForm({ ...clubForm, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={clubForm.infinite}
                  onChange={(e) =>
                    setClubForm({ ...clubForm, infinite: e.target.checked })
                  }
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                Acces illimite (sans date d'expiration)
              </label>
              {!clubForm.infinite && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration
                  </label>
                  <input
                    type="date"
                    value={clubForm.endDate}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison (optionnel)
                </label>
                <input
                  type="text"
                  value={clubForm.reason}
                  onChange={(e) =>
                    setClubForm({ ...clubForm, reason: e.target.value })
                  }
                  placeholder="Ex: Offert, Partenariat, Test..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowClubModal(false)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                Annuler
              </button>
              <button
                type="button"
                onClick={handleGrantClub}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                Attribuer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Stats Chart */}
      <div className="mt-10">
        <ConnectionStatsChart />
      </div>

      {/* Edit User Drawer */}
      {showEditDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowEditDrawer(false)}
          />
          <div className="relative w-full max-w-lg bg-white shadow-2xl animate-slide-in-right overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Modifier l'utilisateur</h2>
                <p className="text-sm text-gray-400 mt-1">Informations de base</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditDrawer(false)}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-8 py-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prenom</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="Prenom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="Nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom d'utilisateur</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="@username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-500 text-sm">
                  {user?.email}
                  <span className="ml-2 text-[10px] text-gray-400 uppercase tracking-wider">(non modifiable)</span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowEditDrawer(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 py-3 bg-primary hover:brightness-110 text-white rounded-xl font-medium transition-all shadow-md">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
