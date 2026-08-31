import { useState } from "react";
import Tabs from "../components/Tabs";
import ListeTab from "./participants/ListeTab";
import ImportPapiersTab from "./participants/ImportPapiersTab";
import PapiersTab from "./participants/PapiersTab";
import AuteursExportTab from "./participants/AuteursExportTab";

const TABS = [
  { key: "liste", label: "Participants" },
  { key: "import-papiers", label: "Import Papers" },
  { key: "papiers", label: "Accepted Papers" },
  { key: "auteurs-export", label: "Authors Export" },
];

export default function Participants() {
  const [active, setActive] = useState("liste");

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Participants</h1>
        <p className="text-sm text-gray-500 mt-1">
          Registrations, accepted papers and submission imports
        </p>
      </div>

      <div className="mx-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <Tabs tabs={TABS} active={active} onChange={setActive} />

        {active === "liste" && <ListeTab onGoToImport={() => setActive("import-papiers")} />}
        {active === "import-papiers" && (
          <ImportPapiersTab onImportSuccess={() => setActive("papiers")} />
        )}
        {active === "papiers" && <PapiersTab />}
        {active === "auteurs-export" && <AuteursExportTab />}
      </div>
    </div>
  );
}
