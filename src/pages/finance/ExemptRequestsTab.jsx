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
  gift: "M20 12v10H4V12M2 7h20v5H2V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");

export default function ExemptRequestsTab() {
  const [active, setActive]   = useState([]);
  const [loading, setLoading] = useState(true);

  const [cancelModal, setCancelModal] = useState(null); // registration
  const [motif, setMotif] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const extractList = (res) => (res && res.meta ? res.data : Array.isArray(res) ? res : []);

  const loadActive = async () => {
    try {
      setLoading(true);
      const res = await registrationService.getAll({ payment_method: "exempt", per_page: 100 });
      setActive(extractList(res));
    } catch (error) {
      console.error("Error loading active free registrations:", error);
      Swal.fire("Error", "Unable to load free registrations.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActive();
  }, []);

  const openCancelModal = (registration) => {
    setMotif("");
    setCancelModal(registration);
  };

  const closeCancelModal = () => {
    setCancelModal(null);
    setMotif("");
  };

  const submitCancel = async () => {
    if (!motif.trim()) {
      Swal.fire("Reason required", "Please specify a reason for this action.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await registrationService.cancelExemption(cancelModal.id, motif);
      closeCancelModal();
      await loadActive();
      Swal.fire({ icon: "success", title: "Success", text: "Free registration cancelled.", timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error("Error cancelling exemption:", error);
      Swal.fire("Error", error.response?.data?.message ?? "An error occurred.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-700">Active free registrations</h3>
        <p className="text-xs text-gray-500 mt-1">
          Registrations marked as exempt by an admin (Finance or Participants).
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Participant</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Date exempted</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount before exemption</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading...</td></tr>
            ) : active.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No active free registrations.</td></tr>
            ) : (
              active.map((registration) => {
                const p = registration.participant;
                return (
                  <tr key={registration.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{p ? `${p.prenom ?? ""} ${p.nom ?? ""}` : `#${registration.participant_id}`}</p>
                      <p className="text-xs text-gray-400">{p?.email ?? ""}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{registration.type_registration ?? "-"}</td>
                    <td className="px-4 py-4 text-gray-500">{formatDate(registration.date_paiement)}</td>
                    <td className="px-4 py-4 text-gray-600">
                      {registration.montant_avant_exemption ?? "—"} {registration.montant_avant_exemption ? (registration.devise ?? "") : ""}
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => openCancelModal(registration)} className="text-gray-400 hover:text-red-500 transition-colors" title="Cancel free registration">
                        <Icon d={ICONS.gift} size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!cancelModal}
        title="Cancel free registration"
        onClose={closeCancelModal}
        footer={
          <>
            <button onClick={closeCancelModal} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={submitCancel}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] disabled:opacity-60 transition-colors"
            >
              {submitting ? "Saving..." : "Confirm"}
            </button>
          </>
        }
      >
        {cancelModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              The original amount will be restored, the registration goes back to pending payment, and the
              participant will be notified by email.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Reason (required)</label>
              <textarea
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                rows={3}
                placeholder="Explain the reason for this action..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
