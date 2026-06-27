import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTransfer,
  submitTransfer,
  validateTransfer,
  receiveTransfer,
  cancelTransfer,
  deleteTransfer,
} from "../../api/transfers.api";
import { formatDate } from "../../lib/utils";
import {
  ArrowLeftRight,
  ArrowLeft,
  CheckCircle,
  PackageCheck,
  XCircle,
  ChevronRight,
  Clock,
  Truck,
  Ban,
  Package,
  Warehouse,
  FileText,
  Calendar,
  Hash,
  AlertTriangle,
  Loader2,
  User,
  ShieldCheck,
  Send,
} from "lucide-react";

// ─── State Machine Definition ──────────────────────────────────────────────────

const STATES = [
  {
    key: "brouillon",
    label: "Brouillon",
    icon: FileText,
    color: "gray",
    description: "Transfert en cours de préparation",
  },
  {
    key: "en_attente",
    label: "En attente",
    icon: Clock,
    color: "amber",
    description: "Soumis, en attente de validation",
  },
  {
    key: "valide",
    label: "Validé",
    icon: CheckCircle,
    color: "blue",
    description: "Validé, stock source réservé",
  },
  {
    key: "recu",
    label: "Réceptionné",
    icon: PackageCheck,
    color: "green",
    description: "Marchandises reçues en destination",
  },
];

const COLOR_MAP = {
  gray: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    ring: "ring-gray-300",
    dot: "bg-gray-400",
    line: "bg-gray-200",
  },
  amber: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    ring: "ring-amber-300",
    dot: "bg-amber-400",
    line: "bg-amber-200",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    ring: "ring-blue-300",
    dot: "bg-blue-500",
    line: "bg-blue-200",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-700",
    ring: "ring-green-300",
    dot: "bg-green-500",
    line: "bg-green-200",
  },
  red: {
    bg: "bg-red-100",
    text: "text-red-700",
    ring: "ring-red-300",
    dot: "bg-red-500",
    line: "bg-red-200",
  },
};

// ─── Action Definitions per state ─────────────────────────────────────────────

