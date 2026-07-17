import { useState } from "react";
import Swal from "sweetalert2";

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
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  trendingUp: "M23 6l-6.5 6.5-4-4L3 18",
  calendar: "M8 2v4M16 2v4M3 10h18",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  creditCard: "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM3 10h18",
};

export default function Payments() {
  const [payments] = useState([
    { id: 1, participant: "Amina Bello", amount: "200€", method: "VISA", date: "Today", status: "Paid" },
    { id: 2, participant: "Jean-Claude Koffi", amount: "450€", method: "Fedapay", date: "Yesterday", status: "Paid" },
    { id: 3, participant: "Marie Diop", amount: "350€", method: "Mastercard", date: "Today", status: "Paid" },
  ]);

  const stats = [
    { 
      label: "Revenus Total", 
      value: "100 125 430 FCFA", 
      change: "15% d'augmentation au cours du mois",
      color: "text-gray-900"
    },
    { 
      label: "Paiement", 
      value: "44", 
      change: "5% d'augmentation aujourd'hui",
      color: "text-gray-900"
    },
    { 
      label: "Pending Payments", 
      value: "25", 
      change: "5% d'augmentation aujourd'hui",
      color: "text-orange-500"
    },
    { 
      label: "Active Promo Codes", 
      value: "04", 
      change: "10% d'augmentation aujourd'hui",
      color: "text-[#1a7a3c]"
    },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleExport = () => {
    Swal.fire({
      icon: 'success',
      title: 'Export en cours',
      text: 'La liste des paiements va être exportée en Excel',
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      {/* En-tête */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Vue global des paiements
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez tous les paiements de la conférence
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="px-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-green-600 mt-2">↑ {stat.change}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau des paiements récents */}
      <div className="mx-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* En-tête du tableau */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a7a3c] text-white rounded-lg text-sm font-medium hover:bg-[#155f2f] transition-colors shadow-sm"
          >
            <Icon d={ICONS.download} size={16} />
            Exporter la liste en Excel
          </button>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Participant</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Payment Method</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr 
                  key={payment.id} 
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                    index === payments.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {payment.participant}
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-900">
                    {payment.amount}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {payment.method}
                  </td>
                  <td className="px-4 py-4 text-gray-500">
                    {payment.date}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button 
                      className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                      title="Voir les détails"
                    >
                      <Icon d={ICONS.eye} size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pied de tableau */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total : {payments.length} paiement(s)</span>
            <span>
              Paiements aujourd'hui : {payments.filter(p => p.date === 'Today').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}