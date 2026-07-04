import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { participantService } from "../services/participantService";
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
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  fileText:  "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  upload:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  check:     "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3",
  alert:     "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
};

export default function ImportPapiers() {
  const navigate = useNavigate();
  const [evenements, setEvenements] = useState([]);
  const [selectedEvenementId, setSelectedEvenementId] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importErrors, setImportErrors] = useState([]);

  useEffect(() => {
    loadEvenements();
  }, []);

  const loadEvenements = async () => {
    try {
      const res = await evenementService.getAll();
      const list = res.data || res;
      setEvenements(Array.isArray(list) ? list : []);
      // Pre-select first event if available
      if (list && list.length > 0) {
        setSelectedEvenementId(list[0].id);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des événements :", error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      Swal.fire({ icon: "warning", title: "Fichier requis", text: "Veuillez sélectionner un fichier à importer." });
      return;
    }
    if (!selectedEvenementId) {
      Swal.fire({ icon: "warning", title: "Événement requis", text: "Veuillez associer un événement par défaut." });
      return;
    }

    setIsLoading(true);
    setImportErrors([]);

    const formData = new FormData();
    formData.append("fichier", file);
    formData.append("evenement_id", selectedEvenementId);

    try {
      const res = await participantService.importMarkdownPapers(formData);
      setIsLoading(false);
      setFile(null);
      
      Swal.fire({
        icon: "success",
        title: "Importation réussie !",
        text: `${res.data?.created || 1} papier(s) accepté(s) ont été importés avec succès.`,
        confirmButtonColor: "#1a7a3c",
      });
      navigate("/participants");
    } catch (error) {
      setIsLoading(false);
      const resData = error.response?.data;
      if (resData && resData.errors) {
        setImportErrors(resData.errors);
        Swal.fire({
          icon: "error",
          title: "Erreur de formatage",
          text: "Certaines lignes ou blocs du fichier comportent des erreurs. Veuillez vous référer au tableau ci-dessous pour les corriger.",
          confirmButtonColor: "#d33",
        });
      } else {
        console.error("Erreur d'importation :", error);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: resData?.message || "Une erreur est survenue lors de l'importation.",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const sampleFormat = `## Submission #3

- **submission_id**: 3
- **evenement_id**: ${selectedEvenementId || '<a_definir>'}
- **titre**: Decision-Preserving Ordinals and Structural Surjections for Combinatorial Reduction in Networked Systems
- **track**: Long Paper (Conditional Acceptance)
- **keywords**: ["Applied Mathematics", "Networks"]
- **description**: Une étude approfondie...
- **decision**: accepted
- **type_presentation**: oral
- **activated**: true
- **info**:
\`\`\`json
{
  "domain_track": "Applied Mathematics",
  "conditional_acceptance": true,
  "auteurs": [
    "Toussaint Okey",
    "Basile Corneille Degbo",
    "Marc Kokou Assogba",
    "Marc Lobelle"
  ],
  "nb_auteurs": 4
}
\`\`\``;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      {/* En-tête */}
      <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-gray-100 bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/participants")}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-500"
            title="Retour à la liste"
          >
            <Icon d={ICONS.arrowLeft} size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-950 tracking-tight">
              Importer les Papiers Acceptés
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Chargez vos soumissions acceptées depuis un fichier texte formaté en Markdown
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-7xl mx-auto w-full">
        
        {/* Colonne 1 : Guide de formatage */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Icon d={ICONS.fileText} size={20} className="text-[#1a7a3c]" />
            <h2 className="text-base font-bold text-gray-900">Format de fichier requis</h2>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              Le fichier importé doit être au format texte brut (<code>.txt</code> ou <code>.md</code>) et contenir
              les soumissions présentées sous forme de blocs Markdown. Chaque bloc doit commencer par la ligne 
              <strong className="text-gray-900"><code>## Submission #ID</code></strong>.
            </p>
            <p className="text-xs text-gray-500">
              * Note : Si la clé <code>evenement_id</code> vaut <code>&lt;a_definir&gt;</code>, elle sera remplacée 
              automatiquement par l'événement sélectionné dans le formulaire.
            </p>
          </div>

          <div className="relative rounded-lg bg-gray-900 p-4 font-mono text-xs text-gray-300 overflow-x-auto leading-relaxed border border-gray-800 shadow-inner">
            <pre className="whitespace-pre-wrap select-all">{sampleFormat}</pre>
          </div>
        </div>

        {/* Colonne 2 : Importation */}
        <div className="flex flex-col gap-6">
          
          <form onSubmit={handleImport} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Icon d={ICONS.upload} size={20} className="text-[#1a7a3c]" />
              <h2 className="text-base font-bold text-gray-900">Formulaire de chargement</h2>
            </div>

            {/* Événement par défaut */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Événement par défaut <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedEvenementId}
                onChange={(e) => setSelectedEvenementId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] bg-white transition cursor-pointer"
                required
              >
                <option value="">Sélectionner un événement</option>
                {evenements.map(evt => (
                  <option key={evt.id} value={evt.id}>
                    {evt.titre} ({evt.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400">
                Utilisé pour remplacer les valeurs <code>&lt;a_definir&gt;</code> du fichier.
              </p>
            </div>

            {/* Drag and Drop Zone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Fichier à importer (.txt, .md)</label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${
                  dragActive ? "border-[#1a7a3c] bg-green-50/50" : "border-gray-200 hover:border-[#1a7a3c]/50 hover:bg-gray-50/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("fileInput").click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[#1a7a3c]">
                  <Icon d={ICONS.upload} size={22} />
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {file ? file.name : "Glissez-déposez votre fichier ici"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : "ou cliquez pour parcourir les dossiers"}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !file}
              className="w-full py-2.5 rounded-lg bg-[#1a7a3c] hover:bg-[#1a7a3c]/90 text-white text-sm font-semibold tracking-wide transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Importation en cours...
                </>
              ) : (
                "Lancer l'importation"
              )}
            </button>
          </form>

          {/* Tableau d'erreurs récapitulatif */}
          {importErrors.length > 0 && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center gap-2 border-b border-red-50 pb-3 text-red-600">
                <Icon d={ICONS.alert} size={20} />
                <h2 className="text-base font-bold">Rapport d'anomalies ({importErrors.length})</h2>
              </div>
              <p className="text-xs text-gray-500">
                L'importation a été intégralement annulée afin de préserver l'intégrité de la base de données.
                Veuillez corriger les points suivants dans votre fichier avant de réessayer :
              </p>
              
              <div className="border border-gray-100 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-red-50 text-red-700 font-semibold border-b border-red-100">
                    <tr>
                      <th className="px-4 py-2 w-1/3">Soumission</th>
                      <th className="px-4 py-2">Problème rencontré</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {importErrors.map((err, i) => (
                      <tr key={i} className="hover:bg-red-50/20">
                        <td className="px-4 py-2.5 font-semibold text-gray-800">{err.submission}</td>
                        <td className="px-4 py-2.5 text-red-600">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
