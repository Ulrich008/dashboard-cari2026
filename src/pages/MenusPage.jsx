import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import menuService from "../services/menuService";

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const ICONS = {
  plus:   "M12 5v14M5 12h14",
  edit:   "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  power:  "M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10",
  child:  "M12 5v14M5 12h14",
  link:   "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
};

export default function MenusPage() {
  const navigate = useNavigate();
  const [menus, setMenus]     = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMenus = () => {
    setLoading(true);
    menuService.getAll()
      .then(res => setMenus(res.data.data ?? res.data))
      .catch(() => Swal.fire('Erreur', 'Impossible de charger les menus.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMenus(); }, []);

  const handleToggle = async (item) => {
    const action = item.activated ? 'désactiver' : 'activer';
    const result = await Swal.fire({
      title: `${item.activated ? 'Désactiver' : 'Activer'} "${item.label}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1a7a3c',
      cancelButtonColor: '#d33',
      confirmButtonText: `Oui, ${action}`,
      cancelButtonText: 'Annuler',
    });
    if (!result.isConfirmed) return;
    try {
      await menuService.toggle(item.id);
      Swal.fire({ icon: 'success', title: 'Succès', timer: 1200, showConfirmButton: false });
      loadMenus();
    } catch {
      Swal.fire('Erreur', `Impossible de ${action} ce menu.`, 'error');
    }
  };

  const StatusBadge = ({ activated }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
      activated ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {activated ? 'Actif' : 'Inactif'}
    </span>
  );

  const MenuItem = ({ item, depth = 0 }) => (
    <>
      <tr className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${!item.activated ? 'opacity-50' : ''}`}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
            {depth > 0 && <span className="text-gray-300 text-xs">└─</span>}
            <span className={`font-medium text-gray-800 ${depth === 0 ? 'text-sm' : 'text-xs'}`}>
              {item.label}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-gray-500 font-mono">
          {item.url ?? <span className="text-gray-300 italic">aucune</span>}
        </td>
        <td className="px-4 py-3 text-xs text-gray-500">
          {item.page_slug ?? <span className="text-gray-300 italic">—</span>}
        </td>
        <td className="px-4 py-3 text-xs text-gray-500 text-center">{item.ordre}</td>
        <td className="px-4 py-3"><StatusBadge activated={item.activated} /></td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => navigate(`/menus/edit/${item.id}`)}
              title="Modifier"
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#1a7a3c] hover:bg-green-50 transition-colors"
            >
              <Icon d={ICONS.edit} size={15} />
            </button>
            {depth === 0 && (
              <button
                onClick={() => navigate(`/menus/create?parent_id=${item.id}`)}
                title="Ajouter un sous-menu"
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Icon d={ICONS.child} size={15} />
              </button>
            )}
            <button
              onClick={() => handleToggle(item)}
              title={item.activated ? 'Désactiver' : 'Activer'}
              className={`p-1.5 rounded-lg transition-colors ${
                item.activated
                  ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  : 'text-gray-300 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Icon d={ICONS.power} size={15} />
            </button>
          </div>
        </td>
      </tr>
      {item.children?.map(child => (
        <MenuItem key={child.id} item={child} depth={depth + 1} />
      ))}
    </>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Menus de navigation</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez la structure de navigation du site vitrine.</p>
        </div>
        <button
          onClick={() => navigate('/menus/create')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm"
        >
          <Icon d={ICONS.plus} size={15} />
          Ajouter un menu
        </button>
      </div>

      {/* Table */}
      <div className="px-8 pb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#1a7a3c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : menus.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">Aucun menu configuré.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Label</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">URL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Page liée</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Ordre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menus.map(item => (
                  <MenuItem key={item.id} item={item} depth={0} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