function getActions(statut) {
  if (statut === "brouillon")
    return [
      {
        key: "submit",
        label: "Soumettre",
        description:
          "Envoyer ce transfert pour validation par le gestionnaire.",
        icon: ChevronRight,
        style: "primary",
        confirmTitle: "Soumettre le transfert ?",
        confirmMsg:
          "Le transfert sera envoyé en attente de validation. Vous ne pourrez plus modifier les articles.",
      },
      {
        key: "cancel",
        label: "Annuler le transfert",
        description: "Supprimer définitivement ce brouillon.",
        icon: XCircle,
        style: "danger",
        confirmTitle: "Annuler ce transfert ?",
        confirmMsg:
          "Cette action est irréversible. Le brouillon sera supprimé.",
      },
    ];
  if (statut === "en_attente")
    return [
      {
        key: "validate",
        label: "Valider",
        description: "Approuver le transfert. Le stock source sera réservé.",
        icon: CheckCircle,
        style: "primary",
        confirmTitle: "Valider le transfert ?",
        confirmMsg:
          "Les quantités seront réservées dans l'entrepôt source immédiatement.",
      },
      {
        key: "cancel",
        label: "Annuler le transfert",
        description:
          "Rejeter la demande. Aucun mouvement de stock ne sera créé.",
        icon: XCircle,
        style: "danger",
        confirmTitle: "Annuler ce transfert ?",
        confirmMsg:
          "Le transfert sera annulé et aucun mouvement de stock ne sera effectué.",
      },
    ];
  if (statut === "valide")
    return [
      {
        key: "receive",
        label: "Réceptionner",
        description:
          "Confirmer la réception en destination. Clôture définitive du transfert.",
        icon: PackageCheck,
        style: "success",
        confirmTitle: "Confirmer la réception ?",
        confirmMsg:
          "Les marchandises seront enregistrées dans l'entrepôt destination. Cette action est irréversible.",
      },
      {
        key: "cancel",
        label: "Annuler le transfert",
        description: "Le stock sera ré-entré dans la source.",
        icon: XCircle,
        style: "danger",
        confirmTitle: "Annuler un transfert validé ?",
        confirmMsg:
          "Le stock réservé sera libéré et ré-intégré dans l'entrepôt source.",
      },
    ];
  return [];
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatePipeline({ statut }) {
  if (statut === "annule") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Ban size={18} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700">Transfert annulé</p>
          <p className="text-xs text-red-500 mt-0.5">
            Ce transfert a été annulé. Aucune action supplémentaire n'est
            possible.
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = STATES.findIndex((s) => s.key === statut);

  return (
    <div className="relative">
      <div className="flex items-start">
        {STATES.map((state, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;
          const colors = COLOR_MAP[isCurrent ? state.color : isDone ? "green" : "gray"];
          const Icon = state.icon;

          return (
            <div
              key={state.key}
              className="flex-1 flex flex-col items-center relative"
            >
              {/* Connector line left */}
              {idx > 0 && (
                <div
                  className={`absolute left-0 top-4 w-1/2 h-0.5 ${isDone || isCurrent ? "bg-green-300" : "bg-gray-200"}`}
                />
              )}
              {/* Connector line right */}
              {idx < STATES.length - 1 && (
                <div
                  className={`absolute right-0 top-4 w-1/2 h-0.5 ${isDone ? "bg-green-300" : "bg-gray-200"}`}
                />
              )}

              {/* Node */}
              <div
                className={`
                relative z-10 w-8 h-8 rounded-full flex items-center justify-center ring-2 transition-all
                ${isCurrent ? `${COLOR_MAP[state.color].bg} ${COLOR_MAP[state.color].ring}` : ""}
                ${isDone ? "bg-green-100 ring-green-300" : ""}
                ${isPending ? "bg-gray-100 ring-gray-200" : ""}
              `}
              >
                {isDone ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <Icon
                    size={15}
                    className={
                      isCurrent ? COLOR_MAP[state.color].text : "text-gray-400"
                    }
                  />
                )}
              </div>

              {/* Label */}
              <p
                className={`mt-2 text-xs font-semibold text-center leading-tight ${
                  isCurrent
                    ? COLOR_MAP[state.color].text
                    : isDone
                      ? "text-green-600"
                      : "text-gray-400"
                }`}
              >
                {state.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-gray-400 text-center mt-0.5 leading-tight max-w-[80px]">
                  {state.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionCard({ action, onTrigger, loading }) {
  const styleMap = {
    primary: {
      card: "border-primary-200 bg-primary-50 hover:bg-primary-100",
      btn: "bg-primary-600 hover:bg-primary-700 text-white",
      icon: "text-primary-600 bg-primary-100",
    },
    success: {
      card: "border-green-200 bg-green-50 hover:bg-green-100",
      btn: "bg-green-600 hover:bg-green-700 text-white",
      icon: "text-green-600 bg-green-100",
    },
    danger: {
      card: "border-red-100 bg-white hover:bg-red-50",
      btn: "border border-red-200 text-red-600 hover:bg-red-50",
      icon: "text-red-500 bg-red-100",
    },
  };
  const s = styleMap[action.style];
  const Icon = action.icon;

  return (
    <div className={`rounded-xl border p-4 transition-colors ${s.card}`}>
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.icon}`}
        >
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{action.label}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {action.description}
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => onTrigger(action)}
          disabled={loading}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            ${s.btn}
          `}
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Icon size={13} />
          )}
          {action.label}
        </button>
      </div>
    </div>
  );
}

function ConfirmOverlay({ action, onConfirm, onCancel, loading }) {
  if (!action) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {action.confirmTitle}
          </h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {action.confirmMsg}
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Retour
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`
              inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors
              disabled:opacity-60
              ${
                action.style === "danger"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : action.style === "success"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-primary-600 hover:bg-primary-700 text-white"
              }
            `}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoGrid({ transfer }) {
  const items = [
    { icon: Hash, label: "Référence", value: transfer.reference || "—" },
    {
      icon: Calendar,
      label: "Date création",
      value: formatDate(transfer.created_at),
    },
    {
      icon: Warehouse,
      label: "Source",
      value: transfer.source_warehouse?.nom || "—",
    },
    {
      icon: Truck,
      label: "Destination",
      value: transfer.dest_warehouse?.nom || "—",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="bg-gray-50 rounded-xl p-3 border border-gray-100"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Icon size={12} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {label}
            </p>
          </div>
          <p className="text-sm font-semibold text-gray-800">{value}</p>
        </div>
      ))}
      {transfer.note && (
        <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="flex items-center gap-1.5 mb-1">
            <FileText size={12} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Note
            </p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {transfer.note}
          </p>
        </div>
      )}
    </div>
  );
}

function ItemsTable({ items }) {
  if (!items?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <Package size={32} className="mb-2 opacity-40" />
        <p className="text-sm">Aucun article enregistré</p>
      </div>
    );
  }

  const total = items.reduce((sum, i) => sum + (Number(i.quantite) || 0), 0);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Produit
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">
              Qté
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <tr
              key={item.id ?? idx}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">
                  {item.product?.nom ?? `Produit #${item.product_id}`}
                </p>
                {item.product?.sku && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    SKU : {item.product.sku}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 font-bold text-xs px-2.5 py-1 rounded-full">
                  × {item.quantite}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 border-t border-gray-200">
            <td className="px-4 py-2.5 text-xs font-semibold text-gray-500">
              {items.length} article{items.length > 1 ? "s" : ""}
            </td>
            <td className="px-4 py-2.5 text-right text-xs font-bold text-gray-700">
              Total : {total}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Audit Trail ──────────────────────────────────────────────────────────────

function AuditAvatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  return (
    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 ring-2 ring-white">
      <span className="text-[10px] font-bold text-primary-700">{initials}</span>
    </div>
  );
}

function AuditTrail({ transfer }) {
  console.log(transfer);
  // Build ordered events from schema fields
  const events = [];

  // 1 — Création (always present)
  events.push({
    key: "created",
    icon: FileText,
    color: "gray",
    label: "Brouillon créé",
    actor: transfer.created_by,
    date: transfer.created_at,
    note: transfer.note || null,
  });

  // 2 — Soumission (en_attente = submitted; no dedicated field, infer from statut history)
  //     We track submitted_at via updated_at when statut became en_attente.
  //     If the API exposes submitted_at use it; otherwise show if statut has passed brouillon.
  if (
    transfer.submitted_at ||
    ["en_attente", "valide", "recu", "annule"].includes(transfer.statut)
  ) {
    events.push({
      key: "submitted",
      icon: Send,
      color: "amber",
      label: "Soumis pour validation",
      actor: transfer.created_by, // same person who created submits
      date: transfer.submitted_at ?? null,
    });
  }

  // 3 — Validation
  if (transfer.validated_by || transfer.validated_at) {
    events.push({
      key: "validated",
      icon: ShieldCheck,
      color: "blue",
      label: "Validé — stock source réservé",
      actor: transfer.validated_by,
      date: transfer.validated_at,
    });
  }

  // 4 — Réception
  if (transfer.received_by || transfer.received_at) {
    events.push({
      key: "received",
      icon: PackageCheck,
      color: "green",
      label: "Réceptionné en destination",
      actor: transfer.received_by,
      date: transfer.received_at,
    });
  }

  // 5 — Annulation (replaces reception if cancelled)
  if (transfer.statut === "annule") {
    events.push({
      key: "cancelled",
      icon: Ban,
      color: "red",
      label: "Transfert annulé",
      actor: transfer.cancelled_by ?? null,
      date: transfer.cancelled_at ?? transfer.updated_at,
    });
  }

  const colorClass = {
    gray: {
      bg: "bg-gray-100",
      icon: "text-gray-500",
      dot: "bg-gray-300",
      line: "bg-gray-200",
    },
    amber: {
      bg: "bg-amber-100",
      icon: "text-amber-600",
      dot: "bg-amber-400",
      line: "bg-amber-200",
    },
    blue: {
      bg: "bg-blue-100",
      icon: "text-blue-600",
      dot: "bg-blue-500",
      line: "bg-blue-200",
    },
    green: {
      bg: "bg-green-100",
      icon: "text-green-600",
      dot: "bg-green-500",
      line: "bg-green-200",
    },
    red: {
      bg: "bg-red-100",
      icon: "text-red-600",
      dot: "bg-red-500",
      line: "bg-red-200",
    },
  };

  return (
    <div className="space-y-0">
      {events.map((evt, idx) => {
        const c = colorClass[evt.color];
        const Icon = evt.icon;
        const isLast = idx === events.length - 1;
        const actorName =
          (evt.actor?.name ?? evt.actor?.prenom)
            ? `${evt.actor?.prenom ?? ""} ${evt.actor?.nom ?? ""}`.trim()
            : null;

        return (
          <div key={evt.key} className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${c.bg}`}
              >
                <Icon size={14} className={c.icon} />
              </div>
              {!isLast && (
                <div
                  className={`w-px flex-1 my-1 ${c.line}`}
                  style={{ minHeight: "20px" }}
                />
              )}
            </div>

            {/* Event body */}
            <div className={`pb-4 flex-1 min-w-0 ${isLast ? "" : ""}`}>
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {evt.label}
              </p>

              {/* Actor row */}
              {actorName ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <AuditAvatar name={actorName} />
                  <span className="text-xs text-gray-600 font-medium">
                    {actorName}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                    <User size={12} className="text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-400 italic">
                    Utilisateur inconnu
                  </span>
                </div>
              )}

              {/* Date */}
              {evt.date ? (
                <p className="text-xs text-gray-400 mt-0.5 ml-[36px]">
                  {new Date(evt.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              ) : (
                <p className="text-xs text-gray-300 mt-0.5 ml-[36px] italic">
                  Date non enregistrée
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────


function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-md ${className}`}
    />
  );
}


export default function TransferDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // action awaiting confirm
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null); // { msg, type }

  useEffect(() => {
    fetchTransfer();
  }, [id]);

  async function fetchTransfer() {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransfer(id);
      setTransfer(data?.data ?? data);
    } catch {
      setError("Impossible de charger ce transfert.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleTrigger(action) {
    setPendingAction(action);
  }

  async function handleConfirm() {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      const actionMap = {
        submit: submitTransfer,
        validate: validateTransfer,
        receive: receiveTransfer,
        cancel: cancelTransfer,
      };
      await actionMap[pendingAction.key](transfer.id);
      setPendingAction(null);
      showToast(`Transfert ${pendingAction.label.toLowerCase()} avec succès.`);
      await fetchTransfer();
    } catch (err) {
      setPendingAction(null);
      showToast(
        err.response?.data?.message ?? "Une erreur est survenue.",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────

if (loading)
  return (
    <div className="p-6 max-w-8xl mx-auto space-y-5">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>

      {/* State pipeline skeleton */}
      <div className="card p-5">
        <Skeleton className="h-3 w-40 mb-4" />
        <div className="flex items-start justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left col */}
        <div className="lg:col-span-3 space-y-5">
          {/* Info card */}
          <div className="card p-5 space-y-3">
            <Skeleton className="h-3 w-36 mb-1" />
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>

          {/* Articles card */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              {/* Table rows */}
              {[0, 1, 2].map((i) => (
                <div key={i} className="px-4 py-3 flex justify-between items-center border-b border-gray-100 last:border-0">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              ))}
              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="lg:col-span-2 space-y-5">
          {/* Actions card */}
          <div className="card p-5 space-y-3">
            <Skeleton className="h-3 w-36 mb-1" />
            {[0, 1].map((i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-7 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Next step hint */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-2">
            <Skeleton className="h-3 w-28 bg-blue-200" />
            <Skeleton className="h-3 w-full bg-blue-200" />
            <Skeleton className="h-3 w-4/5 bg-blue-200" />
          </div>

          {/* Audit trail card */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="h-3 w-40" />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  {i < 2 && <Skeleton className="w-px h-8 my-1" />}
                </div>
                <div className="pb-4 flex-1 space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-3 w-36 ml-9" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (error)
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">{error}</p>
          <button
            onClick={fetchTransfer}
            className="text-xs text-primary-600 hover:underline mt-1"
          >
            Réessayer
          </button>
        </div>
      </div>
    );

  const actions = getActions(transfer.statut);
  const isClosed = ["recu", "annule"].includes(transfer.statut);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-8xl mx-auto">
      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`
          fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
          transition-all animate-in fade-in slide-in-from-top-2
          ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-gray-900 text-white"
          }
        `}
        >
          {toast.type === "error" ? (
            <XCircle size={16} />
          ) : (
            <CheckCircle size={16} className="text-green-400" />
          )}
          {toast.msg}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6"> 
            <div className="flex items-center justify-between gap-3">


                <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                    <ArrowLeftRight size={18} className="text-primary-600" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">
                    Transfert{" "}
                    <span className="text-primary-600">
                        {transfer.reference || `#${transfer.id?.slice(0, 8)}`}
                    </span>
                    </h1>
                    <p className="text-xs text-gray-400">
                    Créé le {formatDate(transfer.created_at)}
                    </p>
                </div>
            </div>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
      </div>

      {/* ── State Pipeline ────────────────────────────────────────────────────── */}
      <div className="card p-5 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Progression du transfert
        </p>
        <StatePipeline statut={transfer.statut} />
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left — Info + Articles (3/5) */}
        <div className="lg:col-span-3 space-y-5">
          {/* General Info */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Informations générales
            </p>
            <InfoGrid transfer={transfer} />
          </div>

          {/* Articles */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Articles transférés
              </p>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                {transfer.items?.length ?? 0} ligne
                {(transfer.items?.length ?? 0) > 1 ? "s" : ""}
              </span>
            </div>
            <ItemsTable items={transfer.items} />
          </div>
        </div>

        {/* Right — Actions (2/5) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Actions Panel */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Actions disponibles
            </p>

            {isClosed ? (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    transfer.statut === "recu" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {transfer.statut === "recu" ? (
                    <PackageCheck size={20} className="text-green-600" />
                  ) : (
                    <Ban size={20} className="text-red-500" />
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-600">
                  {transfer.statut === "recu"
                    ? "Transfert clôturé"
                    : "Transfert annulé"}
                </p>
                <p className="text-xs text-center mt-1 leading-relaxed">
                  {transfer.statut === "recu"
                    ? "Toutes les marchandises ont été réceptionnées."
                    : "Ce transfert a été annulé et ne peut plus être modifié."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {actions.map((action) => (
                  <ActionCard
                    key={action.key}
                    action={action}
                    onTrigger={handleTrigger}
                    loading={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>

          {/* State explanation card */}
          {!isClosed && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                Prochaine étape
              </p>
              {transfer.statut === "brouillon" && (
                <p className="text-xs text-blue-700 leading-relaxed">
                  Soumettez ce transfert pour qu'un gestionnaire puisse le
                  valider et réserver le stock source.
                </p>
              )}
              {transfer.statut === "en_attente" && (
                <p className="text-xs text-blue-700 leading-relaxed">
                  Un gestionnaire doit valider ce transfert. À la validation, le
                  stock de l'entrepôt source sera réservé (
                  <code className="bg-blue-100 px-1 rounded">
                    transfert_sortie
                  </code>
                  ).
                </p>
              )}
              {transfer.statut === "valide" && (
                <p className="text-xs text-blue-700 leading-relaxed">
                  Le magasinier de l'entrepôt destination doit confirmer la
                  réception. Cela enregistrera une entrée (
                  <code className="bg-blue-100 px-1 rounded">
                    transfert_entree
                  </code>
                  ) et libèrera la réserve.
                </p>
              )}
            </div>
          )}

          {/* Audit Trail */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center">
                <ShieldCheck size={12} className="text-gray-500" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Historique des actions
              </p>
            </div>
            <AuditTrail transfer={transfer} />
          </div>
        </div>
      </div>

      {/* ── Confirm Overlay ───────────────────────────────────────────────────── */}
      <ConfirmOverlay
        action={pendingAction}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
        loading={actionLoading}
      />
    </div>
  );
}
