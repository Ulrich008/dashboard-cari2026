import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { galaTicketService } from "../../services/galaTicketService";
import Modal from "../../components/Modal";
import { downloadBlobResponse } from "../../utils/downloadFile";

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
  search: "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  filter: "M4 6h16M7 12h10M10 18h4",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  check: "M20 6L9 17l-5-5",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
};

const SOURCE_STYLE = {
  with_account: "bg-blue-100 text-blue-700",
  standalone: "bg-purple-100 text-purple-700",
};

const PAYMENT_STATUS_STYLE = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function GalaTicketsTab() {
  const [search, setSearch] = useState("");
  const [statutPaiement, setStatutPaiement] = useState("");
  const [source, setSource] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [markPaidTarget, setMarkPaidTarget] = useState(null);
  const [motif, setMotif] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      loadTickets();
    }, 150);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statutPaiement, source]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await galaTicketService.getAll({ search, statut_paiement: statutPaiement, source, page: 1, per_page: 100 });
      setTickets(res?.data ?? (Array.isArray(res) ? res : []));
    } catch (error) {
      console.error("Error loading gala tickets:", error);
      Swal.fire("Error", "Unable to load Gala Dinner tickets.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openMarkPaid = (ticket) => {
    setMotif("");
    setMarkPaidTarget(ticket);
  };

  const submitMarkPaid = async () => {
    if (!motif.trim()) {
      Swal.fire("Reason required", "Please specify a reason.", "warning");
      return;
    }
    setSubmitting(true);
    try {
      await galaTicketService.markPaid(markPaidTarget.id, motif);
      setMarkPaidTarget(null);
      await loadTickets();
      Swal.fire({ icon: "success", title: "Success", text: "Ticket marked as paid.", timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error("Error marking as paid:", error);
      Swal.fire("Error", error.response?.data?.message ?? "An error occurred.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadReceipt = async (ticket) => {
    try {
      const response = await galaTicketService.downloadReceipt(ticket.id);
      downloadBlobResponse(response, `CARI2026_Gala_Receipt_${ticket.id}.pdf`);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      Swal.fire("Error", "Unable to download the receipt.", "error");
    }
  };

  const viewDetail = (ticket) => {
    Swal.fire({
      title: `<strong>${ticket.nom_complet}</strong>`,
      html: `
        <div class="text-left" style="font-size: 14px;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Contact</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Email:</strong> ${ticket.email}</div>
              <div><strong>Phone:</strong> ${ticket.telephone ?? "-"}</div>
              <div><strong>Source:</strong> ${ticket.source === "with_account" ? "Participant account" : "Public purchase (standalone)"}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Order</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Option:</strong> ${ticket.categorie_label ?? "-"}</div>
              <div><strong>Quantity:</strong> ${ticket.quantite}</div>
              <div><strong>Unit price:</strong> ${ticket.prix_unitaire} ${ticket.devise}</div>
              <div><strong>Total amount:</strong> ${ticket.montant_total} ${ticket.devise}</div>
              <div><strong>Discounted amount:</strong> ${ticket.montant_reduit ?? "-"}</div>
              <div><strong>Applied promo code:</strong> ${ticket.discount_code_id ? `#${ticket.discount_code_id}` : "None"}</div>
              <div><strong>Payment status:</strong> ${ticket.statut_paiement}</div>
              <div><strong>Method:</strong> ${ticket.payment_method ?? "-"}</div>
              <div><strong>Payment date:</strong> ${ticket.date_paiement ?? "-"}</div>
            </div>
          </div>
          <div>
            <strong style="color: #1a7a3c;">Badge</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>QR code:</strong> ${ticket.qr_code ?? "Not generated"}</div>
            </div>
          </div>
        </div>
      `,
      width: "600px",
      confirmButtonText: "Close",
      confirmButtonColor: "#1a7a3c",
    });
  };

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
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 transition-colors shrink-0 ${
              showFilters || statutPaiement || source ? "bg-[#1a7a3c] text-white border-[#1a7a3c]" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Icon d={ICONS.filter} size={16} />
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Payment status:</span>
              <select
                value={statutPaiement}
                onChange={(e) => setStatutPaiement(e.target.value)}
                className="px-2 py-1 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a7a3c]/30"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Source:</span>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="px-2 py-1 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a7a3c]/30"
              >
                <option value="">All</option>
                <option value="with_account">Participant account</option>
                <option value="standalone">Public purchase</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Buyer</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Source</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Category</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Quantity</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400">Loading...</td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400">No gala tickets found.</td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{ticket.nom_complet}</p>
                    <p className="text-xs text-gray-400">{ticket.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${SOURCE_STYLE[ticket.source] ?? "bg-gray-100 text-gray-600"}`}>
                      {ticket.source === "with_account" ? "Account" : "Standalone"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{ticket.categorie_label ?? "-"}</td>
                  <td className="px-4 py-4 text-gray-600">{ticket.quantite}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-900">{ticket.montant_reduit ?? ticket.montant_total} {ticket.devise}</p>
                    {ticket.montant_reduit && ticket.montant_total && (
                      <p className="text-xs text-gray-400 line-through">{ticket.montant_total}</p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${PAYMENT_STATUS_STYLE[ticket.statut_paiement] ?? "bg-gray-100 text-gray-600"}`}>
                      {ticket.statut_paiement}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => viewDetail(ticket)} className="text-gray-400 hover:text-[#1a7a3c] transition-colors" title="View details">
                        <Icon d={ICONS.eye} size={16} />
                      </button>
                      {ticket.statut_paiement !== "paid" && (
                        <button onClick={() => openMarkPaid(ticket)} className="text-gray-400 hover:text-green-600 transition-colors" title="Mark as paid">
                          <Icon d={ICONS.check} size={16} />
                        </button>
                      )}
                      {ticket.statut_paiement === "paid" && (
                        <button onClick={() => downloadReceipt(ticket)} className="text-gray-400 hover:text-[#1a7a3c] transition-colors" title="Download receipt">
                          <Icon d={ICONS.download} size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Total: {tickets.length} ticket(s)</span>
          <span>Paid: {tickets.filter((t) => t.statut_paiement === "paid").length}</span>
        </div>
      </div>

      <Modal
        open={!!markPaidTarget}
        title="Mark as paid"
        onClose={() => setMarkPaidTarget(null)}
        footer={
          <>
            <button onClick={() => setMarkPaidTarget(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={submitMarkPaid}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] disabled:opacity-60 transition-colors"
            >
              {submitting ? "Saving..." : "Confirm"}
            </button>
          </>
        }
      >
        {markPaidTarget && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Mark the ticket of <strong>{markPaidTarget.nom_complet}</strong> ({markPaidTarget.quantite} ticket(s), {markPaidTarget.montant_total} {markPaidTarget.devise}) as manually paid (e.g.: payment received offline).
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Reason (required)</label>
              <textarea
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                rows={3}
                placeholder="E.g.: payment received by bank transfer..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
