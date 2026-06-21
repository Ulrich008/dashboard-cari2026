import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { sponsorService } from "../services/sponsorService";
import fichierService from "../services/fichierService";

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
  building:  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  link:      "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  type:      "M4 7h16M4 12h16M4 17h10",
  upload:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  image:     "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  id:        "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
};

const SPONSOR_TYPES = [
  { value: "Platinum Sponsor", label: "Platinum Sponsor", description: "Sponsor Platine - Niveau maximum" },
  { value: "Gold Sponsor", label: "Gold Sponsor", description: "Sponsor Or" },
  { value: "Silver Sponsor", label: "Silver Sponsor", description: "Sponsor Argent" },
  { value: "Bronze Sponsor", label: "Bronze Sponsor", description: "Sponsor Bronze" },
  { value: "Partners Institution", label: "Partners Institution", description: "Partenaire Institutionnel" },
  { value: "Media Partner", label: "Media Partner", description: "Partenaire Média" },
  { value: "Academic Partner", label: "Academic Partner", description: "Partenaire Académique" },
];

// Générer un ID public unique
const generatePublicId = () => {
  const prefixes = ["Sponsor", "Partner", "Gold", "Silver", "Platinum"];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNum = Math.floor(Math.random() * 100) + 1;
  return `${randomPrefix}-${randomNum}`;
};

export default function CreateSponsor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nom: "",
    type: "Partners Institution",
    url: "",
    email: "",
    telephone: "",
    description: "",
    logo_fichier_id: null,
    affiche_site_public: true,
    ordre_affichage: 0,
    activated: true,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadSponsor();
    }
  }, [id, isEditing]);

  const loadSponsor = async () => {
    try {
      const sponsor = await sponsorService.getById(id);
      setFormData({
        nom: sponsor.nom || "",
        type: sponsor.type,
        url: sponsor.url || "",
        email: sponsor.email || "",
        telephone: sponsor.telephone || "",
        description: sponsor.description || "",
        logo_fichier_id: sponsor.logo_fichier_id || null,
        affiche_site_public: sponsor.affiche_site_public !== undefined ? sponsor.affiche_site_public : true,
        ordre_affichage: sponsor.ordre_affichage || 0,
        activated: sponsor.activated !== undefined ? sponsor.activated : true,
      });
      if (sponsor.logo_fichier_id) {
        setLogoPreview(`${import.meta.env.VITE_API_URL}/public/fichiers/${sponsor.logo_fichier_id}`);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du sponsor:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement du sponsor'
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.type) newErrors.type = "Le type est requis";
    if (formData.url && !/^https?:\/\/.+\..+/.test(formData.url)) newErrors.url = "URL invalide (ex: https://example.com)";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email invalide";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'Fichier trop lourd', text: 'Le fichier ne doit pas dépasser 2MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
    setLogoUploading(true);
    fichierService.upload(file, 'logo_sponsor')
      .then(fichier => setFormData(prev => ({ ...prev, logo_fichier_id: fichier.id })))
      .catch(() => Swal.fire({ icon: 'error', title: 'Erreur', text: "Impossible d'uploader le logo." }))
      .finally(() => setLogoUploading(false));
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        const sponsorData = { ...formData };

        if (isEditing) {
          await sponsorService.update(id, sponsorData);
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Sponsor mis à jour avec succès',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          await sponsorService.create(sponsorData);
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Sponsor créé avec succès',
            timer: 1500,
            showConfirmButton: false
          });
        }

        navigate("/sponsors");
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la sauvegarde du sponsor'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const regeneratePublicId = () => {
    setFormData({ ...formData, publicId: generatePublicId() });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="flex items-center justify-between px-8 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/sponsors")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Retour"
          >
            <Icon d={ICONS.arrowLeft} size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditing ? "Modifier un sponsor" : "Nouveau Sponsor / Partner"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/sponsors")}
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
              
              {/* Logo Upload */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Logo
                </h2>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Icon d={ICONS.image} size={32} className="text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">Aucun logo</p>
                        </div>
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-full shadow-md cursor-pointer border border-gray-200 hover:bg-gray-50">
                      <Icon d={ICONS.upload} size={14} className="text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Cliquez pour sélectionner un fichier</p>
                    <p className="text-xs text-gray-400">
                      Format recommandé : PNG, JPG. Taille max : 2MB
                    </p>
                    {logoUploading && <p className="text-xs text-[#1a7a3c] mt-1">Upload en cours…</p>}
                  </div>
                </div>
              </div>

              {/* Informations générales */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Informations générales
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {/* Nom */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.building} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        placeholder="Ex: IFRI, Orange, etc."
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          errors.nom ? 'border-red-400' : 'border-gray-200'
                        } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                    </div>
                    {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
                  </div>

                  {/* Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.type} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition appearance-none"
                      >
                        {SPONSOR_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label} - {type.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* URL */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Site web
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.link} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                        placeholder="https://exemple.com"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          errors.url ? 'border-red-400' : 'border-gray-200'
                        } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                    </div>
                    {errors.url && <p className="text-xs text-red-500">{errors.url}</p>}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="contact@exemple.com"
                      className={`w-full px-3 py-2.5 rounded-lg border ${
                        errors.email ? 'border-red-400' : 'border-gray-200'
                      } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  {/* Téléphone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      placeholder="+213 555 123 456"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                    />
                  </div>

                  {/* Ordre d'affichage */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Ordre d'affichage
                    </label>
                    <input
                      type="number"
                      value={formData.ordre_affichage}
                      onChange={(e) => setFormData({...formData, ordre_affichage: parseInt(e.target.value) || 0})}
                      placeholder="0"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                    />
                  </div>

                  {/* Afficher sur le site public */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Afficher sur le site public
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.affiche_site_public}
                        onChange={(e) => setFormData({...formData, affiche_site_public: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300 text-[#1a7a3c] focus:ring-[#1a7a3c]"
                      />
                      <span className="text-sm text-gray-600">Oui, afficher ce sponsor sur le site public</span>
                    </label>
                  </div>

                  {/* Description */}
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      placeholder="Description du sponsor/partenaire..."
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Statut */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Statut
                </h2>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.online}
                      onChange={() => setFormData({...formData, online: true})}
                      className="w-4 h-4 text-[#1a7a3c] focus:ring-[#1a7a3c]"
                    />
                    <span className="text-sm text-gray-700">Activer immédiatement</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!formData.online}
                      onChange={() => setFormData({...formData, online: false})}
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