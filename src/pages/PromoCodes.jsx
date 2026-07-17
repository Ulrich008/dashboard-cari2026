import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const ICONS = {
  search: "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  plus: "M12 5v14M5 12h14",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  delete: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  power: "M18.36 6.64A9 9 0 1 1 5.64 6.64M12 2v10",
};

export default function PromoCodes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [promoCodes, setPromoCodes] = useState([
    { id: 1, code: "SPON-4567", type: "percentage", value: "20%", maxUses: 20, expiry: "24/08/2026", status: "Active" },
    { id: 2, code: "PART-7890", type: "fixed", value: "80€", maxUses: 10, expiry: "24/08/2026", status: "Active" },
  ]);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas récupérer ce code promo !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        setPromoCodes(promoCodes.filter(p => p.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'Le code promo a été supprimé.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleToggleStatus = (id) => {
    setPromoCodes(promoCodes.map(p => 
      p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p
    ));
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestion Code promo</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez les codes promotionnels de la conférence</p>
      </div>

      <div className="mx-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header avec recherche et bouton */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
          <div className="flex-1 relative">
            <Icon d={ICONS.search} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherchez un code promo"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
            />
          </div>
          <button 
            onClick={() => navigate("/promo-codes/create")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm"
          >
            <Icon d={ICONS.plus} size={15} />
            Ajouter un Code promo
          </button>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Code</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Discount Type</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Value</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Maximum Uses</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Expiry Date</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    Aucun code promo trouvé.
                  </td>
                </tr>
              ) : (
                promoCodes.map((promo) => (
                  <tr key={promo.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-800">{promo.code}</td>
                    <td className="px-4 py-4 text-gray-600">
                      {promo.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">{promo.value}</td>
                    <td className="px-4 py-4 text-gray-600">{promo.maxUses}</td>
                    <td className="px-4 py-4 text-gray-500">{promo.expiry}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        promo.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {promo.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => navigate(`/promo-codes/edit/${promo.id}`)}
                          className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                          title="Modifier"
                        >
                          <Icon d={ICONS.edit} size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(promo.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Icon d={ICONS.delete} size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(promo.id)}
                          className={`transition-colors ${
                            promo.status === 'Active' ? 'text-green-600 hover:text-red-400' : 'text-gray-300 hover:text-green-600'
                          }`}
                          title={promo.status === 'Active' ? 'Désactiver' : 'Activer'}
                        >
                          <Icon d={ICONS.power} size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total : {promoCodes.length} code(s) promo</span>
            <span>
              Actifs : {promoCodes.filter(p => p.status === 'Active').length} | 
              Inactifs : {promoCodes.filter(p => p.status !== 'Active').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}