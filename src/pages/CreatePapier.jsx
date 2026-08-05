import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { papierService } from "../services/papierService";
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
  save:      "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
};

const DECISION_OPTIONS = [
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const TYPE_PRESENTATION_OPTIONS = [
  { value: "oral", label: "Oral" },
  { value: "poster", label: "Poster" },
];

export default function CreatePapier() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [evenements, setEvenements] = useState([]);
  const [formData, setFormData] = useState({
    submission_id: "",
    evenement_id: "",
    titre: "",
    track: "",
    keywords: "",
    description: "",
    decision: "accepted",
    type_presentation: "oral",
    date_submission: "",
  });

  const [auteurs, setAuteurs] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPapier, setLoadingPapier] = useState(true);

  useEffect(() => {
    evenementService.getAll()
      .then((res) => setEvenements(Array.isArray(res) ? res : (res?.data ?? [])))
      .catch(() => setEvenements([]));
  }, []);

  useEffect(() => {
    loadPapier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadPapier = async () => {
    try {
      setLoadingPapier(true);
      const papier = await papierService.getById(id);
      setFormData({
        submission_id: papier.submission_id ?? "",
        evenement_id: papier.evenement_id ?? "",
        titre: papier.titre ?? "",
        track: papier.track ?? "",
        keywords: Array.isArray(papier.keywords) ? papier.keywords.join(", ") : "",
        description: papier.description ?? "",
        decision: papier.decision ?? "accepted",
        type_presentation: papier.type_presentation ?? "oral",
        date_submission: papier.date_submission ? papier.date_submission.slice(0, 10) : "",
      });
      setAuteurs(papier.auteurs ?? []);
    } catch (error) {
      console.error("Error loading paper:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Error loading the paper." });
    } finally {
      setLoadingPapier(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.submission_id) newErrors.submission_id = "Submission ID is required";
    if (!formData.evenement_id) newErrors.evenement_id = "Event is required";
    if (!formData.titre.trim()) newErrors.titre = "Title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const payload = {
        submission_id: parseInt(formData.submission_id, 10),
        evenement_id: parseInt(formData.evenement_id, 10),
        titre: formData.titre,
        track: formData.track || null,
        keywords: formData.keywords
          ? formData.keywords.split(",").map((k) => k.trim()).filter(Boolean)
          : [],
        description: formData.description || null,
        decision: formData.decision,
        type_presentation: formData.type_presentation,
        date_submission: formData.date_submission || null,
      };

      await papierService.update(id, payload);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Paper updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/participants");
    } catch (error) {
      console.error("Error saving:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message ?? "Error saving the paper",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="flex items-center justify-between px-8 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/participants")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Back"
          >
            <Icon d={ICONS.arrowLeft} size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Edit paper
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/participants")}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || loadingPapier}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm disabled:opacity-50"
          >
            <Icon d={ICONS.save} size={15} />
            {isLoading ? "In progress..." : "Update"}
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  General information
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Submission ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.submission_id}
                      onChange={(e) => setFormData({ ...formData, submission_id: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-lg border ${
                        errors.submission_id ? "border-red-400" : "border-gray-200"
                      } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                    />
                    {errors.submission_id && <p className="text-xs text-red-500">{errors.submission_id}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Event <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.evenement_id}
                      onChange={(e) => setFormData({ ...formData, evenement_id: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-lg border ${
                        errors.evenement_id ? "border-red-400" : "border-gray-200"
                      } text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition appearance-none`}
                    >
                      <option value="">Select an event</option>
                      {evenements.map((evt) => (
                        <option key={evt.id} value={evt.id}>{evt.titre || evt.code}</option>
                      ))}
                    </select>
                    {errors.evenement_id && <p className="text-xs text-red-500">{errors.evenement_id}</p>}
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-lg border ${
                        errors.titre ? "border-red-400" : "border-gray-200"
                      } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                    />
                    {errors.titre && <p className="text-xs text-red-500">{errors.titre}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Track</label>
                    <input
                      type="text"
                      value={formData.track}
                      onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                      placeholder="Computer Science, Applied Mathematics..."
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Submission date</label>
                    <input
                      type="date"
                      value={formData.date_submission}
                      onChange={(e) => setFormData({ ...formData, date_submission: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Decision</label>
                    <select
                      value={formData.decision}
                      onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition appearance-none"
                    >
                      {DECISION_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Presentation type</label>
                    <select
                      value={formData.type_presentation}
                      onChange={(e) => setFormData({ ...formData, type_presentation: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition appearance-none"
                    >
                      {TYPE_PRESENTATION_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Keywords</label>
                    <input
                      type="text"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="comma-separated, e.g.: Applied Mathematics, Networks"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                    />
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {auteurs.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                    Authors
                  </h2>
                  <p className="text-xs text-gray-400 mb-3">
                    Authors are not editable from this form (set at import time).
                  </p>
                  <ul className="space-y-1.5">
                    {auteurs.map((a) => (
                      <li key={a.id} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="font-medium">{a.prenom} {a.nom}</span>
                        {a.est_auteur_principal && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                            Main author
                          </span>
                        )}
                        {a.email && <span className="text-gray-400">— {a.email}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
