import { useState } from "react";
import { BACKUP_MODULES as MODULES } from "../constants/backupModules";

export default function RestoreBackupModal({ backup, onClose, onConfirm, submitting }) {
  const [step, setStep] = useState(1); // 1 = sélection, 2 = confirmation
  const [full, setFull] = useState(true);
  const [selected, setSelected] = useState([]);

  const toggleModule = (key) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const selectedModules = full ? MODULES.map((m) => m.key) : selected;
  const warnings = MODULES.filter((m) => selectedModules.includes(m.key) && m.warning);
  const canProceed = full || selected.length > 0;

  const handleConfirm = () => {
    onConfirm({
      scope: full ? "full" : "partial",
      modules: full ? undefined : selected,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Restaurer une sauvegarde</h2>
          <p className="text-sm text-gray-500 mt-1 truncate">{backup?.filename}</p>
        </div>

        {step === 1 && (
          <div className="px-6 py-4 space-y-4">
            <p className="text-sm text-gray-600">
              Choisissez ce que vous voulez restaurer. Ce choix constitue votre confirmation —
              seules les données sélectionnées seront écrasées.
            </p>

            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <input
                type="radio"
                checked={full}
                onChange={() => setFull(true)}
                className="accent-[#1a7a3c]"
              />
              Restauration complète (les 8 modules)
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <input
                type="radio"
                checked={!full}
                onChange={() => setFull(false)}
                className="accent-[#1a7a3c]"
              />
              Choisir des modules
            </label>

            {!full && (
              <div className="grid grid-cols-1 gap-2 pl-6 border-l-2 border-gray-100">
                {MODULES.map((m) => (
                  <label key={m.key} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selected.includes(m.key)}
                      onChange={() => toggleModule(m.key)}
                      className="accent-[#1a7a3c]"
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="px-6 py-4 space-y-3">
            <p className="text-sm text-gray-700">
              Vous allez restaurer :{" "}
              <span className="font-semibold">
                {full ? "TOUS les modules" : MODULES.filter((m) => selected.includes(m.key)).map((m) => m.label).join(", ")}
              </span>
              . Les données actuelles de ces modules seront remplacées par celles de cette sauvegarde.
            </p>

            {warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                {warnings.map((w) => (
                  <p key={w.key} className="text-xs text-amber-800">
                    <span className="font-semibold">{w.label} :</span> {w.warning}
                  </p>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500">
              Une sauvegarde de sécurité complète sera créée automatiquement juste avant la
              restauration.
            </p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            disabled={submitting}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {step === 1 ? "Annuler" : "Retour"}
          </button>

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!canProceed}
              className="px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? "Restauration en cours..." : "Confirmer la restauration"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
