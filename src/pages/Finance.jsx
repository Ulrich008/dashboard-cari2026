import { useState } from "react";
import Tabs from "../components/Tabs";
import RegistrationsTab from "./finance/RegistrationsTab";
import DiscountCodesTab from "./finance/DiscountCodesTab";
import GalaTicketsTab from "./finance/GalaTicketsTab";

const TABS = [
  { key: "registrations", label: "Registrations & Paiements" },
  { key: "discount-codes", label: "Codes promo" },
  { key: "gala", label: "Gala Dinner" },
];

export default function Finance() {
  const [active, setActive] = useState("registrations");

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Finance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Registrations, paiements, codes promo et gala dinner
        </p>
      </div>

      <div className="mx-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <Tabs tabs={TABS} active={active} onChange={setActive} />

        {active === "registrations" && <RegistrationsTab />}
        {active === "discount-codes" && <DiscountCodesTab />}
        {active === "gala" && <GalaTicketsTab />}
      </div>
    </div>
  );
}
