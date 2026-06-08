import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  filter:   "M4 6h16M7 12h10M10 18h4",
  plus:     "M12 5v14M5 12h14",
  edit:     "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  delete:   "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  file:     "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  power:    "M18.36 6.64A9 9 0 1 1 5.64 6.64M12 2v10",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  calendar: "M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01",
};

const DOCUMENT_TYPES = [
  { value: "PDF", label: "PDF", color: "red", icon: "pdf" },
  { value: "DOC", label: "Word", color: "blue", icon: "doc" },
  { value: "XLS", label: "Excel", color: "green", icon: "xls" },
  { value: "PPT", label: "PowerPoint", color: "orange", icon: "ppt" },
  { value: "IMG", label: "Image", color: "purple", icon: "img" },
  { value: "ZIP", label: "Archive", color: "gray", icon: "zip" },
  { value: "TXT", label: "Texte", color: "slate", icon: "txt" },
];

// Générer un ID public unique
const generatePublicId = () => {
  const prefixes = ["DOC", "FILE", "DOCS", "PUB", "RES"];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `${randomPrefix}-${randomNum}`;
};

export default function Documents() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getAll();
      setDocuments(data);
    } catch (error) {
      console.error("Erreur lors du chargement des documents:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement des documents'
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = documents.filter((doc) => {
    const matchesSearch = (doc.nom_document || doc.name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (doc.id_public || doc.publicId || "").toLowerCase().includes(search.toLowerCase()) ||
                          (doc.description && doc.description.toLowerCase().includes(search.toLowerCase()));
    const matchesType = !selectedType || doc.fileType === selectedType;
    return matchesSearch && matchesType;
  });

  const toggleOnline = async (id) => {
    try {
      const document = documents.find(d => d.id === id);
      const updatedData = {
        ...document,
        activated: !document.activated,
      };
      await documentService.update(id, updatedData);
      await loadDocuments();
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

  const deleteDocument = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas récupérer ce document !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await documentService.delete(id);
        await loadDocuments();
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'Le document a été supprimé.',
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

  const viewDocument = (document) => {
    Swal.fire({
      title: `<strong>${document.nom_document || document.name}</strong>`,
      html: `
        <div class="text-left" style="font-size: 14px;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Informations générales</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>ID Public:</strong> ${document.id_public || document.publicId || '-'}</div>
              <div><strong>Statut:</strong> ${document.statut || '-'}</div>
              <div><strong>Activé:</strong> ${document.activated !== undefined ? (document.activated ? 'Oui' : 'Non') : (document.online ? 'Oui' : 'Non')}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Description</strong>
            <div style="margin-top: 4px; color: #666;">
              ${document.description || '-'}
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Lien</strong>
            <div style="margin-top: 4px; color: #666;">
              ${document.lien ? `<a href="${document.lien}" target="_blank">${document.lien}</a>` : '-'}
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

  const getTypeBadgeColor = (type) => {
    const typeMap = {
      "PDF": "bg-red-100 text-red-700",
      "DOC": "bg-blue-100 text-blue-700",
      "XLS": "bg-green-100 text-green-700",
      "PPT": "bg-orange-100 text-orange-700",
      "IMG": "bg-purple-100 text-purple-700",
      "ZIP": "bg-gray-100 text-gray-700",
      "TXT": "bg-slate-100 text-slate-700",
    };
    return typeMap[type] || "bg-gray-100 text-gray-700";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = (doc) => {
    if (doc.fileUrl) {
      // Simuler un téléchargement
      const link = document.createElement("a");
      link.href = doc.fileUrl;
      link.download = doc.fileName;
      link.click();
      
      // Incrémenter le compteur
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id ? { ...d, downloadCount: d.downloadCount + 1 } : d
        )
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Gestion des documents
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les documents de la conférence (programmes, certificats, etc.)
        </p>
      </div>

      <div className="mx-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-gray-900 shrink-0">
              Documents
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
                placeholder="Rechercher par nom, ID public..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 transition-colors shrink-0 ${
                showFilters || selectedType ? "bg-[#1a7a3c] text-white border-[#1a7a3c]" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon d={ICONS.filter} size={16} />
            </button>

            <button
              onClick={() => navigate("/documents/create")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm shrink-0"
            >
              <Icon d={ICONS.plus} size={15} />
              Nouveau document
            </button>
          </div>

          {showFilters && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100 flex-wrap">
              <span className="text-xs font-medium text-gray-500">Filtrer par type :</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedType("")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    !selectedType
                      ? "bg-[#1a7a3c] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tous
                </button>
                {DOCUMENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedType === type.value
                        ? "bg-[#1a7a3c] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {type.label}
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
                <th className="text-left px-6 py-3 text-gray-500 font-medium">ID Public</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nom du document</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Téléch.</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    Aucun document trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((doc, i) => (
                  <tr
                    key={doc.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                      i === filtered.length - 1 ? "border-b-0" : ""
                    } ${!doc.activated ? "opacity-60" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {doc.id_public || doc.publicId}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Icon d={ICONS.file} size={18} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{doc.nom_document || doc.name}</p>
                          {doc.description && (
                            <p className="text-xs text-gray-400 truncate max-w-xs">{doc.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-semibold text-[#1a7a3c]">{doc.downloadCount || 0}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        doc.statut === 'active' ? 'bg-green-100 text-green-700' :
                        doc.statut === 'archived' ? 'bg-gray-100 text-gray-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.statut === 'active' ? 'Actif' : doc.statut === 'archived' ? 'Archivé' : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => viewDocument(doc)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="Voir les détails"
                        >
                          <Icon d={ICONS.eye} size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/documents/edit/${doc.id}`)}
                          className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                          title="Modifier"
                        >
                          <Icon d={ICONS.edit} size={16} />
                        </button>
                        <button
                          onClick={() => toggleOnline(doc.id)}
                          className={`transition-colors ${
                            doc.activated !== undefined ? (doc.activated ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-600") : (doc.online ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-600")
                          }`}
                          title={doc.activated !== undefined ? (doc.activated ? "Désactiver" : "Activer") : (doc.online ? "Désactiver" : "Activer")}
                        >
                          <Icon d={ICONS.power} size={16} />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Icon d={ICONS.delete} size={16} />
                        </button>
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
            <span>Total : {filtered.length} document(s)</span>
            <span>
              Actifs : {filtered.filter(d => d.activated !== undefined ? d.activated : d.online).length} | 
              Inactifs : {filtered.filter(d => d.activated !== undefined ? !d.activated : !d.online).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}