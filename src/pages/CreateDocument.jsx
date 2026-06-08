import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { documentService } from "../services/documentService";

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
  upload:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  file:      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  id:        "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
  description: "M4 4h16v16H4zM9 9h6M9 13h6M9 17h4",
  check:     "M20 6L9 17l-5-5",
};

// Générer un ID public unique
const generatePublicId = () => {
  const prefixes = ["DOC", "FILE", "PUB", "RES"];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `${randomPrefix}-${randomNum}`;
};

// Déterminer le type de fichier à partir de l'extension
const getFileTypeFromName = (filename) => {
  const ext = filename.split('.').pop().toUpperCase();
  const typeMap = {
    'PDF': 'PDF',
    'DOC': 'DOC',
    'DOCX': 'DOC',
    'XLS': 'XLS',
    'XLSX': 'XLS',
    'PPT': 'PPT',
    'PPTX': 'PPT',
    'JPG': 'IMG',
    'JPEG': 'IMG',
    'PNG': 'IMG',
    'GIF': 'IMG',
    'ZIP': 'ZIP',
    'RAR': 'ZIP',
    'TXT': 'TXT',
  };
  return typeMap[ext] || 'PDF';
};

export default function CreateDocument() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nom_document: "",
    id_public: generatePublicId(),
    description: "",
    fichier_id: null,
    lien: "",
    statut: "active",
    activated: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadDocument();
    }
  }, [id, isEditing]);

  const loadDocument = async () => {
    try {
      const document = await documentService.getById(id);
      setFormData({
        nom_document: document.nom_document || "",
        id_public: document.id_public || generatePublicId(),
        description: document.description || "",
        fichier_id: document.fichier_id || null,
        lien: document.lien || "",
        statut: document.statut || "active",
        activated: document.activated !== undefined ? document.activated : true,
      });
    } catch (error) {
      console.error("Erreur lors du chargement du document:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement du document'
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom_document.trim()) newErrors.nom_document = "Le nom du document est requis";
    if (!formData.id_public.trim()) newErrors.id_public = "L'ID public est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (file) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Le fichier ne doit pas dépasser 10MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          file: reader.result,
          fileType: getFileTypeFromName(file.name),
          fileSize: file.size,
          fileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const regeneratePublicId = () => {
    setFormData({ ...formData, id_public: generatePublicId() });
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        const documentData = {
          nom_document: formData.nom_document,
          id_public: formData.id_public,
          description: formData.description,
          fichier_id: formData.fichier_id,
          lien: formData.lien,
          statut: formData.statut,
          activated: formData.activated,
        };

        if (isEditing) {
          await documentService.update(id, documentData);
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Document mis à jour avec succès',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          await documentService.create(documentData);
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Document créé avec succès',
            timer: 1500,
            showConfirmButton: false
          });
        }

        navigate("/documents");
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la sauvegarde du document'
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
            onClick={() => navigate("/documents")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Retour"
          >
            <Icon d={ICONS.arrowLeft} size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditing ? "Modifier un document" : "Nouveau document"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/documents")}
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
            {isLoading ? "En cours..." : (isEditing ? "Mettre à jour" : "Téléverser")}
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              
              {/* Upload de fichier */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Fichier {!isEditing && <span className="text-red-500">*</span>}
                </h2>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                    ${dragActive ? 'border-[#1a7a3c] bg-green-50' : 'border-gray-300 hover:border-gray-400'}
                    ${errors.fichier_id ? 'border-red-400' : ''}
                  `}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <input
                    id="fileInput"
                    type="file"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                  <Icon d={ICONS.upload} size={40} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-1">
                    {formData.fichier_id ? "Fichier associé" : "Cliquez pour sélectionner un fichier"}
                  </p>
                  <p className="text-xs text-gray-400">
                    ou glissez-déposez (max 10MB)
                  </p>
                  {formData.fileName && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                      <Icon d={ICONS.check} size={14} />
                      <span>Fichier sélectionné : {formData.fileName}</span>
                    </div>
                  )}
                </div>
                {errors.fichier_id && <p className="text-xs text-red-500 mt-1">{errors.fichier_id}</p>}
              </div>

              {/* Informations générales */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Informations du document
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {/* ID Public */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      ID Public <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Icon d={ICONS.id} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.id_public}
                          onChange={(e) => setFormData({...formData, id_public: e.target.value})}
                          placeholder="Ex: DOC-001"
                          className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                            errors.id_public ? 'border-red-400' : 'border-gray-200'
                          } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={regeneratePublicId}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                      >
                        Générer
                      </button>
                    </div>
                    {errors.id_public && <p className="text-xs text-red-500">{errors.id_public}</p>}
                  </div>

                  {/* Nom du document */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Nom du document <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.file} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.nom_document}
                        onChange={(e) => setFormData({...formData, nom_document: e.target.value})}
                        placeholder="Ex: Programme officiel, Certificat..."
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          errors.nom_document ? 'border-red-400' : 'border-gray-200'
                        } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                    </div>
                    {errors.nom_document && <p className="text-xs text-red-500">{errors.nom_document}</p>}
                  </div>

                  {/* Lien */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Lien
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.file} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.lien}
                        onChange={(e) => setFormData({...formData, lien: e.target.value})}
                        placeholder="https://example.com/document"
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                      />
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Statut
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({...formData, statut: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                    >
                      <option value="active">Actif</option>
                      <option value="archived">Archivé</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.description} size={16} className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={4}
                        placeholder="Description du document..."
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition resize-none"
                      />
                    </div>
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