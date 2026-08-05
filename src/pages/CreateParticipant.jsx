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
  { value: "", label: "Select" },
  { value: "Mr", label: "Mr." },
  { value: "Mrs", label: "Mrs." },
  { value: "Dr", label: "Dr" },
  { value: "Prof", label: "Prof" },
  { value: "Ms", label: "Ms." },
];

const GENRES = [
  { value: "", label: "Select" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const COUNTRIES = [
  { value: "Bénin", label: "Benin" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Togo", label: "Togo" },
  { value: "Ghana", label: "Ghana" },
  { value: "Côte d'Ivoire", label: "Ivory Coast" },
  { value: "Sénégal", label: "Senegal" },
  { value: "Maroc", label: "Morocco" },
  { value: "Tunisie", label: "Tunisia" },
  { value: "Algérie", label: "Algeria" },
  { value: "Égypte", label: "Egypt" },
  { value: "Afrique du Sud", label: "South Africa" },
  { value: "Kenya", label: "Kenya" },
  { value: "Cameroun", label: "Cameroon" },
  { value: "RDC", label: "DR Congo" },
  { value: "France", label: "France" },
  { value: "Canada", label: "Canada" },
  { value: "États-Unis", label: "United States" },
  { value: "Royaume-Uni", label: "United Kingdom" },
  { value: "Allemagne", label: "Germany" },
  { value: "Belgique", label: "Belgium" },
  { value: "Suisse", label: "Switzerland" },
  { value: "Espagne", label: "Spain" },
  { value: "Italie", label: "Italy" },
  { value: "Pays-Bas", label: "Netherlands" },
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
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!isEditing && !formData.mot_de_passe.trim()) newErrors.mot_de_passe = "Password is required";
    if (!formData.prenom.trim()) newErrors.prenom = "First name is required";
    if (!formData.nom.trim()) newErrors.nom = "Last name is required";
    if (!formData.type_participant) newErrors.type_participant = "Type is required";
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
            title: 'Success',
            text: 'Participant updated successfully',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          // Note: Pas de route POST /admin/participants, donc on ne peut pas créer via admin
          Swal.fire({
            icon: 'info',
            title: 'Information',
            text: 'Creating participants via the admin panel is not available. Participants must register via the public form.'
          });
          return;
        }

        navigate("/participants");
      } catch (error) {
        console.error("Erreur lors de l'enregistrement:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error while saving the participant'
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
            {isEditing ? "Edit participant" : "New participant"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/participants")}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] disabled:opacity-50"
          >
            <Icon d={ICONS.save} size={15} />
            {isLoading ? "Saving..." : (isEditing ? "Update" : "Add")}
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
                  Account information
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
                        placeholder="Password"
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
                  Personal identity
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Title
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
                      Gender
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
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                      placeholder="e.g. John"
                      className={`w-full px-3 py-2.5 rounded-lg border ${errors.prenom ? 'border-red-400' : 'border-gray-200'} text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30`}
                    />
                    {errors.prenom && <p className="text-xs text-red-500">{errors.prenom}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      placeholder="e.g. Smith"
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
                      Participant type <span className="text-red-500">*</span>
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
                      Is an author of a paper
                    </label>
                  </div>
                </div>
              </div>

              {/* Professionnel */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Professional information
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Institution / University
                    </label>
                    <input
                      type="text"
                      value={formData.institution}
                      onChange={(e) => setFormData({...formData, institution: e.target.value})}
                      placeholder="e.g. University of Abomey-Calavi"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.departement}
                      onChange={(e) => setFormData({...formData, departement: e.target.value})}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Address
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Address
                    </label>
                    <textarea
                      value={formData.adresse}
                      onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                      rows={2}
                      placeholder="Full address"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData({...formData, ville: e.target.value})}
                      placeholder="e.g. Cotonou"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Region
                    </label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      placeholder="e.g. Littoral"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Postal code
                    </label>
                    <input
                      type="text"
                      value={formData.code_postal}
                      onChange={(e) => setFormData({...formData, code_postal: e.target.value})}
                      placeholder="e.g. 01 BP 123"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Country
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.globe} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={formData.pays}
                        onChange={(e) => setFormData({...formData, pays: e.target.value})}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                      >
                        {COUNTRIES.map(country => (
                          <option key={country.value} value={country.value}>{country.label}</option>
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
                      Phone
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
                  Preferences
                </h2>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Dietary preferences
                  </label>
                  <textarea
                    value={formData.preferences_alimentaires}
                    onChange={(e) => setFormData({...formData, preferences_alimentaires: e.target.value})}
                    rows={2}
                    placeholder="Vegetarian, Halal, Allergies, etc."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 resize-none"
                  />
                </div>
              </div>

              {/* Facturation */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Billing information
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Billing institution
                    </label>
                    <input
                      type="text"
                      value={formData.facturation_institution}
                      onChange={(e) => setFormData({...formData, facturation_institution: e.target.value})}
                      placeholder="e.g. University of Abomey-Calavi"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Billing address
                    </label>
                    <textarea
                      value={formData.facturation_adresse}
                      onChange={(e) => setFormData({...formData, facturation_adresse: e.target.value})}
                      rows={2}
                      placeholder="Full billing address"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Tax office
                    </label>
                    <input
                      type="text"
                      value={formData.bureau_fiscal}
                      onChange={(e) => setFormData({...formData, bureau_fiscal: e.target.value})}
                      placeholder="e.g. Cotonou tax office"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Tax number
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
                  Diversity information (optional)
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Residence
                    </label>
                    <input
                      type="text"
                      value={formData.residence}
                      onChange={(e) => setFormData({...formData, residence: e.target.value})}
                      placeholder="e.g. Campus"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Disability
                    </label>
                    <input
                      type="text"
                      value={formData.handicap}
                      onChange={(e) => setFormData({...formData, handicap: e.target.value})}
                      placeholder="e.g. Reduced mobility"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Other religion
                    </label>
                    <input
                      type="text"
                      value={formData.autre_religion}
                      onChange={(e) => setFormData({...formData, autre_religion: e.target.value})}
                      placeholder="Specify if other religion"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Statut */}
              {isEditing && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                    Account status
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">
                        Account status
                      </label>
                      <select
                        value={formData.statut_compte}
                        onChange={(e) => setFormData({...formData, statut_compte: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30"
                      >
                        <option value="ACTIF">Active</option>
                        <option value="DESACTIVE">Deactivated</option>
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
                        Account activated
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