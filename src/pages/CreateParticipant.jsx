import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { participantService } from "../services/participantService";
import Swal from "sweetalert2";

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
  phone:     "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  building:  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  globe:     "M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9",
};

const PARTICIPANT_TYPES = [
  { value: "regular", label: "Regular" },
  { value: "student", label: "Student" },
];

const TITRES = [
  { value: "", label: "Sélectionner" },
  { value: "Mr", label: "M." },
  { value: "Mrs", label: "Mme" },
  { value: "Dr", label: "Dr" },
  { value: "Prof", label: "Prof" },
  { value: "Ms", label: "Mlle" },
];

const GENRES = [
  { value: "", label: "Sélectionner" },
  { value: "Male", label: "Homme" },
  { value: "Female", label: "Femme" },
  { value: "Other", label: "Autre" },
];

const COUNTRIES = [
  "Bénin", "Nigeria", "Togo", "Ghana", "Côte d'Ivoire", "Sénégal", "Maroc", "Tunisie",
  "Algérie", "Égypte", "Afrique du Sud", "Kenya", "Cameroun", "RDC", "France", "Canada",
  "États-Unis", "Royaume-Uni", "Allemagne", "Belgique", "Suisse", "Espagne", "Italie", "Pays-Bas"
];

export default function CreateParticipant() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    // Compte
    email: "",
    mot_de_passe: "",
    
    // Identité personnelle
    titre: "",
    prenom: "",
    nom: "",
    genre: "",
    
    // Classification
    type_participant: "regular",
    est_auteur: false,
    
    // Professionnel
    institution: "",
    departement: "",
    
    // Adresse
    adresse: "",
    ville: "",
    region: "",
    code_postal: "",
    pays: "Bénin",
    
    // Contact
    telephone: "",
    mobile: "",
    fax: "",
    
    // Préférences
    preferences_alimentaires: "",
    
    // Facturation
    facturation_institution: "",
    facturation_adresse: "",
    bureau_fiscal: "",
    numero_fiscal: "",
    
    // Diversité
    residence: "",
    handicap: "",
    autre_religion: "",
    
    // Statut
    statut_compte: "ACTIF",
    activated: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadParticipant();
    }
  }, [id, isEditing]);

  const loadParticipant = async () => {
    try {
      const data = await participantService.getById(id);
      setFormData({
        email: data.email || "",
        mot_de_passe: "",
        titre: data.titre || "",
        prenom: data.prenom || "",
        nom: data.nom || "",
        genre: data.genre || "",
        type_participant: data.type_participant || "regular",
        est_auteur: data.est_auteur || false,
        institution: data.institution || "",
        departement: data.departement || "",
        adresse: data.adresse || "",
        ville: data.ville || "",
        region: data.region || "",
        code_postal: data.code_postal || "",
        pays: data.pays || "Bénin",
        telephone: data.telephone || "",
        mobile: data.mobile || "",
        fax: data.fax || "",
        preferences_alimentaires: data.preferences_alimentaires || "",
        facturation_institution: data.facturation_institution || "",
        facturation_adresse: data.facturation_adresse || "",
        bureau_fiscal: data.bureau_fiscal || "",
        numero_fiscal: data.numero_fiscal || "",
        residence: data.residence || "",
        handicap: data.handicap || "",
        autre_religion: data.autre_religion || "",
        statut_compte: data.statut_compte || "ACTIF",
        activated: data.activated ?? true,
      });
    } catch (error) {
      console.error("Erreur lors du chargement du participant:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email invalide";
    if (!isEditing && !formData.mot_de_passe.trim()) newErrors.mot_de_passe = "Le mot de passe est requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.type_participant) newErrors.type_participant = "Le type est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        const dataToSend = {
          ...formData,
          papier_ids: [],
          religions: [],
          responsabilites_soin: [],
        };

        // Ne pas envoyer le mot de passe s'il est vide lors de l'édition
        if (isEditing && !dataToSend.mot_de_passe) {
          delete dataToSend.mot_de_passe;
        }

        if (isEditing) {
          await participantService.update(id, dataToSend);
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Participant mis à jour avec succès',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          // Note: Pas de route POST /admin/participants, donc on ne peut pas créer via admin
          Swal.fire({
            icon: 'info',
            title: 'Information',
            text: 'La création de participants via l\'admin n\'est pas disponible. Les participants doivent s\'inscrire via le formulaire public.'
          });
          return;
        }

        navigate("/participants");
      } catch (error) {
        console.error("Erreur lors de l'enregistrement:", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'enregistrement du participant'
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
            onClick={() => navigate("/participants")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Icon d={ICONS.arrowLeft} size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditing ? "Modifier un participant" : "Nouveau participant"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/participants")}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] disabled:opacity-50"
          >
            <Icon d={ICONS.save} size={15} />
            {isLoading ? "En cours..." : (isEditing ? "Mettre à jour" : "Ajouter")}
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 pb-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              
              {/* Compte */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Informations de compte
                </h2>
                <div className="grid grid-cols-2 gap-6">
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
                        placeholder="ex: participant@example.com"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${errors.email ? 'border-red-400' : 'border-gray-200'} text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  {!isEditing && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">
                        Mot de passe <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={formData.mot_de_passe}
                        onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})}
                        placeholder="Mot de passe"
                        className={`w-full px-3 py-2.5 rounded-lg border ${errors.mot_de_passe ? 'border-red-400' : 'border-gray-200'} text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30`}
                      />
                      {errors.mot_de_passe && <p className="text-xs text-red-500">{errors.mot_de_passe}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Identité personnelle */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Identité personnelle
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Titre
                    </label>
                    <select
                      value={formData.titre}
                      onChange={(e) => setFormData({...formData, titre: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    >
                      {TITRES.map(titre => (
                        <option key={titre.value} value={titre.value}>{titre.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Genre
                    </label>
                    <select
                      value={formData.genre}
                      onChange={(e) => setFormData({...formData, genre: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    >
                      {GENRES.map(genre => (
                        <option key={genre.value} value={genre.value}>{genre.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                      placeholder="Ex: Jean"
                      className={`w-full px-3 py-2.5 rounded-lg border ${errors.prenom ? 'border-red-400' : 'border-gray-200'} text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30`}
                    />
                    {errors.prenom && <p className="text-xs text-red-500">{errors.prenom}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      placeholder="Ex: Dupont"
                      className={`w-full px-3 py-2.5 rounded-lg border ${errors.nom ? 'border-red-400' : 'border-gray-200'} text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30`}
                    />
                    {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
                  </div>
                </div>
              </div>

              {/* Classification */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Classification
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Type de participant <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type_participant}
                      onChange={(e) => setFormData({...formData, type_participant: e.target.value})}
                      className={`w-full px-3 py-2.5 rounded-lg border ${errors.type_participant ? 'border-red-400' : 'border-gray-200'} text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30`}
                    >
                      {PARTICIPANT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    {errors.type_participant && <p className="text-xs text-red-500">{errors.type_participant}</p>}
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="est_auteur"
                      checked={formData.est_auteur}
                      onChange={(e) => setFormData({...formData, est_auteur: e.target.checked})}
                      className="w-4 h-4 rounded text-[#1a7a3c] focus:ring-[#1a7a3c]"
                    />
                    <label htmlFor="est_auteur" className="text-sm font-medium text-gray-700">
                      Est auteur d'un papier
                    </label>
                  </div>
                </div>
              </div>

              {/* Professionnel */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Informations professionnelles
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Institution / Université
                    </label>
                    <input
                      type="text"
                      value={formData.institution}
                      onChange={(e) => setFormData({...formData, institution: e.target.value})}
                      placeholder="Ex: Université d'Abomey-Calavi"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Département
                    </label>
                    <input
                      type="text"
                      value={formData.departement}
                      onChange={(e) => setFormData({...formData, departement: e.target.value})}
                      placeholder="Ex: Informatique"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Adresse
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Adresse
                    </label>
                    <textarea
                      value={formData.adresse}
                      onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                      rows={2}
                      placeholder="Adresse complète"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData({...formData, ville: e.target.value})}
                      placeholder="Ex: Cotonou"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Région
                    </label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      placeholder="Ex: Littoral"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={formData.code_postal}
                      onChange={(e) => setFormData({...formData, code_postal: e.target.value})}
                      placeholder="Ex: 01 BP 123"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Pays
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.globe} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={formData.pays}
                        onChange={(e) => setFormData({...formData, pays: e.target.value})}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                      >
                        {COUNTRIES.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Contact
                </h2>
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.phone} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.telephone}
                        onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                        placeholder="+229 00 00 00 00"
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      placeholder="+229 00 00 00 00"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Fax
                    </label>
                    <input
                      type="tel"
                      value={formData.fax}
                      onChange={(e) => setFormData({...formData, fax: e.target.value})}
                      placeholder="+229 00 00 00 00"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Préférences */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Préférences
                </h2>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Préférences alimentaires
                  </label>
                  <textarea
                    value={formData.preferences_alimentaires}
                    onChange={(e) => setFormData({...formData, preferences_alimentaires: e.target.value})}
                    rows={2}
                    placeholder="Végétarien, Halal, Allergies, etc."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 resize-none"
                  />
                </div>
              </div>

              {/* Facturation */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Informations de facturation
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Institution de facturation
                    </label>
                    <input
                      type="text"
                      value={formData.facturation_institution}
                      onChange={(e) => setFormData({...formData, facturation_institution: e.target.value})}
                      placeholder="Ex: Université d'Abomey-Calavi"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Adresse de facturation
                    </label>
                    <textarea
                      value={formData.facturation_adresse}
                      onChange={(e) => setFormData({...formData, facturation_adresse: e.target.value})}
                      rows={2}
                      placeholder="Adresse de facturation complète"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Bureau fiscal
                    </label>
                    <input
                      type="text"
                      value={formData.bureau_fiscal}
                      onChange={(e) => setFormData({...formData, bureau_fiscal: e.target.value})}
                      placeholder="Ex: Bureau fiscal de Cotonou"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Numéro fiscal
                    </label>
                    <input
                      type="text"
                      value={formData.numero_fiscal}
                      onChange={(e) => setFormData({...formData, numero_fiscal: e.target.value})}
                      placeholder="Ex: 1234567890"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Diversité */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Informations diversité (optionnel)
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Résidence
                    </label>
                    <input
                      type="text"
                      value={formData.residence}
                      onChange={(e) => setFormData({...formData, residence: e.target.value})}
                      placeholder="Ex: Campus"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Handicap
                    </label>
                    <input
                      type="text"
                      value={formData.handicap}
                      onChange={(e) => setFormData({...formData, handicap: e.target.value})}
                      placeholder="Ex: Mobilité réduite"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Autre religion
                    </label>
                    <input
                      type="text"
                      value={formData.autre_religion}
                      onChange={(e) => setFormData({...formData, autre_religion: e.target.value})}
                      placeholder="Préciser si autre religion"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Statut */}
              {isEditing && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                    Statut du compte
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">
                        Statut du compte
                      </label>
                      <select
                        value={formData.statut_compte}
                        onChange={(e) => setFormData({...formData, statut_compte: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                      >
                        <option value="ACTIF">Actif</option>
                        <option value="DESACTIVE">Désactivé</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="activated"
                        checked={formData.activated}
                        onChange={(e) => setFormData({...formData, activated: e.target.checked})}
                        className="w-4 h-4 rounded text-[#1a7a3c] focus:ring-[#1a7a3c]"
                      />
                      <label htmlFor="activated" className="text-sm font-medium text-gray-700">
                        Compte activé
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}