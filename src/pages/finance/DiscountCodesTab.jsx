import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { discountCodeService } from "../../services/discountCodeService";

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
  plus: "M12 5v14M5 12h14",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  power: "M18.36 6.64A9 9 0 1 1 5.64 6.64M12 2v10",
  history: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  chevronDown: "M6 9l6 6 6-6",
};

const formatDateTime = (value) => {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";
  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
};

export default function DiscountCodesTab() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeUsage, setTypeUsage] = useState("");
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [historyData, setHistoryData] = useState({});
  const [historyLoadingId, setHistoryLoadingId] = useState(null);

  useEffect(() => {
    const delay = setTimeout(() => {
      loadCodes();
    }, 150);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeUsage]);

  const loadCodes = async () => {
    try {
      setLoading(true);
      const res = await discountCodeService.getAll({ search, type_usage: typeUsage, page: 1, per_page: 100 });
      setCodes(res?.data ?? (Array.isArray(res) ? res : []));
    } catch (error) {
      console.error("Error loading promo codes:", error);
      Swal.fire("Error", "Unable to load promo codes.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (code) => {
    const result = await Swal.fire({
      title: code.activated ? "Disable this code?" : "Reactivate this code?",
      text: code.activated
        ? "The code will no longer be usable by participants."
        : "The code will become usable by participants again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: code.activated ? "#d33" : "#1a7a3c",
      cancelButtonColor: "#3085d6",
      confirmButtonText: code.activated ? "Yes, disable" : "Yes, reactivate",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      if (code.activated) {
        await discountCodeService.deactivate(code.id);
      } else {
        await discountCodeService.activate(code.id);
      }
      await loadCodes();
      Swal.fire({ icon: "success", title: "Success", text: "Status updated.", timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error("Error changing status:", error);
      Swal.fire("Error", "Unable to update status.", "error");
    }
  };

  const toggleHistory = async (code) => {
    if (expandedId === code.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(code.id);

    if (historyData[code.id]) return;

    try {
      setHistoryLoadingId(code.id);
      const res = await discountCodeService.getUsageHistory(code.id);
      const rows = res?.data ?? [];
      setHistoryData((prev) => ({ ...prev, [code.id]: rows }));
    } catch (error) {
      console.error("Error loading history:", error);
      Swal.fire("Error", "Unable to load history.", "error");
      setExpandedId(null);
    } finally {
      setHistoryLoadingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Icon d={ICONS.search} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a promo code..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
          />
        </div>
        <select
          value={typeUsage}
          onChange={(e) => setTypeUsage(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a7a3c]/30"
        >
          <option value="">All types</option>
          <option value="unique">Single use</option>
          <option value="massif">Bulk use</option>
        </select>
        <button
          onClick={() => navigate("/promo-codes/create")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm"
        >
          <Icon d={ICONS.plus} size={15} />
          Add a Promo Code
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Code</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Usage type</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Discount</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Uses</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-24 py-3 text-gray-500 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading...</td>
              </tr>
            ) : codes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">No promo codes found.</td>
              </tr>
            ) : (
              codes.map((code) => (
                <React.Fragment key={code.id}>
                  <tr className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${!code.activated ? "opacity-60" : ""}`}>
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-800">{code.code}</td>
                    <td className="px-4 py-4 text-gray-600">
                      {code.type_usage === "unique" ? "Single use" : "Bulk use"}
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">{code.pourcentage}%</td>
                    <td className="px-4 py-4 text-gray-600">{code.nombre_utilisations ?? 0}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${code.activated ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {code.activated ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/promo-codes/edit/${code.id}`)}
                          className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                          title="Edit"
                        >
                          <Icon d={ICONS.edit} size={16} />
                        </button>
                        <button
                          onClick={() => toggleStatus(code)}
                          className={`transition-colors ${code.activated ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-600"}`}
                          title={code.activated ? "Disable" : "Reactivate"}
                        >
                          <Icon d={ICONS.power} size={16} />
                        </button>
                        <button
                          onClick={() => toggleHistory(code)}
                          className={`transition-colors ${expandedId === code.id ? "text-[#1a7a3c]" : "text-gray-400 hover:text-[#1a7a3c]"}`}
                          title="Usage history"
                        >
                        <div className="flex items-center gap-1">
                          <p>Usage history </p>
                          <Icon
                            d={ICONS.chevronDown}
                            size={16}
                            className={`transition-transform ${expandedId === code.id ? "rotate-180" : ""}`}
                          />
                        </div>
                          
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === code.id && (
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td colSpan={6} className="px-6 py-4">
                        {historyLoadingId === code.id ? (
                          <p className="text-sm text-gray-400">Loading history...</p>
                        ) : (historyData[code.id] ?? []).length === 0 ? (
                          <p className="text-sm text-gray-400">This code has not been used yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {(historyData[code.id] ?? []).map((r) => (
                              <div
                                key={r.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-white border border-gray-100 rounded-lg px-4 py-2 text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      r.source === "gala_ticket" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {r.source === "gala_ticket" ? "Gala Dinner" : "Registration"}
                                  </span>
                                  <span className="text-gray-700">{r.email ?? "-"}</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-500">
                                  <span>
                                    Discount: <strong className="text-gray-800">{r.montant_reduction ?? "-"} {r.montant_reduction != null ? r.devise ?? "" : ""}</strong>
                                  </span>
                                  <span>Payment: {formatDateTime(r.date_paiement)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Total: {codes.length} promo code(s)</span>
          <span>
            Active: {codes.filter((c) => c.activated).length} | Disabled: {codes.filter((c) => !c.activated).length}
          </span>
        </div>
      </div>
    </div>
  );
}
