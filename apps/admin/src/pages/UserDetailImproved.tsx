import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useI18n } from "../lib/i18n";
import { api } from "../lib/api";
import PurchaseTimeline from "../components/PurchaseTimeline";
import ChapterAccessSummary from "../components/ChapterAccessSummary";
import PurchaseStatistics from "../components/PurchaseStatistics";
import PurchaseTimelineChart from "../components/PurchaseTimelineChart";
import PurchaseDistributionChart from "../components/PurchaseDistributionChart";
import AddEntitlementModal from "../components/AddEntitlementModal";
import AssignPromoModal from "../components/AssignPromoModal";
import {
  MdArrowBack,
  MdEmail,
  MdShoppingCart,
  MdEdit,
  MdSend,
  MdBarChart,
  MdPhone,
  MdBook,
  MdTimeline,
  MdBarChart as MdStats,
  MdLocalOffer,
} from "react-icons/md";

interface UserDetail {
  id: string;
  publicId: string;
  email: string;
  status: string;
  role: string;
  createdAt: string;
  orders: Order[];
  entitlements: Entitlement[];
  reads: VolumeRead[];
  sessions: Session[];
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
  chapter?: {
    id: string;
    title: string;
  } | null;
  volumeFrom?: number;
  volumeTo?: number;
}

interface Entitlement {
  id: string;
  chapterId: string;
  volumeFrom: number;
  volumeTo: number;
  versionScope: string;
  source: string;
  grantedAt: string;
  chapter: {
    id: string;
    title: string;
    status: string;
  };
}

interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
}

interface VolumeRead {
  id: string;
  chapterId: string;
  volumeNumber: number;
  firstOpenedAt: string;
  completedAt: string | null;
  chapter: {
    id: string;
    title: string;
  };
}

type TabType = 'overview' | 'purchases' | 'access';

export default function UserDetailImproved() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const locale =
    typeof navigator !== "undefined" && navigator.language
      ? navigator.language
      : "fr";

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAddEntitlementModal, setShowAddEntitlementModal] = useState(false);
  const [showAssignPromoModal, setShowAssignPromoModal] = useState(false);

  // Load user data
  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/${id}`);
      setUser(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement de l'utilisateur");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, [id]);

  // Handle status toggle (stub)
  const handleToggleStatus = () => {
    toast("Édition du statut à implémenter");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Vue d\'ensemble', icon: <MdStats size={20} /> },
    { id: 'purchases' as TabType, label: 'Historique d\'achats', icon: <MdTimeline size={20} /> },
    { id: 'access' as TabType, label: 'Accès aux chapitres', icon: <MdBook size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/users")}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition mb-6"
          title="Retour">
          <MdArrowBack className="text-xl text-gray-600" />
        </button>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - User Profile (Fixed) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-6">
              {/* Gradient Header */}
              <div className="h-24 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>

              {/* Avatar */}
              <div className="px-6 pb-6">
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {user.email[0].toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    {user.email.split("@")[0]}
                  </h2>
                  <p className="text-xs text-gray-500 mb-3">
                    ID: {user.publicId.slice(0, 12)}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                    <MdEmail size={16} />
                    <span className="text-xs">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <MdPhone size={16} />
                    <span className="text-xs">+33 6 XX XX XX XX</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4 flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <MdSend size={16} />
                    <span>Message</span>
                  </button>
                  <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <MdBarChart size={16} />
                    <span>Analytics</span>
                  </button>
                  <button
                    onClick={handleToggleStatus}
                    className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <MdEdit size={16} />
                    <span>Éditer</span>
                  </button>
                  <button
                    onClick={() => setShowAddEntitlementModal(true)}
                    className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <MdBook size={16} />
                    <span>+ Accès</span>
                  </button>
                  <button
                    onClick={() => setShowAssignPromoModal(true)}
                    className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <MdLocalOffer size={16} />
                    <span>+ Promo</span>
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {user.orders.filter(o => o.status === 'PAID').length}
                      </div>
                      <div className="text-xs text-gray-500">Achats</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {new Set(user.entitlements.map(e => e.chapterId)).size}
                      </div>
                      <div className="text-xs text-gray-500">Chapitres</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content with Tabs */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm mb-6 p-2">
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <MdStats className="text-blue-500" />
                      Statistiques d'achats
                    </h2>
                    <PurchaseStatistics
                      orders={user.orders}
                      entitlements={user.entitlements}
                      locale={locale}
                    />
                  </div>

                  {/* Charts */}
                  <PurchaseTimelineChart orders={user.orders} locale={locale} />
                  <PurchaseDistributionChart orders={user.orders} locale={locale} />
                </>
              )}

              {activeTab === 'purchases' && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <MdShoppingCart className="text-blue-500" />
                      Historique des achats
                    </h2>
                    <span className="text-sm text-gray-500">
                      {user.orders.length} transaction{user.orders.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <PurchaseTimeline
                    orders={user.orders}
                    entitlements={user.entitlements}
                    locale={locale}
                  />
                </div>
              )}

              {activeTab === 'access' && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <MdBook className="text-blue-500" />
                      Accès aux chapitres
                    </h2>
                    <button
                      onClick={() => setShowAddEntitlementModal(true)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      + Ajouter un accès
                    </button>
                  </div>
                  <ChapterAccessSummary
                    entitlements={user.entitlements}
                    reads={user.reads}
                    locale={locale}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Entitlement Modal */}
      {showAddEntitlementModal && (
        <AddEntitlementModal
          userId={user.id}
          onClose={() => setShowAddEntitlementModal(false)}
          onSuccess={() => {
            loadUser();
            setShowAddEntitlementModal(false);
          }}
        />
      )}

      {/* Assign Promo Modal */}
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
    </div>
  );
}
