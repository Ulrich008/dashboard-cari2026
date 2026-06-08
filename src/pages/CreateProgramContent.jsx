import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { programmeService } from "../services/programmeService";
import { evenementService } from "../services/evenementService";

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
  calendar: "M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01",
  time:     "M12 6v6l4 2M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  speaker:  "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  plus:     "M12 5v14M5 12h14",
  x:        "M18 6L6 18M6 6l12 12",
  location: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  users:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
};

const PROGRAM_TYPES = [
  { value: "keynote", label: "Keynote", color: "purple", description: "Session principale" },
  { value: "session", label: "Session", color: "blue", description: "Session régulière" },
  { value: "workshop", label: "Workshop", color: "green", description: "Atelier pratique" },
  { value: "panel", label: "Panel", color: "orange", description: "Table ronde" },
  { value: "break", label: "Pause", color: "pink", description: "Pause café" },
  { value: "social", label: "Social", color: "indigo", description: "Événement social" },
];

export default function CreateProgramContent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    evenement_id: "",
    titre: "",
    type: "keynote",
    date_debut: "",
    date_fin: "",
    description: "",
    salle: "",
    speaker_committee_ids: [],
    papier_ids: [],
  });

  const [evenements, setEvenements] = useState([]);
  const [newSpeakerId, setNewSpeakerId] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Charger les événements au démarrage
  useEffect(() => {
    loadEvenements();
  }, []);

  const loadEvenements = async () => {
    try {
      const data = await evenementService.getAll();
      setEvenements(data);
      // Sélectionner le premier événement par défaut s'il existe
      if (data.length > 0 && !formData.evenement_id) {
        setFormData(prev => ({ ...prev, evenement_id: data[0].id }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
    }
  };

  // Charger les données si on est en mode édition
  useEffect(() => {
    if (isEditing) {
      loadProgram();
    }
  }, [id, isEditing]);

  const loadProgram = async () => {
    try {
      const program = await programmeService.getById(id);
      setFormData({
        evenement_id: program.evenement_id || 1,
        titre: program.titre,
        type: program.type,
        date_debut: program.date_debut,
        date_fin: program.date_fin,
        description: program.description || "",
        salle: program.salle || "",
        speaker_committee_ids: program.speaker_committee_ids || [],
        papier_ids: program.papier_ids || [],
      });
    } catch (error) {
      console.error("Erreur lors du chargement du programme:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement du programme'
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.titre.trim()) newErrors.titre = "Le titre est requis";
    if (!formData.type) newErrors.type = "Le type est requis";
    if (!formData.date_debut) newErrors.date_debut = "La date de début est requise";
    if (!formData.date_fin) newErrors.date_fin = "La date de fin est requise";
    if (!formData.evenement_id) newErrors.evenement_id = "L'événement est requis";
    
    // Validation des dates
    if (formData.date_debut && formData.date_fin) {
      const debut = new Date(formData.date_debut);
      const fin = new Date(formData.date_fin);
      if (fin < debut) {
        newErrors.date_fin = "La date de fin doit être postérieure ou égale à la date de début";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSpeaker = () => {
    const speakerId = parseInt(newSpeakerId);
    if (speakerId && !formData.speaker_committee_ids.includes(speakerId)) {
      setFormData({
        ...formData,
        speaker_committee_ids: [...formData.speaker_committee_ids, speakerId]
      });
      setNewSpeakerId("");
    }
  };

  const handleRemoveSpeaker = (speakerIdToRemove) => {
    setFormData({
      ...formData,
      speaker_committee_ids: formData.speaker_committee_ids.filter(id => id !== speakerIdToRemove)
    });
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        const programData = { ...formData };

        if (isEditing) {
          await programmeService.update(id, programData);
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Programme mis à jour avec succès',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          await programmeService.create(programData);
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Programme créé avec succès',
            timer: 1500,
            showConfirmButton: false
          });
        }

        navigate("/program");
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la sauvegarde du programme'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSpeaker();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="flex items-center justify-between px-8 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/program")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Retour"
          >
            <Icon d={ICONS.arrowLeft} size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditing ? "Modifier le programme" : "Créer un programme"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/program")}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon d={ICONS.save} size={15} />
            {isLoading ? "En cours..." : (isEditing ? "Mettre à jour" : "Créer le programme")}
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              
              {/* Informations générales */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Informations générales
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Événement <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.evenement_id}
                      onChange={(e) => setFormData({...formData, evenement_id: parseInt(e.target.value)})}
                      className={`w-full px-3 py-2.5 rounded-lg border ${
                        errors.evenement_id ? 'border-red-400' : 'border-gray-200'
                      } text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                    >
                      <option value="">Sélectionner un événement</option>
                      {evenements.map(evenement => (
                        <option key={evenement.id} value={evenement.id}>
                          {evenement.nom} ({evenement.code})
                        </option>
                      ))}
                    </select>
                    {errors.evenement_id && <p className="text-xs text-red-500">{errors.evenement_id}</p>}
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Titre du programme <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.titre}
                      onChange={(e) => setFormData({...formData, titre: e.target.value})}
                      placeholder="Ex: AI for Healthcare"
                      className={`w-full px-3 py-2.5 rounded-lg border ${
                        errors.titre ? 'border-red-400' : 'border-gray-200'
                      } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                    />
                    {errors.titre && <p className="text-xs text-red-500">{errors.titre}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                    >
                      {PROGRAM_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label} - {type.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Lieu / Salle
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.location} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.salle}
                        onChange={(e) => setFormData({...formData, salle: e.target.value})}
                        placeholder="Ex: Auditorium A, Salle 101"
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Date et horaire */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Date et horaire
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Date de début <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.calendar} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={formData.date_debut}
                        onChange={(e) => setFormData({...formData, date_debut: e.target.value})}
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          errors.date_debut ? 'border-red-400' : 'border-gray-200'
                        } text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                    </div>
                    {errors.date_debut && <p className="text-xs text-red-500">{errors.date_debut}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Date de fin <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.calendar} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={formData.date_fin}
                        onChange={(e) => setFormData({...formData, date_fin: e.target.value})}
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          errors.date_fin ? 'border-red-400' : 'border-gray-200'
                        } text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                    </div>
                    {errors.date_fin && <p className="text-xs text-red-500">{errors.date_fin}</p>}
                  </div>
                </div>
              </div>

              {/* Intervenants */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Intervenants (IDs)
                </h2>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Icon d={ICONS.speaker} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={newSpeakerId}
                        onChange={(e) => setNewSpeakerId(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="ID de l'intervenant..."
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSpeaker}
                      className="px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors flex items-center gap-1"
                    >
                      <Icon d={ICONS.plus} size={14} />
                      Ajouter
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.speaker_committee_ids.map((speakerId, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm"
                      >
                        <Icon d={ICONS.speaker} size={12} className="text-gray-500" />
                        <span>ID: {speakerId}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpeaker(speakerId)}
                          className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Icon d={ICONS.x} size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">Note: Les IDs doivent correspondre aux speakers/committees existants dans la base de données</p>
                </div>
              </div>

              {/* Informations complémentaires */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Informations complémentaires
                </h2>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    placeholder="Décrivez le contenu de ce programme..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}