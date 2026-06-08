import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { userService } from "../services/userService";

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
  role:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  power:    "M18.36 6.64A9 9 0 1 1 5.64 6.64M12 2v10",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
};

const USER_ROLES = [
  { value: "Super Admin", label: "Super Admin", description: "Accès complet à toutes les fonctionnalités", color: "red" },
  { value: "Admin", label: "Admin", description: "Gestion complète du contenu", color: "purple" },
  { value: "Editor", label: "Editor", description: "Peut créer et modifier du contenu", color: "blue" },
  { value: "Author", label: "Author", description: "Peut créer son propre contenu", color: "green" },
  { value: "Viewer", label: "Viewer", description: "Lecture seule", color: "gray" },
  { value: "Contributor", label: "Contributor", description: "Peut soumettre du contenu", color: "orange" },
];

export default function UsersRoles() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      console.log("Users loaded:", data);
      setUsers(data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement des utilisateurs'
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((user) => {
    const matchesSearch = (user.nom_prenoms || user.name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (user.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = !selectedRole || (user.role_admin && user.role_admin.libelle === selectedRole);
    return matchesSearch && matchesRole;
  });

  const toggleOnline = async (id) => {
    try {
      const user = users.find(u => u.id === id);
      const updatedData = {
        ...user,
        activated: !user.activated,
      };
      await userService.update(id, updatedData);
      await loadUsers();
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Statut mis à jour avec succès',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la mise à jour du statut'
      });
    }
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas récupérer cet utilisateur !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await userService.delete(id);
        await loadUsers();
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'L\'utilisateur a été supprimé.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la suppression'
        });
      }
    }
  };

  const viewUser = (user) => {
    Swal.fire({
      title: `<strong>${user.nom_prenoms || user.name}</strong>`,
      html: `
        <div class="text-left" style="font-size: 14px;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Informations générales</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Email:</strong> ${user.email || '-'}</div>
              <div><strong>Rôle:</strong> ${user.role_admin ? user.role_admin.libelle : '-'}</div>
              <div><strong>Statut du compte:</strong> ${user.statut_compte || '-'}</div>
              <div><strong>Activé:</strong> ${user.activated !== undefined ? (user.activated ? 'Oui' : 'Non') : (user.online ? 'Oui' : 'Non')}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Dates</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Dernière connexion:</strong> ${user.date_derniere_connexion || '-'}</div>
              <div><strong>Créé le:</strong> ${user.created_at || '-'}</div>
            </div>
          </div>
        </div>
      `,
      width: '600px',
      showConfirmButton: true,
      confirmButtonText: 'Fermer',
      confirmButtonColor: '#1a7a3c',
    });
  };

  const getRoleLabel = (user) => {
    if (user.role_admin?.libelle) return user.role_admin.libelle;
    if (user.role_admin?.code) return user.role_admin.code;
    if (typeof user.role === 'string') return user.role;
    if (typeof user.role === 'object' && user.role?.libelle) return user.role.libelle;
    if (typeof user.role === 'object' && user.role?.code) return user.role.code;
    return '-';
  };

  const getRoleBadgeColor = (role) => {
    const roleMap = {
      "Super Admin": "bg-red-100 text-red-700",
      "Admin": "bg-purple-100 text-purple-700",
      "Editor": "bg-blue-100 text-blue-700",
      "Author": "bg-green-100 text-green-700",
      "Viewer": "bg-gray-100 text-gray-700",
      "Contributor": "bg-orange-100 text-orange-700",
    };
    // Ensure role is a string, not an object
    const roleStr = typeof role === 'object' && role !== null ? role.libelle || role.code || '' : role;
    return roleMap[roleStr] || "bg-gray-100 text-gray-700";
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Gestion des utilisateurs et rôles
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les utilisateurs et leurs permissions
        </p>
      </div>

      <div className="mx-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-gray-900 shrink-0">
              Utilisateurs
            </span>

            <div className="flex-1 relative">
              <Icon
                d={ICONS.search}
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
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
                showFilters || selectedRole ? "bg-[#1a7a3c] text-white border-[#1a7a3c]" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon d={ICONS.filter} size={16} />
            </button>

            <button
              onClick={() => navigate("/users/create")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm shrink-0"
            >
              <Icon d={ICONS.plus} size={15} />
              Ajouter un utilisateur
            </button>
          </div>

          {showFilters && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100 flex-wrap">
              <span className="text-xs font-medium text-gray-500">Filtrer par rôle :</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedRole("")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    !selectedRole
                      ? "bg-[#1a7a3c] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tous
                </button>
                {USER_ROLES.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedRole === role.value
                        ? "bg-[#1a7a3c] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Nom</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Rôle</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Dernière connexion</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                      i === filtered.length - 1 ? "border-b-0" : ""
                    } ${!user.activated ? "opacity-60" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a7a3c] to-[#2d5a3f] flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(user.nom_prenoms || user.name)}
                        </div>
                        <span className="font-medium text-gray-800">{user.nom_prenoms || user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Icon d={ICONS.mail} size={12} className="text-gray-400" />
                        <span className="text-gray-600">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(getRoleLabel(user))}`}>
                        {getRoleLabel(user)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-sm">
                      {user.date_derniere_connexion || "Jamais"}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.statut_compte === 'ACTIF' ? 'bg-green-100 text-green-700' :
                        user.statut_compte === 'DESACTIVE' ? 'bg-gray-100 text-gray-700' :
                        user.statut_compte === 'SUSPENDU' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.statut_compte === 'ACTIF' ? 'Actif' : user.statut_compte === 'DESACTIVE' ? 'Désactivé' : user.statut_compte === 'SUSPENDU' ? 'Suspendu' : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => viewUser(user)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="Voir les détails"
                        >
                          <Icon d={ICONS.eye} size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                          className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                          title="Modifier"
                        >
                          <Icon d={ICONS.edit} size={16} />
                        </button>
                        <button
                          onClick={() => toggleOnline(user.id)}
                          className={`transition-colors ${
                            user.activated !== undefined ? (user.activated ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-600") : (user.online ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-600")
                          }`}
                          title={user.activated !== undefined ? (user.activated ? "Désactiver" : "Activer") : (user.online ? "Désactiver" : "Activer")}
                        >
                          <Icon d={ICONS.power} size={16} />
                        </button>
                        {!(user.role_admin && user.role_admin.code === 'SUPER_ADMIN') && (
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Supprimer"
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

        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total : {filtered.length} utilisateur(s)</span>
            <span>
              Actifs : {filtered.filter(u => u.online).length} | 
              Inactifs : {filtered.filter(u => !u.online).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}