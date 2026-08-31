import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { participantService } from "../../services/participantService";
import { evenementService } from "../../services/evenementService";

const STATUS_LABELS = {
  paid: "Paid",
  pending: "Pending",
  cancelled: "Cancelled",
  aucune_registration: "No registration",
};

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
    <div className="text-xs font-medium text-gray-500">{label}</div>
    <div className="mt-1 text-xl font-bold text-gray-900">{value}</div>
  </div>
);

const PapersCell = ({ papiers }) => {
  if (!papiers || papiers.length === 0) return <span>-</span>;

  return (
    <div className="space-y-2">
      {papiers.map((papier) => (
        <div key={papier.id}>
          <div className="font-medium text-gray-800">
            #{papier.id} — {papier.titre}
          </div>
          {(papier.auteurs_attendus || []).length > 0 && (
            <div className="text-xs text-gray-500 mt-0.5">
              {papier.auteurs_attendus.map((a, idx) => (
                <span key={idx}>
                  {a.prenom} {a.nom}{a.est_auteur_principal ? " (Principal)" : ""}
                  {idx < papier.auteurs_attendus.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const CountsList = ({ title, counts, labels = {} }) => {
  const entries = Object.entries(counts || {});

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-medium text-gray-500 mb-2">{title}</div>
      {entries.length === 0 ? (
        <div className="text-sm text-gray-400">No data</div>
      ) : (
        <ul className="space-y-1">
          {entries.map(([key, count]) => (
            <li key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{labels[key] || key}</span>
              <span className="font-semibold text-gray-900">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function AuteursExportTab() {
  const [evenements, setEvenements] = useState([]);
  const [selectedEvenementId, setSelectedEvenementId] = useState("");
  const [authors, setAuthors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    evenementService.getAll()
      .then((res) => setEvenements(Array.isArray(res) ? res : (res?.data ?? [])))
      .catch(() => setEvenements([]));
  }, []);

  useEffect(() => {
    if (!selectedEvenementId) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setLoading(true);
      Promise.all([
        participantService.getAuthorsByEvent(selectedEvenementId),
        participantService.getAuthorStatistics(selectedEvenementId),
      ])
        .then(([authorsRes, statsRes]) => {
          setAuthors(Array.isArray(authorsRes) ? authorsRes : []);
          setStats(statsRes);
        })
        .catch(() => {
          Swal.fire({ icon: "error", title: "Error", text: "Unable to load authors for this event." });
          setAuthors([]);
          setStats(null);
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [selectedEvenementId]);

  const handleExport = async (format) => {
    if (!selectedEvenementId) return;

    try {
      setExporting(true);
      await participantService.exportAuthors(selectedEvenementId, format);
    } catch (error) {
      console.error("Error exporting authors:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Unable to generate the export file." });
    } finally {
      setExporting(false);
    }
  };

  const canExport = Boolean(selectedEvenementId) && authors.length > 0 && !exporting;

  return (
    <div>
      <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-base font-bold text-gray-900 shrink-0">Authors Export</span>

          <select
            value={selectedEvenementId}
            onChange={(e) => {
              setSelectedEvenementId(e.target.value);
              setAuthors([]);
              setStats(null);
            }}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
          >
            <option value="">Select an event…</option>
            {evenements.map((evt) => (
              <option key={evt.id} value={evt.id}>{evt.nom || evt.code}</option>
            ))}
          </select>

          <div className="flex-1" />

          <button
            onClick={() => handleExport("xlsx")}
            disabled={!canExport}
            className="px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#156332] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Download Excel (.xlsx)
          </button>
          <button
            onClick={() => handleExport("md")}
            disabled={!canExport}
            className="px-4 py-2 rounded-lg border border-[#1a7a3c] text-[#1a7a3c] text-sm font-semibold hover:bg-[#1a7a3c]/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Download Markdown (.md)
          </button>
        </div>
      </div>

      {!selectedEvenementId ? (
        <div className="px-6 py-16 text-center text-gray-400">
          Select an event to see its authors and statistics.
        </div>
      ) : loading ? (
        <div className="px-6 py-16 text-center text-gray-400">Loading…</div>
      ) : (
        <>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 px-6 py-4">
              <StatCard label="Total authors" value={stats.total_auteurs} />
              <StatCard label="Amount collected" value={`${stats.montant_total_collecte}`} />
              <StatCard label="Attending gala" value={stats.total_participants_gala} />
              <CountsList title="By payment status" counts={stats.par_statut_paiement} labels={STATUS_LABELS} />
              <CountsList title="By payment method" counts={stats.par_methode_paiement} />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Institution</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Country</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Paper(s) &amp; Expected Authors</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Payment Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Method</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Gala</th>
                </tr>
              </thead>
              <tbody>
                {authors.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-gray-400">
                      No authors found for this event.
                    </td>
                  </tr>
                ) : (
                  authors.map((author, i) => (
                    <tr
                      key={author.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                        i === authors.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">{author.prenom} {author.nom}</td>
                      <td className="px-4 py-4 text-gray-600">{author.email}</td>
                      <td className="px-4 py-4 text-gray-600">{author.institution || "-"}</td>
                      <td className="px-4 py-4 text-gray-600">{author.pays || "-"}</td>
                      <td className="px-4 py-4 text-gray-600"><PapersCell papiers={author.papiers} /></td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {STATUS_LABELS[author.statut_paiement] || author.statut_paiement || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {author.montant_total ? `${author.montant_total} ${author.devise || ""}` : "-"}
                      </td>
                      <td className="px-4 py-4 text-gray-600">{author.payment_method || "-"}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          author.participe_gala ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {author.participe_gala ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
