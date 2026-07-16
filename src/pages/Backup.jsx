import { useState, useEffect, useCallback, useRef } from "react";
import Swal from "sweetalert2";
import { backupService } from "../services/backupService";
import RestoreBackupModal from "../components/RestoreBackupModal";
import { BACKUP_MODULES } from "../constants/backupModules";

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
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  upload:   "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  refresh:  "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  play:     "M5 3l14 9-14 9V3z",
  restore:  "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5",
};

const TRIGGER_LABELS = {
  manual: "Manuel",
  auto: "Automatique",
  scheduled: "Programmé",
  pre_restore: "Sécurité (avant restauration)",
  import: "Importée",
};

const STATUS_STYLES = {
  pending: "bg-gray-100 text-gray-600",
  running: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  pending: "En attente",
  running: "En cours",
  success: "Réussie",
  failed: "Échouée",
};

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "-";
  if (bytes === 0) return "0 o";
  const units = ["o", "Ko", "Mo", "Go"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function Backup() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null); // backup en cours de sélection pour restauration
  const [restoringId, setRestoringId] = useState(null); // id de la ligne Restore en cours de suivi
  const [restoreSubmitting, setRestoreSubmitting] = useState(false);
  const pollRef = useRef(null);
  const restorePollRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadBackups = useCallback(async (page = 1, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await backupService.getAll({ page });
      setBackups(res.data ?? []);
      setPagination(res.meta ?? null);
    } catch (error) {
      console.error("Erreur lors du chargement des sauvegardes:", error);
      if (!silent) {
        Swal.fire({ icon: "error", title: "Erreur", text: "Impossible de charger l'historique des sauvegardes." });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackups(currentPage);
  }, [currentPage, loadBackups]);

  // Rafraîchissement automatique tant qu'une sauvegarde est en attente/en cours,
  // pour refléter la transition pending/running → success/failed sans action.
  useEffect(() => {
    const hasPendingBackup = backups.some((b) => b.status === "pending" || b.status === "running");

    if (hasPendingBackup) {
      pollRef.current = setInterval(() => loadBackups(currentPage, true), 5000);
    }

    return () => clearInterval(pollRef.current);
  }, [backups, currentPage, loadBackups]);

  // Suivi d'une restauration en cours : l'app peut renvoyer 503 (mode
  // maintenance) pendant la fenêtre de restauration — on tolère ces erreurs
  // transitoires comme "toujours en cours" plutôt que de les remonter.
  useEffect(() => {
    if (!restoringId) return undefined;

    const poll = async () => {
      try {
        const res = await backupService.getRestoreStatus(restoringId);
        const status = res.data?.status;
        if (status === "success" || status === "failed") {
          clearInterval(restorePollRef.current);
          setRestoringId(null);
          loadBackups(currentPage);
          Swal.fire({
            icon: status === "success" ? "success" : "error",
            title: status === "success" ? "Restauration terminée" : "Restauration échouée",
            text: status === "success"
              ? "Les données ont été restaurées avec succès."
              : (res.data?.error_message ?? "La restauration a échoué."),
          });
        }
      } catch (error) {
        // 503 (mode maintenance) ou erreur réseau transitoire pendant la
        // restauration : on ignore et on continue de sonder.
        console.warn("Sondage restauration : réponse transitoire, nouvelle tentative...", error);
      }
    };

    restorePollRef.current = setInterval(poll, 4000);
    poll();

    return () => clearInterval(restorePollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoringId]);

  const triggerBackup = async () => {
    const inputOptions = {
      "": "Sauvegarde complète",
      ...Object.fromEntries(BACKUP_MODULES.map((m) => [m.key, m.label])),
    };

    const result = await Swal.fire({
      title: "Lancer une sauvegarde",
      text: "Choisissez ce qui doit être sauvegardé.",
      input: "select",
      inputOptions,
      inputValue: "",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1a7a3c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Lancer",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      setTriggering(true);
      await backupService.create(result.value || null);
      Swal.fire({
        icon: "success",
        title: "Sauvegarde lancée",
        text: "Elle apparaîtra dans la liste dès son démarrage.",
        timer: 2000,
        showConfirmButton: false,
      });
      await loadBackups(currentPage);
    } catch (error) {
      console.error("Erreur lors du déclenchement de la sauvegarde:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error.response?.data?.message ?? "Impossible de lancer la sauvegarde.",
      });
    } finally {
      setTriggering(false);
    }
  };

  const exportBackup = async (backup) => {
    try {
      await backupService.download(backup.id, backup.filename);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      Swal.fire({ icon: "error", title: "Erreur", text: "Fichier de sauvegarde introuvable." });
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // permet de re-sélectionner le même fichier plus tard
    if (!file) return;

    try {
      setImporting(true);
      setImportProgress(0);
      await backupService.import(file, (progressEvent) => {
        if (progressEvent.total) {
          setImportProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        }
      });
      Swal.fire({
        icon: "success",
        title: "Sauvegarde importée",
        text: "Elle est maintenant disponible pour restauration.",
        timer: 2000,
        showConfirmButton: false,
      });
      await loadBackups(currentPage);
    } catch (error) {
      console.error("Erreur lors de l'import:", error);
      const message = error.response?.data?.errors?.file?.[0]
        ?? error.response?.data?.message
        ?? "Impossible d'importer ce fichier.";
      Swal.fire({ icon: "error", title: "Erreur", text: message });
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  const handleRestoreConfirm = async ({ scope, modules }) => {
    if (!restoreTarget) return;

    try {
      setRestoreSubmitting(true);
      await backupService.restore(restoreTarget.id, { scope, modules });
      setRestoreTarget(null);
      Swal.fire({
        icon: "info",
        title: "Restauration en cours",
        text: "L'application sera temporairement indisponible pendant l'opération.",
        timer: 2500,
        showConfirmButton: false,
      });
      // On suit la progression via la liste des restaurations la plus récente.
      const history = await backupService.getRestoreHistory({ page: 1 });
      const latest = history.data?.[0];
      if (latest) setRestoringId(latest.id);
    } catch (error) {
      console.error("Erreur lors du déclenchement de la restauration:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error.response?.data?.message ?? "Impossible de lancer la restauration.",
      });
    } finally {
      setRestoreSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sauvegarde</h1>
        <p className="text-sm text-gray-500 mt-1">
          Historique des sauvegardes de la base de données (automatique chaque jour, ou
          manuelle — complète ou par module). Réservé aux super-administrateurs.
        </p>
      </div>

      {restoringId && (
        <div className="mx-8 mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
          Restauration en cours — l'application peut être temporairement indisponible. Ne fermez pas cette page.
        </div>
      )}

      <div className="mx-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-2">
          <span className="text-base font-bold text-gray-900">Historique des sauvegardes</span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadBackups(currentPage)}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              title="Rafraîchir"
            >
              <Icon d={ICONS.refresh} size={16} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".dump,.backup"
              className="hidden"
              onChange={handleFileSelected}
            />
            <button
              onClick={handleImportClick}
              disabled={importing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Icon d={ICONS.upload} size={15} />
              {importing ? `Import... ${importProgress}%` : "Importer une sauvegarde"}
            </button>

            <button
              onClick={triggerBackup}
              disabled={triggering}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Icon d={ICONS.play} size={15} />
              {triggering ? "Lancement..." : "Lancer une sauvegarde"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-400 font-semibold">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Déclenchement</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Déclenché par</th>
                <th className="px-4 py-3">Taille</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">Chargement...</td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">Aucune sauvegarde pour le moment.</td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-700">{formatDate(backup.created_at)}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{TRIGGER_LABELS[backup.trigger_type] ?? backup.trigger_type}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{backup.module ?? "-"}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{backup.triggered_by_nom ?? "-"}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatBytes(backup.size_bytes)}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[backup.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[backup.status] ?? backup.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => exportBackup(backup)}
                          disabled={backup.status !== "success"}
                          className="text-gray-400 hover:text-[#1a7a3c] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Exporter"
                        >
                          <Icon d={ICONS.download} size={16} />
                        </button>
                        <button
                          onClick={() => setRestoreTarget(backup)}
                          disabled={backup.status !== "success" || !!restoringId}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Restaurer cette sauvegarde"
                        >
                          <Icon d={ICONS.restore} size={14} />
                          Restaurer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
            <span className="text-sm text-gray-500">
              Affichage de <span className="font-semibold">{pagination.from || 0}</span> à{" "}
              <span className="font-semibold">{pagination.to || 0}</span> sur{" "}
              <span className="font-semibold">{pagination.total || 0}</span> sauvegardes
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {restoreTarget && (
        <RestoreBackupModal
          backup={restoreTarget}
          submitting={restoreSubmitting}
          onClose={() => setRestoreTarget(null)}
          onConfirm={handleRestoreConfirm}
        />
      )}
    </div>
  );
}
