import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  save:      "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  user:      "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  mail:      "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  role:      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  lock:      "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  key:       "M21 2l-6 6M16 9l3-3M3 13l8-8M8 15l-5 5",
};

const USER_ROLES = [
  { value: "Super Admin", label: "Super Admin", description: "Accès complet à toutes les fonctionnalités", permissions: ["all"] },
  { value: "Admin", label: "Admin", description: "Gestion complète du contenu", permissions: ["read", "write", "delete", "manage_users"] },
  { value: "Editor", label: "Editor", description: "Peut créer et modifier du contenu", permissions: ["read", "write", "edit"] },
  { value: "Author", label: "Author", description: "Peut créer son propre contenu", permissions: ["read", "write_own"] },
  { value: "Viewer", label: "Viewer", description: "Lecture seule", permissions: ["read"] },
  { value: "Contributor", label: "Contributor", description: "Peut soumettre du contenu", permissions: ["read", "submit"] },
];

export default function CreateUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nom_prenoms: "",
    email: "",
    role_admin_id: "",
    password: "",
    password_confirmation: "",
    statut_compte: "ACTIF",
    activated: true,
  });
  const [roles, setRoles] = useState([]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadRoles();
    if (isEditing) {
      loadUser();
    }
  }, [id, isEditing]);

  const loadRoles = async () => {
    try {
      // Pour l'instant, on utilise des rôles statiques car il n'y a pas d'API pour les rôles
      setRoles([
        { id: 1, libelle: "Super Admin", code: "SUPER_ADMIN" },
        { id: 2, libelle: "Admin", code: "ADMIN" },
        { id: 3, libelle: "Editor", code: "EDITOR" },
      ]);
    } catch (error) {
      console.error("Erreur lors du chargement des rôles:", error);
    }
  };

  const loadUser = async () => {
    try {
      const user = await userService.getById(id);
      setFormData({
        nom_prenoms: user.nom_prenoms || "",
        email: user.email || "",
        role_admin_id: user.role_admin_id || "",
        password: "",
        password_confirmation: "",
        statut_compte: user.statut_compte || "ACTIF",
        activated: user.activated !== undefined ? user.activated : true,
      });
    } catch (error) {
      console.error("Erreur lors du chargement de l'utilisateur:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement de l\'utilisateur'
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom_prenoms.trim()) newErrors.nom_prenoms = "Le nom est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email invalide";
    if (!formData.role_admin_id) newErrors.role_admin_id = "Le rôle est requis";
    
    if (!isEditing) {
      if (!formData.password) newErrors.password = "Le mot de passe est requis";
      else if (formData.password.length < 8) newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = "Les mots de passe ne correspondent pas";
      }
    } else if (formData.password) {
      if (formData.password.length < 8) newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = "Les mots de passe ne correspondent pas";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        // Séparer nom et prénom
        const nameParts = formData.nom_prenoms.split(' ');
        const prenom = nameParts[0] || "";
        const nom = nameParts.slice(1).join(' ') || "";

        const userData = {
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          prenom: prenom,
          nom: nom,
          role_id: parseInt(formData.role_admin_id),
          statut_compte: formData.statut_compte,
          activated: formData.activated,
        };

        if (isEditing) {
          await userService.update(id, userData);
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Utilisateur mis à jour avec succès',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          await userService.create(userData);
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Utilisateur créé avec succès',
            timer: 1500,
            showConfirmButton: false
          });
        }

        navigate("/roles");
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la sauvegarde de l\'utilisateur'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getRoleDescription = (roleId) => {
    const role = roles.find(r => r.id === parseInt(roleId));
    return role ? role.libelle : "";
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="flex items-center justify-between px-8 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/roles")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Retour"
          >
            <Icon d={ICONS.arrowLeft} size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditing ? "Modifier un utilisateur" : "Nouvel utilisateur"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/users")}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm disabled:opacity-50"
          >
            <Icon d={ICONS.save} size={15} />
            {isLoading ? "En cours..." : (isEditing ? "Mettre à jour" : "Ajouter")}
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              
              {/* Informations de l'utilisateur */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Informations de l'utilisateur
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {/* Nom complet */}
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Nom & Prénoms <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.user} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.nom_prenoms}
                        onChange={(e) => setFormData({...formData, nom_prenoms: e.target.value})}
                        placeholder="Ex: Jean Dupont"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          errors.nom_prenoms ? 'border-red-400' : 'border-gray-200'
                        } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                    </div>
                    {errors.nom_prenoms && <p className="text-xs text-red-500">{errors.nom_prenoms}</p>}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.mail} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="ex: jean.dupont@example.com"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          errors.email ? 'border-red-400' : 'border-gray-200'
                        } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  {/* Rôle */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Rôle <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.role} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={formData.role_admin_id}
                        onChange={(e) => setFormData({...formData, role_admin_id: e.target.value})}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition appearance-none"
                      >
                        <option value="">Sélectionner un rôle</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.libelle}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.role_admin_id && <p className="text-xs text-red-500">{errors.role_admin_id}</p>}
                  </div>

                  {/* Mot de passe */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Mot de passe {!isEditing && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.lock} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder={isEditing ? "Laisser vide pour conserver" : "Minimum 8 caractères"}
                        className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${
                          errors.password ? 'border-red-400' : 'border-gray-200'
                        } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <Icon d={ICONS.key} size={14} />
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>

                  {/* Confirmation mot de passe */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Confirmer le mot de passe {!isEditing && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.lock} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password_confirmation}
                        onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                        placeholder="Confirmez le mot de passe"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          errors.password_confirmation ? 'border-red-400' : 'border-gray-200'
                        } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                    </div>
                    {errors.password_confirmation && <p className="text-xs text-red-500">{errors.password_confirmation}</p>}
                  </div>
                </div>
              </div>

              {/* Statut */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Activation
                </h2>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.activated}
                      onChange={() => setFormData({...formData, activated: true})}
                      className="w-4 h-4 text-[#1a7a3c] focus:ring-[#1a7a3c]"
                    />
                    <span className="text-sm text-gray-700">Activer immédiatement</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!formData.activated}
                      onChange={() => setFormData({...formData, activated: false})}
                      className="w-4 h-4 text-gray-400 focus:ring-gray-400"
                    />
                    <span className="text-sm text-gray-700">Désactivé</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}