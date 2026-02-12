import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import {
  MdAttachMoney,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdWarning,
  MdInfo,
} from "react-icons/md";

interface Refund {
  id: string;
  orderId: string;
  amountRefunded: number;
  currency: string;
  type: "FULL" | "PARTIAL";
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  reason?: string;
  notes?: string;
  providerRefundId?: string;
  revokeEntitlements: boolean;
  refundedAt: string;
  processedAt?: string;
  failureReason?: string;
}

interface RefundManagementProps {
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  orderStatus: string;
  onRefundCreated?: () => void;
}

export default function RefundManagement({
  orderId,
  orderAmount,
  orderCurrency,
  orderStatus,
  onRefundCreated,
}: RefundManagementProps) {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [totalRefunded, setTotalRefunded] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Refund form state
  const [refundAmount, setRefundAmount] = useState("");
  const [refundType, setRefundType] = useState<"FULL" | "PARTIAL">("FULL");
  const [refundReason, setRefundReason] = useState("");
  const [refundNotes, setRefundNotes] = useState("");
  const [revokeEntitlements, setRevokeEntitlements] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRefunds();
  }, [orderId]);

  const loadRefunds = async () => {
    try {
      const response = await api.get(`/admin/orders/${orderId}/refunds`);
      setRefunds(response.data.refunds || []);
      setTotalRefunded(response.data.totalRefunded || 0);
    } catch (error) {
      console.error("Error loading refunds:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "EUR") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(amount / 100);
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

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { label: string; color: string; icon: any }
    > = {
      COMPLETED: {
        label: "Remboursé",
        color: "bg-green-100 text-green-800",
        icon: MdCheckCircle,
      },
      PENDING: {
        label: "En attente",
        color: "bg-yellow-100 text-yellow-800",
        icon: MdPending,
      },
      FAILED: {
        label: "Échoué",
        color: "bg-red-100 text-red-800",
        icon: MdCancel,
      },
      CANCELLED: {
        label: "Annulé",
        color: "bg-gray-100 text-gray-800",
        icon: MdCancel,
      },
    };

    const { label, color, icon: Icon } = config[status] || config.PENDING;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}
      >
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const handleOpenRefundModal = () => {
    const remaining = orderAmount - totalRefunded;
    setRefundAmount((remaining / 100).toFixed(2));
    setRefundType("FULL");
    setRefundReason("");
    setRefundNotes("");
    setRevokeEntitlements(true);
    setShowRefundModal(true);
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const amountInCents = Math.round(parseFloat(refundAmount) * 100);
      const remaining = orderAmount - totalRefunded;

      if (amountInCents <= 0 || amountInCents > remaining) {
        toast.error(
          `Le montant doit être entre 0 et ${formatCurrency(
            remaining,
            orderCurrency
          )}`
        );
        setProcessing(false);
        return;
      }

      await api.post("/admin/refunds", {
        orderId,
        amountRefunded: amountInCents,
        type: refundType,
        reason: refundReason || undefined,
        notes: refundNotes || undefined,
        revokeEntitlements,
      });

      toast.success("Remboursement créé avec succès");
      setShowRefundModal(false);
      loadRefunds();
      if (onRefundCreated) onRefundCreated();
    } catch (error: any) {
      console.error("Error creating refund:", error);
      toast.error(
        error.response?.data?.error ||
          "Erreur lors de la création du remboursement"
      );
    } finally {
      setProcessing(false);
    }
  };

  const remainingAmount = orderAmount - totalRefunded;
  const canRefund = orderStatus === "PAID" && remainingAmount > 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MdAttachMoney className="w-6 h-6 text-green-600" />
            Remboursements
          </h2>
          {canRefund && (
            <button
              onClick={handleOpenRefundModal}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              <MdAttachMoney className="w-5 h-5" />
              Créer un remboursement
            </button>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Montant original</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(orderAmount, orderCurrency)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total remboursé</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalRefunded, orderCurrency)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Montant restant</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(remainingAmount, orderCurrency)}
            </p>
          </div>
        </div>

        {/* Refunds List */}
        {refunds.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MdInfo className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Aucun remboursement pour cette commande</p>
          </div>
        ) : (
          <div className="space-y-3">
            {refunds.map((refund) => (
              <div
                key={refund.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-gray-800">
                        {formatCurrency(refund.amountRefunded, refund.currency)}
                      </span>
                      {getStatusBadge(refund.status)}
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          refund.type === "FULL"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {refund.type === "FULL" ? "Complet" : "Partiel"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Date:</strong> {formatDate(refund.refundedAt)}
                      </p>
                      {refund.reason && (
                        <p>
                          <strong>Raison:</strong> {refund.reason}
                        </p>
                      )}
                      {refund.notes && (
                        <p>
                          <strong>Notes:</strong> {refund.notes}
                        </p>
                      )}
                      {refund.providerRefundId && (
                        <p className="font-mono text-xs">
                          <strong>ID Stripe:</strong> {refund.providerRefundId}
                        </p>
                      )}
                      {refund.failureReason && (
                        <p className="text-red-600">
                          <MdWarning className="inline w-4 h-4 mr-1" />
                          <strong>Erreur:</strong> {refund.failureReason}
                        </p>
                      )}
                      <p>
                        <strong>Révocation des droits:</strong>{" "}
                        {refund.revokeEntitlements ? "Oui" : "Non"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MdAttachMoney className="w-7 h-7 text-red-600" />
              Créer un remboursement
            </h3>

            <form onSubmit={handleSubmitRefund}>
              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={remainingAmount / 100}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="10.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {formatCurrency(remainingAmount, orderCurrency)}
                </p>
              </div>

              {/* Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de remboursement *
                </label>
                <select
                  value={refundType}
                  onChange={(e) =>
                    setRefundType(e.target.value as "FULL" | "PARTIAL")
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="FULL">Complet</option>
                  <option value="PARTIAL">Partiel</option>
                </select>
              </div>

              {/* Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison
                </label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Demande du client"
                />
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes internes
                </label>
                <textarea
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Notes pour l'équipe..."
                />
              </div>

              {/* Revoke Entitlements */}
              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={revokeEntitlements}
                    onChange={(e) => setRevokeEntitlements(e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">
                    Révoquer les droits d'accès
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  L'utilisateur perdra l'accès au contenu acheté
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {processing ? "Traitement..." : "Rembourser"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
