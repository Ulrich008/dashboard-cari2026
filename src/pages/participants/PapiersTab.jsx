import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { papierService } from "../../services/papierService";
import { evenementService } from "../../services/evenementService";

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
  edit:   "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  delete: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  eye:    "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
};

const DECISION_OPTIONS = [
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const TYPE_PRESENTATION_OPTIONS = [
  { value: "oral", label: "Oral" },
  { value: "poster", label: "Poster" },
];

export default function PapiersTab() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [papiers, setPapiers] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [selectedEvenementId, setSelectedEvenementId] = useState("");
  const [selectedDecision, setSelectedDecision] = useState("");
  const [selectedTypePresentation, setSelectedTypePresentation] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    evenementService.getAll()
      .then((res) => setEvenements(Array.isArray(res) ? res : (res?.data ?? [])))
      .catch(() => setEvenements([]));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedEvenementId, selectedDecision, selectedTypePresentation, perPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadPapiers(currentPage);
    }, 150);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, selectedEvenementId, selectedDecision, selectedTypePresentation, perPage]);

  const loadPapiers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await papierService.getAll({
        page,
        search,
        evenement_id: selectedEvenementId,
        decision: selectedDecision,
        type_presentation: selectedTypePresentation,
        per_page: perPage,
      });
      if (res && res.meta) {
        setPapiers(res.data);
        setPagination(res.meta);
      } else {
        setPapiers(Array.isArray(res) ? res : []);
        setPagination(null);
      }
    } catch (error) {
      console.error("Error loading papers:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Error loading papers." });
    } finally {
      setLoading(false);
    }
  };

  const filtered = papiers;

  const deletePapier = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This paper will be disabled and will no longer appear in the lists.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await papierService.delete(id);
        await loadPapiers(currentPage);
        Swal.fire({ icon: "success", title: "Deleted!", text: "The paper has been deleted.", timer: 1500, showConfirmButton: false });
      } catch (error) {
        console.error("Error deleting:", error);
        Swal.fire({ icon: "error", title: "Error", text: "Error deleting." });
      }
    }
  };

  const viewPapier = async (papier) => {
    try {
      const detail = await papierService.getById(papier.id);
      const auteurs = detail.auteurs?.length
        ? detail.auteurs.map((a) => `${a.prenom} ${a.nom}${a.est_auteur_principal ? " (principal)" : ""}`).join("<br/>")
        : "-";

      Swal.fire({
        title: `<strong>${detail.titre}</strong>`,
        html: `
          <div class="text-left" style="font-size: 14px;">
            <div style="margin-bottom: 12px;">
              <strong style="color: #1a7a3c;">General information</strong>
              <div style="margin-top: 4px; color: #666;">
                <div><strong>Submission ID:</strong> ${detail.submission_id}</div>
                <div><strong>Track:</strong> ${detail.track || "-"}</div>
                <div><strong>Decision:</strong> ${detail.decision}</div>
                <div><strong>Presentation type:</strong> ${detail.type_presentation}</div>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <strong style="color: #1a7a3c;">Description</strong>
              <div style="margin-top: 4px; color: #666;">${detail.description || "-"}</div>
            </div>
            <div style="margin-bottom: 12px;">
              <strong style="color: #1a7a3c;">Authors</strong>
              <div style="margin-top: 4px; color: #666;">${auteurs}</div>
            </div>
          </div>
        `,
        width: "600px",
        showConfirmButton: true,
        confirmButtonText: "Close",
        confirmButtonColor: "#1a7a3c",
      });
    } catch (error) {
      console.error("Error loading paper:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Error loading paper." });
    }
  };

  const getDecisionBadgeColor = (decision) => (
    decision === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
  );

  return (
    <div>
      <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-gray-900 shrink-0">Accepted Papers</span>

          <div className="flex-1 relative">
            <Icon d={ICONS.search} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, submission ID or track..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 transition-colors shrink-0 ${
              showFilters || selectedEvenementId || selectedDecision || selectedTypePresentation
                ? "bg-[#1a7a3c] text-white border-[#1a7a3c]"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Icon d={ICONS.filter} size={16} />
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Event:</span>
              <select
                value={selectedEvenementId}
                onChange={(e) => setSelectedEvenementId(e.target.value)}
                className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none"
              >
                <option value="">All</option>
                {evenements.map((evt) => (
                  <option key={evt.id} value={evt.id}>{evt.titre || evt.code}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Decision:</span>
              <select
                value={selectedDecision}
                onChange={(e) => setSelectedDecision(e.target.value)}
                className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none"
              >
                <option value="">All</option>
                {DECISION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Type:</span>
              <select
                value={selectedTypePresentation}
                onChange={(e) => setSelectedTypePresentation(e.target.value)}
                className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none"
              >
                <option value="">All</option>
                {TYPE_PRESENTATION_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            {(selectedEvenementId || selectedDecision || selectedTypePresentation) && (
              <button
                onClick={() => { setSelectedEvenementId(""); setSelectedDecision(""); setSelectedTypePresentation(""); }}
                className="text-xs text-red-500 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-6 py-3 text-gray-500 font-medium">ID</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Submission</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Title</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Track</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Decision</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400">Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400">No papers found.</td>
              </tr>
            ) : (
              filtered.map((papier, i) => (
                <tr
                  key={papier.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                    i === filtered.length - 1 ? "border-b-0" : ""
                  } ${!papier.activated ? "opacity-60" : ""}`}
                >
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">#{papier.id}</td>
                  <td className="px-4 py-4 font-mono text-xs text-gray-500">{papier.submission_id}</td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-800 line-clamp-2">{papier.titre}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-600 text-sm">{papier.track || "-"}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDecisionBadgeColor(papier.decision)}`}>
                      {papier.decision}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600 text-sm">{papier.type_presentation}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => viewPapier(papier)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="View details"
                      >
                        <Icon d={ICONS.eye} size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/participants/papiers/edit/${papier.id}`)}
                        className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                        title="Edit"
                      >
                        <Icon d={ICONS.edit} size={16} />
                      </button>
                      <button
                        onClick={() => deletePapier(papier.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Icon d={ICONS.delete} size={16} />
                      </button>
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
              <span className="font-semibold">{pagination.total || 0}</span> papers
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

      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Total: {pagination ? pagination.total : filtered.length} paper(s)</span>
        </div>
      </div>
    </div>
  );
}
