import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { registrationService } from "../../services/registrationService";
import Modal from "../../components/Modal";

const Icon = ({ d, size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  search:  "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  filter:  "M4 6h16M7 12h10M10 18h4",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  edit:    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  cash:    "M3 10h18M5 6h14M7 14h10M9 18h6M12 2v20",
  percent: "M19 5L5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  clock:   "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  xcircle: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM15 9l-6 6M9 9l6 6",
};

const PAYMENT_STATUS_STYLE = {
  pending:   "bg-yellow-100 text-yellow-700",
  paid:      "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const REGISTRATION_STATUS_STYLE = {
  pending:     "bg-gray-100 text-gray-600",
  paid:        "bg-blue-100 text-blue-700",
  cancelled:   "bg-red-100 text-red-700",
  checked_in:  "bg-purple-100 text-purple-700",
};

const statusLabel = (value, dict) => (value ? (dict[value] ?? value) : "—");

const extractMotif = (changes) => {
  try {
    const parsed = typeof changes === "string" ? JSON.parse(changes) : changes;
    return parsed?.motif ?? "";
  } catch {
    return "";
  }
};

export default function RegistrationsTab() {
  const [search, setSearch] = useState("");
  const [statutPaiement, setStatutPaiement] = useState("");
  const [statutRegistration, setStatutRegistration] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [perPage, setPerPage] = useState(20);

  const [actionModal, setActionModal] = useState(null); // { type, registration }
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statutPaiement, statutRegistration, perPage]);

  useEffect(() => {
    const delay = setTimeout(() => {
      loadRegistrations(currentPage);
    }, 150);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, statutPaiement, statutRegistration, perPage]);

  const loadRegistrations = async (page = 1) => {
    try {
      setLoading(true);
      const res = await registrationService.getAll({
        page,
        search,
        statut_paiement: statutPaiement,
        statut_registration: statutRegistration,
        per_page: perPage,
      });
      if (res && res.meta) {
        setRegistrations(res.data);
        setPagination(res.meta);
      } else {
        setRegistrations(Array.isArray(res) ? res : []);
        setPagination(null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des registrations:", error);
      Swal.fire("Erreur", "Impossible de charger les registrations.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, registration) => {
    setForm({
      statut_paiement: registration.statut_paiement || "pending",
      montant_total: registration.montant_total ?? "",
      montant_reduit: registration.montant_reduit ?? "",
      discount_code: "",
      motif: "",
    });
    setActionModal({ type, registration });
  };

  const closeModal = () => {
    setActionModal(null);
    setForm({});
  };

  const submitModal = async () => {
    if (!form.motif || !form.motif.trim()) {
      Swal.fire("Motif requis", "Merci de préciser un motif pour cette action.", "warning");
      return;
    }

    const { type, registration } = actionModal;
    setSubmitting(true);
    try {
      switch (type) {
        case "status":
          await registrationService.changePaymentStatus(registration.id, form.statut_paiement, form.motif);
          break;
        case "amount":
          await registrationService.editAmount(registration.id, {
            montant_total: form.montant_total === "" ? null : Number(form.montant_total),
            montant_reduit: form.montant_reduit === "" ? null : Number(form.montant_reduit),
            motif: form.motif,
          });
          break;
        case "apply-discount":
          if (!form.discount_code || !form.discount_code.trim()) {
            Swal.fire("Code requis", "Merci de saisir un code promo.", "warning");
            setSubmitting(false);
            return;
          }
          await registrationService.applyDiscount(registration.id, form.discount_code.trim(), form.motif);
          break;
        case "remove-discount":
          await registrationService.removeDiscount(registration.id, form.motif);
          break;
        case "cancel-checkin":
          await registrationService.cancelCheckIn(registration.id, form.motif);
          break;
        default:
          break;
      }

      closeModal();
      await loadRegistrations(currentPage);
      Swal.fire({ icon: "success", title: "Succès", text: "Action effectuée avec succès.", timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error("Erreur lors de l'action Finance:", error);
      Swal.fire("Erreur", error.response?.data?.message ?? "Une erreur est survenue.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const viewDetail = (registration) => {
    const p = registration.participant;
    Swal.fire({
      title: `<strong>${p ? `${p.prenom ?? ""} ${p.nom ?? ""}` : `Participant #${registration.participant_id}`}</strong>`,
      html: `
        <div class="text-left" style="font-size: 14px;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Inscription</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Type:</strong> ${registration.type_registration ?? "-"}</div>
              <div><strong>Email:</strong> ${p?.email ?? "-"}</div>
              <div><strong>Statut paiement:</strong> ${registration.statut_paiement ?? "-"}</div>
              <div><strong>Statut inscription:</strong> ${registration.statut_registration ?? "-"}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Montants</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Montant total:</strong> ${registration.montant_total ?? "-"} ${registration.devise ?? ""}</div>
              <div><strong>Montant réduit:</strong> ${registration.montant_reduit ?? "-"}</div>
              <div><strong>Code promo appliqué:</strong> ${registration.discount_code_id ? `#${registration.discount_code_id}` : "Aucun"}</div>
              <div><strong>Méthode de paiement:</strong> ${registration.payment_method ?? "-"}</div>
              <div><strong>Date paiement:</strong> ${registration.date_paiement ?? "-"}</div>
            </div>
          </div>
          <div>
            <strong style="color: #1a7a3c;">Check-in</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Date check-in:</strong> ${registration.date_checkin ?? "-"}</div>
            </div>
          </div>
        </div>
      `,
      width: "600px",
      confirmButtonText: "Fermer",
      confirmButtonColor: "#1a7a3c",
    });
  };

  const viewHistory = async (registration) => {
    try {
      const history = await registrationService.getAuditHistory(registration.id);
      const rows = (history?.data ?? history ?? []);
      const html = rows.length
        ? `<div style="text-align:left; font-size:13px; max-height:400px; overflow-y:auto;">${rows
            .map((h) => {
              const motif = extractMotif(h.changes);
              return `<div style="padding:8px 0; border-bottom:1px solid #eee;">
                <div><strong>${h.action}</strong> — ${h.admin_nom ?? "System"} <span style="color:#999;">(${h.created_at ?? ""})</span></div>
                ${motif ? `<div style="color:#666; margin-top:2px;">Motif : ${motif}</div>` : ""}
              </div>`;
            })
            .join("")}</div>`
        : `<p style="color:#999;">Aucun historique pour cette registration.</p>`;

      Swal.fire({
        title: "Historique",
        html,
        width: "600px",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#1a7a3c",
      });
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      Swal.fire("Erreur", "Impossible de charger l'historique.", "error");
    }
  };

  const modalTitle = {
    status: "Changer le statut de paiement",
    amount: "Éditer le montant",
    "apply-discount": "Appliquer un code promo",
    "remove-discount": "Retirer le code promo",
    "cancel-checkin": "Annuler le check-in",
  }[actionModal?.type];

  return (
    <div>
      <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Icon d={ICONS.search} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 transition-colors shrink-0 ${
              showFilters || statutPaiement || statutRegistration ? "bg-[#1a7a3c] text-white border-[#1a7a3c]" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Icon d={ICONS.filter} size={16} />
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Statut paiement :</span>
              <select
                value={statutPaiement}
                onChange={(e) => setStatutPaiement(e.target.value)}
                className="px-2 py-1 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a7a3c]/30"
              >
                <option value="">Tous</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Statut inscription :</span>
              <select
                value={statutRegistration}
                onChange={(e) => setStatutRegistration(e.target.value)}
                className="px-2 py-1 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a7a3c]/30"
              >
                <option value="">Tous</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="checked_in">Checked-in</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Participant</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Montant</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut paiement</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut inscription</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Date paiement</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400">Chargement...</td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400">Aucune registration trouvée.</td>
              </tr>
            ) : (
              registrations.map((registration, i) => {
                const p = registration.participant;
                return (
                  <tr
                    key={registration.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${i === registrations.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{p ? `${p.prenom ?? ""} ${p.nom ?? ""}` : `#${registration.participant_id}`}</p>
                      <p className="text-xs text-gray-400">{p?.email ?? ""}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{registration.type_registration ?? "-"}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{registration.montant_reduit ?? registration.montant_total ?? "-"} {registration.devise ?? ""}</p>
                      {registration.montant_reduit && registration.montant_total && (
                        <p className="text-xs text-gray-400 line-through">{registration.montant_total}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${PAYMENT_STATUS_STYLE[registration.statut_paiement] ?? "bg-gray-100 text-gray-600"}`}>
                        {statusLabel(registration.statut_paiement, {})}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${REGISTRATION_STATUS_STYLE[registration.statut_registration] ?? "bg-gray-100 text-gray-600"}`}>
                        {statusLabel(registration.statut_registration, {})}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{registration.date_paiement ? new Date(registration.date_paiement).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <button onClick={() => viewDetail(registration)} className="text-gray-400 hover:text-[#1a7a3c] transition-colors" title="Voir le détail">
                          <Icon d={ICONS.eye} size={16} />
                        </button>
                        <button onClick={() => openModal("status", registration)} className="text-gray-400 hover:text-[#1a7a3c] transition-colors" title="Changer le statut de paiement">
                          <Icon d={ICONS.edit} size={16} />
                        </button>
                        <button onClick={() => openModal("amount", registration)} className="text-gray-400 hover:text-[#1a7a3c] transition-colors" title="Éditer le montant">
                          <Icon d={ICONS.cash} size={16} />
                        </button>
                        <button
                          onClick={() => openModal(registration.discount_code_id ? "remove-discount" : "apply-discount", registration)}
                          className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                          title={registration.discount_code_id ? "Retirer le code promo" : "Appliquer un code promo"}
                        >
                          <Icon d={ICONS.percent} size={16} />
                        </button>
                        {registration.statut_registration === "checked_in" && (
                          <button onClick={() => openModal("cancel-checkin", registration)} className="text-gray-400 hover:text-red-500 transition-colors" title="Annuler le check-in">
                            <Icon d={ICONS.xcircle} size={16} />
                          </button>
                        )}
                        <button onClick={() => viewHistory(registration)} className="text-gray-400 hover:text-[#1a7a3c] transition-colors" title="Historique">
                          <Icon d={ICONS.clock} size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-500">
              Affichage de <span className="font-semibold">{pagination.from || 0}</span> à{" "}
              <span className="font-semibold">{pagination.to || 0}</span> sur{" "}
              <span className="font-semibold">{pagination.total || 0}</span> registrations
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200/50">
              <span>Afficher</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="px-1 py-0.5 rounded border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a7a3c]/30 font-medium cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>par page</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-500 px-2">
              Page {pagination.current_page} / {pagination.last_page}
            </span>
            <button
              onClick={() => setCurrentPage(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      <Modal
        open={!!actionModal}
        title={modalTitle}
        onClose={closeModal}
        footer={
          <>
            <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              Annuler
            </button>
            <button
              onClick={submitModal}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] disabled:opacity-60 transition-colors"
            >
              {submitting ? "Enregistrement..." : "Confirmer"}
            </button>
          </>
        }
      >
        {actionModal && (
          <div className="space-y-4">
            {actionModal.type === "status" && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nouveau statut de paiement</label>
                <select
                  value={form.statut_paiement}
                  onChange={(e) => setForm({ ...form, statut_paiement: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}

            {actionModal.type === "amount" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Montant total</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.montant_total}
                    onChange={(e) => setForm({ ...form, montant_total: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Montant réduit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.montant_reduit}
                    onChange={(e) => setForm({ ...form, montant_reduit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                  />
                </div>
              </>
            )}

            {actionModal.type === "apply-discount" && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Code promo</label>
                <input
                  type="text"
                  value={form.discount_code}
                  onChange={(e) => setForm({ ...form, discount_code: e.target.value.toUpperCase() })}
                  placeholder="CARI2026"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                />
              </div>
            )}

            {actionModal.type === "remove-discount" && (
              <p className="text-sm text-gray-600">Le code promo actuellement appliqué à cette inscription sera retiré et le montant recalculé.</p>
            )}

            {actionModal.type === "cancel-checkin" && (
              <p className="text-sm text-gray-600">Le check-in de ce participant sera annulé.</p>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Motif (obligatoire)</label>
              <textarea
                value={form.motif}
                onChange={(e) => setForm({ ...form, motif: e.target.value })}
                rows={3}
                placeholder="Expliquez la raison de cette action..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
