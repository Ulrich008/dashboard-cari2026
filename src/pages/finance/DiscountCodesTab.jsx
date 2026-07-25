import { useState, useEffect } from "react";
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
};

export default function DiscountCodesTab() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeUsage, setTypeUsage] = useState("");
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Erreur lors du chargement des codes promo:", error);
      Swal.fire("Erreur", "Impossible de charger les codes promo.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (code) => {
    const result = await Swal.fire({
      title: code.activated ? "Désactiver ce code ?" : "Réactiver ce code ?",
      text: code.activated
        ? "Le code ne sera plus utilisable par les participants."
        : "Le code redeviendra utilisable par les participants.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: code.activated ? "#d33" : "#1a7a3c",
      cancelButtonColor: "#3085d6",
      confirmButtonText: code.activated ? "Oui, désactiver" : "Oui, réactiver",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      if (code.activated) {
        await discountCodeService.deactivate(code.id);
      } else {
        await discountCodeService.activate(code.id);
      }
      await loadCodes();
      Swal.fire({ icon: "success", title: "Succès", text: "Statut mis à jour.", timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      Swal.fire("Erreur", "Impossible de mettre à jour le statut.", "error");
    }
  };

  const viewHistory = async (code) => {
    try {
      const res = await discountCodeService.getUsageHistory(code.id);
      const rows = res?.data ?? [];
      const html = rows.length
        ? `<div style="text-align:left; font-size:13px; max-height:400px; overflow-y:auto;">${rows
            .map(
              (r) => `<div style="padding:8px 0; border-bottom:1px solid #eee;">
                <div><strong>${r.participant_nom || "Participant #" + r.participant_id}</strong> (${r.participant_email ?? "-"})</div>
                <div style="color:#666;">Registration #${r.registration_id ?? "-"} — ${r.date_usage ?? ""}</div>
              </div>`
            )
            .join("")}</div>`
        : `<p style="color:#999;">Ce code n'a pas encore été utilisé.</p>`;

      Swal.fire({
        title: `Historique — ${code.code}`,
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

  return (
    <div>
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Icon d={ICONS.search} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un code promo..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
          />
        </div>
        <select
          value={typeUsage}
          onChange={(e) => setTypeUsage(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a7a3c]/30"
        >
          <option value="">Tous les types</option>
          <option value="unique">Usage unique</option>
          <option value="massif">Usage massif</option>
        </select>
        <button
          onClick={() => navigate("/promo-codes/create")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm"
        >
          <Icon d={ICONS.plus} size={15} />
          Ajouter un Code promo
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Code</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Type d'usage</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Réduction</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Utilisations</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">Chargement...</td>
              </tr>
            ) : codes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">Aucun code promo trouvé.</td>
              </tr>
            ) : (
              codes.map((code) => (
                <tr key={code.id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${!code.activated ? "opacity-60" : ""}`}>
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-800">{code.code}</td>
                  <td className="px-4 py-4 text-gray-600">
                    {code.type_usage === "unique" ? "Usage unique" : "Usage massif"}
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-900">{code.pourcentage}%</td>
                  <td className="px-4 py-4 text-gray-600">{code.nombre_utilisations ?? 0}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${code.activated ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {code.activated ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/promo-codes/edit/${code.id}`)}
                        className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                        title="Modifier"
                      >
                        <Icon d={ICONS.edit} size={16} />
                      </button>
                      <button
                        onClick={() => toggleStatus(code)}
                        className={`transition-colors ${code.activated ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-600"}`}
                        title={code.activated ? "Désactiver" : "Réactiver"}
                      >
                        <Icon d={ICONS.power} size={16} />
                      </button>
                      <button
                        onClick={() => viewHistory(code)}
                        className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                        title="Historique d'utilisation"
                      >
                        <Icon d={ICONS.history} size={16} />
                      </button>
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
          <span>Total : {codes.length} code(s) promo</span>
          <span>
            Actifs : {codes.filter((c) => c.activated).length} | Désactivés : {codes.filter((c) => !c.activated).length}
          </span>
        </div>
      </div>
    </div>
  );
}
