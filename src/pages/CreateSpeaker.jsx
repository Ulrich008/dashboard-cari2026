import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { speakerService } from "../services/speakerService";

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
  save:     "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  user:     "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  building: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  mail:     "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  type:     "M4 7h16M4 12h16M4 17h10",
  bio:      "M4 4h16v16H4zM9 9h6M9 13h6M9 17h4",
  camera:   "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  upload:   "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
};

const MEMBER_TYPES = [
  { value: "speaker", label: "Speaker", description: "Conférencier" },
  { value: "program_committee", label: "Program Committee", description: "Membre du comité de programme" },
  { value: "organizing_committee", label: "Organizing Committee", description: "Membre du comité d'organisation" },
];

export default function CreateSpeaker() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    affiliation: "",
    type: "speaker",
    bio: "",
    telephone: "",
    website: "",
    photo_fichier_id: null,
    activated: true,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadSpeaker();
    }
  }, [id, isEditing]);

  const loadSpeaker = async () => {
    try {
      const speaker = await speakerService.getById(id);
      setFormData({
        prenom: speaker.prenom,
        nom: speaker.nom,
        email: speaker.email,
        affiliation: speaker.affiliation,
        type: speaker.type,
        bio: speaker.bio || "",
        telephone: speaker.telephone || "",
        website: speaker.website || "",
        photo_fichier_id: speaker.photo_fichier_id || null,
        activated: speaker.activated,
      });
      if (speaker.photo_fichier_id) {
        setPhotoPreview(speaker.photo_fichier_id);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du speaker:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement du speaker'
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.type) newErrors.type = "Le type est requis";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email invalide";
    if (formData.website && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(formData.website)) newErrors.website = "URL invalide";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Implémenter l'upload de fichier et récupérer l'ID
      // Pour l'instant, on utilise un placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData({ ...formData, photo_fichier_id: 1 }); // Placeholder ID
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        const memberData = { ...formData };

        if (isEditing) {
          await speakerService.update(id, memberData);
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Speaker mis à jour avec succès',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          await speakerService.create(memberData);
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Speaker créé avec succès',
            timer: 1500,
            showConfirmButton: false
          });
        }

        navigate("/speakers");
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la sauvegarde du speaker'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="flex items-center justify-between px-8 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/speakers")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Retour"
          >
            <Icon d={ICONS.arrowLeft} size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditing ? "Modifier un membre" : "Ajouter un speaker / committee"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/speakers")}
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
              
              {/* Photo */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Photo
                </h2>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a7a3c] to-[#2d5a3f] flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Icon d={ICONS.user} size={32} className="text-white" />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-full shadow-md cursor-pointer border border-gray-200 hover:bg-gray-50">
                      <Icon d={ICONS.camera} size={14} className="text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400">
                    Format recommandé : JPG, PNG. Taille max : 2MB
                  </p>
                </div>
              </div>

              {/* Informations générales */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Informations générales
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.user} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.prenom}
                        onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                        placeholder="Ex: John"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          errors.prenom ? 'border-red-400' : 'border-gray-200'
                        } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                    </div>
                    {errors.prenom && <p className="text-xs text-red-500">{errors.prenom}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.user} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        placeholder="Ex: Doe"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          errors.nom ? 'border-red-400' : 'border-gray-200'
                        } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                    </div>
                    {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.mail} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="ex: john.doe@example.com"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          errors.email ? 'border-red-400' : 'border-gray-200'
                        } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Affiliation
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.building} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.affiliation}
                        onChange={(e) => setFormData({...formData, affiliation: e.target.value})}
                        placeholder="Ex: University of Abomey-Calavi"
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                      />
                    </div>
                  </div>

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
                        {MEMBER_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label} - {type.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.type} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.telephone}
                        onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                        placeholder="Ex: +229 97 00 00 00"
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Bio
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.bio} size={16} className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        rows={4}
                        placeholder="Biographie du membre..."
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition resize-none"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Site web
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.type} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="Ex: https://example.com"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          errors.website ? 'border-red-400' : 'border-gray-200'
                        } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                    </div>
                    {errors.website && <p className="text-xs text-red-500">{errors.website}</p>}
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
                      checked={formData.activated}
                      onChange={() => setFormData({...formData, activated: true})}
                      className="w-4 h-4 text-[#1a7a3c] focus:ring-[#1a7a3c]"
                    />
                    <span className="text-sm text-gray-700">Actif</span>
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