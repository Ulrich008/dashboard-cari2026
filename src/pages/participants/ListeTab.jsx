import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { participantService } from "../../services/participantService";
import Swal from "sweetalert2";
import { useAuth } from "../../contexts/AuthContext";

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
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  filter:   "M4 6h16M7 12h10M10 18h4",
  plus:     "M12 5v14M5 12h14",
  edit:     "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  delete:   "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  user:     "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  mail:     "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  calendar: "M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  upload:   "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  check:    "M20 6L9 17l-5-5",
  clock:    "M12 6v6l4 2M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  ticket:   "M20 12v-2a2 2 0 0 0-2-2h-2M4 12v-2a2 2 0 0 1 2-2h2M20 12v4a2 2 0 0 1-2 2h-2M4 12v4a2 2 0 0 0 2 2h2M8 8h8M8 16h8",
  lock:     "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  unlock:   "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 9.9-1",
};

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_STYLE = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PARTICIPANT_TYPES = [
  { value: "regular", label: "Regular", color: "blue" },
  { value: "student", label: "Student", color: "green" },
];

const ACCOUNT_STATUS = [
  { value: "ACTIF", label: "Active", color: "green" },
  { value: "DESACTIVE", label: "Disabled", color: "red" },
];

export default function ListeTab({ onGoToImport }) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const isEditor = (usr) => {
    const code = usr?.role_admin?.code || usr?.role?.code;
    return typeof code === 'string' && code.toUpperCase() === 'EDITOR';
  };

  const [search, setSearch] = useState("");
  const [participants, setParticipants] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [perPage, setPerPage] = useState(10);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, authors: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  // Reset page to 1 when filters or perPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedType, selectedStatus, selectedPaymentStatus, perPage]);

  // Load data when page, search, filters, or perPage change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadParticipants(currentPage);
    }, 150);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, selectedType, selectedStatus, selectedPaymentStatus, perPage]);

  const loadStats = async () => {
    try {
      const res = await participantService.getStats();
      if (res) {
        setStats(res);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const loadParticipants = async (page = 1) => {
    try {
      setLoading(true);
      const res = await participantService.getAll({
        page,
        search,
        type: selectedType,
        statut: selectedStatus,
        statut_paiement: selectedPaymentStatus,
        per_page: perPage
      });
      if (res && res.meta) {
        setParticipants(res.data);
        setPagination(res.meta);
      } else {
        setParticipants(Array.isArray(res) ? res : []);
        setPagination(null);
      }
    } catch (error) {
      console.error("Error loading participants:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = participants;

  const toggleSelectAll = () => {
    if (selectedParticipants.length === filtered.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(filtered.map(p => p.id));
    }
  };

  const toggleSelectParticipant = (id) => {
    if (selectedParticipants.includes(id)) {
      setSelectedParticipants(selectedParticipants.filter(i => i !== id));
    } else {
      setSelectedParticipants([...selectedParticipants, id]);
    }
  };

  useEffect(() => {
    setShowBulkActions(selectedParticipants.length > 0);
  }, [selectedParticipants]);

  const updatePaymentStatus = async (id, newStatus) => {
    try {
      const participant = participants.find(p => p.id === id);
      const updatedData = {
        ...participant,
        statut_compte: newStatus,
      };
      await participantService.update(id, updatedData);
      await loadParticipants(currentPage);
      await loadStats();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Status updated successfully`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error updating status'
      });
    }
  };

  const toggleMyInfoUnlock = async (participant) => {
    const nextUnlocked = !participant.myinfo_deverrouille_par_admin;
    const { value: motif } = await Swal.fire({
      title: nextUnlocked ? "Unlock MyInfo?" : "Re-lock MyInfo?",
      input: "textarea",
      inputLabel: "Reason (required)",
      inputPlaceholder: nextUnlocked
        ? "E.g.: request to correct information after payment..."
        : "E.g.: handling error...",
      showCancelButton: true,
      confirmButtonColor: "#1a7a3c",
      cancelButtonColor: "#3085d6",
      confirmButtonText: nextUnlocked ? "Unlock" : "Re-lock",
      cancelButtonText: "Cancel",
      inputValidator: (value) => (!value || !value.trim() ? "The reason is required." : undefined),
    });

    if (!motif) return;

    try {
      await participantService.toggleMyInfoUnlock(participant.id, nextUnlocked, motif);
      await loadParticipants(currentPage);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: nextUnlocked ? "Profile unlocked." : "Profile re-locked.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error changing MyInfo lock:", error);
      Swal.fire("Error", error.response?.data?.message ?? "An error occurred.", "error");
    }
  };

  const deleteParticipant = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to recover this participant!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await participantService.delete(id);
        await loadParticipants(currentPage);
        await loadStats();
        setSelectedParticipants(selectedParticipants.filter(i => i !== id));
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The participant has been deleted.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Error deleting:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error deleting'
        });
      }
    }
  };

  const exportParticipants = () => {
    const csv = [
      ["Last Name", "First Name", "Email", "Type", "Status", "Affiliation", "Country", "Phone", "Author"],
      ...filtered.map(p => [
        p.nom || '',
        p.prenom || '',
        p.email || '',
        p.type_participant || '',
        p.statut_compte || '',
        p.affiliation || '',
        p.pays || '',
        p.telephone || '',
        p.est_auteur ? 'Yes' : 'No'
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeBadgeColor = (type) => {
    const typeMap = {
      "regular": "bg-blue-100 text-blue-700",
      "student": "bg-green-100 text-green-700",
    };
    return typeMap[type] || "bg-gray-100 text-gray-700";
  };

  const getStatusBadgeColor = (status) => {
    const statusMap = {
      "ACTIF": "bg-green-100 text-green-700",
      "DESACTIVE": "bg-red-100 text-red-700",
    };
    return statusMap[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      "ACTIF": "Active",
      "DESACTIVE": "Disabled",
    };
    return statusMap[status] || status;
  };

  const viewParticipant = (participant) => {
    Swal.fire({
      title: `<strong>${participant.prenom} ${participant.nom}</strong>`,
      html: `
        <div class="text-left" style="font-size: 14px;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Account information</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Email:</strong> ${participant.email}</div>
              <div><strong>Type:</strong> ${participant.type_participant === 'regular' ? 'Regular' : 'Student'}</div>
              <div><strong>Status:</strong> ${getStatusLabel(participant.statut_compte)}</div>
              <div><strong>Author:</strong> ${participant.est_auteur ? 'Yes' : 'No'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Personal identity</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Title:</strong> ${participant.titre || '-'}</div>
              <div><strong>Gender:</strong> ${participant.genre || '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Professional information</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Institution:</strong> ${participant.institution || '-'}</div>
              <div><strong>Department:</strong> ${participant.departement || '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Address</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Address:</strong> ${participant.adresse || '-'}</div>
              <div><strong>City:</strong> ${participant.ville || '-'}</div>
              <div><strong>Region:</strong> ${participant.region || '-'}</div>
              <div><strong>Postal code:</strong> ${participant.code_postal || '-'}</div>
              <div><strong>Country:</strong> ${participant.pays || '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Contact</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Phone:</strong> ${participant.telephone || '-'}</div>
              <div><strong>Mobile:</strong> ${participant.mobile || '-'}</div>
              <div><strong>Fax:</strong> ${participant.fax || '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Preferences</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Dietary preferences:</strong> ${participant.preferences_alimentaires || '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Billing</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Billing institution:</strong> ${participant.facturation_institution || '-'}</div>
              <div><strong>Billing address:</strong> ${participant.facturation_adresse || '-'}</div>
              <div><strong>Tax office:</strong> ${participant.bureau_fiscal || '-'}</div>
              <div><strong>Tax number:</strong> ${participant.numero_fiscal || '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Diversity</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Residence:</strong> ${participant.residence || '-'}</div>
              <div><strong>Disability:</strong> ${participant.handicap || '-'}</div>
              <div><strong>Other religion:</strong> ${participant.autre_religion || '-'}</div>
            </div>
          </div>
        </div>
      `,
      width: '600px',
      showConfirmButton: true,
      confirmButtonText: 'Close',
      confirmButtonColor: '#1a7a3c',
    });
  };

  return (
    <div>
      {/* Statistiques */}
      <div className="px-6 pt-6 pb-2">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Total participants</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Disabled</p>
            <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Authors</p>
            <p className="text-2xl font-bold text-[#1a7a3c]">{stats.authors}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-gray-900 shrink-0">
            Participants
          </span>

          <div className="flex-1 relative">
            <Icon d={ICONS.search} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or institution..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 transition-colors shrink-0 ${
              showFilters || selectedType || selectedStatus ? "bg-[#1a7a3c] text-white" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Icon d={ICONS.filter} size={16} />
          </button>

          <button
            onClick={exportParticipants}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors shrink-0"
          >
            <Icon d={ICONS.download} size={15} />
            Export CSV
          </button>

          <button
            onClick={onGoToImport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors shrink-0 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          >
            <Icon d={ICONS.upload} size={15} className="text-green-700" />
            Upload Accepted Papers
          </button>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none"
              >
                <option value="">All</option>
                {PARTICIPANT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none"
              >
                <option value="">All</option>
                {ACCOUNT_STATUS.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Payment status:</span>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none"
              >
                <option value="">All</option>
                {PAYMENT_STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            {(selectedType || selectedStatus || selectedPaymentStatus) && (
              <button
                onClick={() => { setSelectedType(""); setSelectedStatus(""); setSelectedPaymentStatus(""); }}
                className="text-xs text-red-500 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actions groupées */}
      {showBulkActions && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {selectedParticipants.length} participant(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                for (const id of selectedParticipants) {
                  await updatePaymentStatus(id, "ACTIF");
                }
                setSelectedParticipants([]);
              }}
              className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700"
            >
              Activate
            </button>
            <button
              onClick={async () => {
                for (const id of selectedParticipants) {
                  await updatePaymentStatus(id, "DESACTIVE");
                }
                setSelectedParticipants([]);
              }}
              className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700"
            >
              Disable
            </button>
            <button
              onClick={async () => {
                const result = await Swal.fire({
                  title: 'Are you sure?',
                  text: `Delete ${selectedParticipants.length} participant(s)?`,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#d33',
                  cancelButtonColor: '#3085d6',
                  confirmButtonText: 'Yes, delete it!',
                  cancelButtonText: 'Cancel'
                });

                if (result.isConfirmed) {
                  for (const id of selectedParticipants) {
                    await deleteParticipant(id);
                  }
                  setSelectedParticipants([]);
                }
              }}
              className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 w-8">
                <input
                  type="checkbox"
                  checked={selectedParticipants.length === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#1a7a3c] focus:ring-[#1a7a3c]"
                />
              </th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">ID</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Affiliation</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Country</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Payment status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Author</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-10 text-center text-gray-400">
                  No participants found.
                </td>
              </tr>
            ) : (
              filtered.map((participant, i) => (
                <tr
                  key={participant.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                    i === filtered.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(participant.id)}
                      onChange={() => toggleSelectParticipant(participant.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#1a7a3c] focus:ring-[#1a7a3c]"
                    />
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-gray-400">#{participant.id}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a7a3c] to-[#2d5a3f] flex items-center justify-center text-white text-xs font-semibold">
                        {participant.prenom?.[0] || ''}{participant.nom?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{participant.prenom} {participant.nom}</p>
                        <p className="text-xs text-gray-400">{participant.pays}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <Icon d={ICONS.mail} size={12} className="text-gray-400" />
                      <span className="text-gray-600 text-sm">{participant.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(participant.type_participant)}`}>
                      {participant.type_participant}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600 text-sm max-w-xs truncate">
                    {participant.affiliation}
                  </td>
                  <td className="px-4 py-4 text-gray-600 text-sm">
                    {participant.pays}
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={participant.statut_compte}
                      onChange={(e) => updatePaymentStatus(participant.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold border-0 focus:ring-1 focus:ring-[#1a7a3c] ${getStatusBadgeColor(participant.statut_compte)}`}
                    >
                      {ACCOUNT_STATUS.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    {participant.statut_paiement ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${PAYMENT_STATUS_STYLE[participant.statut_paiement] ?? "bg-gray-100 text-gray-600"}`}>
                        {participant.statut_paiement}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${participant.est_auteur ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>
                      {participant.est_auteur ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewParticipant(participant)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="View details"
                      >
                        <Icon d={ICONS.eye} size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/participants/edit/${participant.id}`)}
                        className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                        title="Edit"
                      >
                        <Icon d={ICONS.edit} size={16} />
                      </button>
                      <button
                        onClick={() => toggleMyInfoUnlock(participant)}
                        className={`transition-colors ${participant.myinfo_deverrouille_par_admin ? "text-amber-500 hover:text-gray-500" : "text-gray-400 hover:text-amber-500"}`}
                        title={participant.myinfo_locked
                          ? "Profile locked (paid) — click to unlock"
                          : participant.myinfo_deverrouille_par_admin
                            ? "Admin unlock active — click to re-lock"
                            : "Profile not locked — click to unlock in advance"}
                      >
                        <Icon d={participant.myinfo_deverrouille_par_admin ? ICONS.unlock : ICONS.lock} size={16} />
                      </button>
                      {!isEditor(currentUser) && (
                        <button
                          onClick={() => deleteParticipant(participant.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Icon d={ICONS.delete} size={16} />
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

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-500">
              Showing <span className="font-semibold">{pagination.from || 0}</span> to{" "}
              <span className="font-semibold">{pagination.to || 0}</span> of{" "}
              <span className="font-semibold">{pagination.total || 0}</span> participants
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200/50">
              <span>Show</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="px-1 py-0.5 rounded border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a7a3c]/30 font-medium cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>per page</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: pagination.last_page }, (_, index) => {
              const pageNum = index + 1;
              const isVisible =
                pageNum === 1 ||
                pageNum === pagination.last_page ||
                Math.abs(pageNum - pagination.current_page) <= 1;

              if (!isVisible) {
                if (pageNum === 2 || pageNum === pagination.last_page - 1) {
                  return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                    pagination.current_page === pageNum
                      ? "bg-[#1a7a3c] text-white font-bold"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Total: {pagination ? pagination.total : filtered.length} participant(s)</span>
          <div className="flex gap-4">
            <span>Active: {stats.active}</span>
            <span>Disabled: {stats.inactive}</span>
            <span>Authors: {stats.authors}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
