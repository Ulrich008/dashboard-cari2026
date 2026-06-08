import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pageService } from "../services/pageService";
import { programService } from "../services/programService";
import { speakerService } from "../services/speakerService";
import { sponsorService } from "../services/sponsorService";
import { documentService } from "../services/documentService";
import { userService } from "../services/userService";

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
  dashboard:   "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  pages:       "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  users:       "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  program:     "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  speaker:     "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  sponsor:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  doc:         "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  calendar:    "M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01",
  trendingUp:  "M23 6l-7 7-4-4-7 7M23 10V6h-4",
  trendingDown: "M23 18l-7-7-4 4-7-7M23 14v4h-4",
  eye:         "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  download:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3",
  clock:       "M12 6v6l4 2M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  arrowRight:  "M5 12h14M12 5l7 7-7 7",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pages: 0,
    programs: 0,
    speakers: 0,
    sponsors: 0,
    documents: 0,
    users: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingPrograms, setUpcomingPrograms] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les données depuis l'API
      const [pages, programs, speakers, sponsors, documents, users] = await Promise.all([
        pageService.getAll().catch(() => []),
        programService.getAll().catch(() => []),
        speakerService.getAll().catch(() => []),
        sponsorService.getAll().catch(() => []),
        documentService.getAll().catch(() => []),
        userService.getAll().catch(() => []),
      ]);

      setStats({
        pages: Array.isArray(pages) ? pages.length : 0,
        programs: Array.isArray(programs) ? programs.length : 0,
        speakers: Array.isArray(speakers) ? speakers.length : 0,
        sponsors: Array.isArray(sponsors) ? sponsors.length : 0,
        documents: Array.isArray(documents) ? documents.length : 0,
        users: Array.isArray(users) ? users.filter(u => u.statut_compte === 'ACTIF').length : 0,
      });

      // Programmes à venir (triés par date)
      const today = new Date().toISOString().split('T')[0];
      const upcoming = Array.isArray(programs) 
        ? programs
          .filter(p => p.activated && (p.date_debut || p.date) >= today)
          .sort((a, b) => (a.date_debut || a.date).localeCompare(b.date_debut || b.date))
          .slice(0, 5)
        : [];
      setUpcomingPrograms(upcoming);

      // Documents récents
      const recent = Array.isArray(documents)
        ? documents
          .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
          .slice(0, 5)
        : [];
      setRecentDocuments(recent);

      // Activités récentes (simulées)
      setRecentActivities([]);

    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: "Pages", 
      value: stats.pages, 
      icon: "pages", 
      color: "bg-blue-500", 
      bgColor: "bg-blue-100", 
      textColor: "text-blue-600",
      path: "/pages"
    },
    { 
      title: "Programmes", 
      value: stats.programs, 
      icon: "program", 
      color: "bg-green-500", 
      bgColor: "bg-green-100", 
      textColor: "text-green-600",
      path: "/program"
    },
    { 
      title: "Speakers", 
      value: stats.speakers, 
      icon: "speaker", 
      color: "bg-purple-500", 
      bgColor: "bg-purple-100", 
      textColor: "text-purple-600",
      path: "/speakers"
    },
    { 
      title: "Sponsors", 
      value: stats.sponsors, 
      icon: "sponsor", 
      color: "bg-yellow-500", 
      bgColor: "bg-yellow-100", 
      textColor: "text-yellow-600",
      path: "/sponsors"
    },
    { 
      title: "Documents", 
      value: stats.documents, 
      icon: "doc", 
      color: "bg-red-500", 
      bgColor: "bg-red-100", 
      textColor: "text-red-600",
      path: "/documents"
    },
    { 
      title: "Utilisateurs actifs", 
      value: stats.users, 
      icon: "users", 
      color: "bg-indigo-500", 
      bgColor: "bg-indigo-100", 
      textColor: "text-indigo-600",
      path: "/users"
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f5f6f8]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1a7a3c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      {/* En-tête */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Bienvenue sur votre espace d'administration CARI 2026
        </p>
      </div>

      {/* Cartes statistiques */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statCards.map((stat, index) => (
            <button
              key={index}
              onClick={() => navigate(stat.path)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon d={ICONS[stat.icon]} size={20} className={stat.textColor} />
                </div>
                <Icon d={ICONS.arrowRight} size={16} className="text-gray-300 group-hover:text-[#1a7a3c] transition-colors" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Programme à venir */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon d={ICONS.calendar} size={18} className="text-[#1a7a3c]" />
                <h2 className="font-semibold text-gray-900">Programmes à venir</h2>
              </div>
              <button 
                onClick={() => navigate("/program")}
                className="text-xs text-[#1a7a3c] hover:underline font-medium"
              >
                Voir tout
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingPrograms.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400">
                  Aucun programme à venir
                </div>
              ) : (
                upcomingPrograms.map((program, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{program.titre || program.title || program.nom_programme}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{program.date_debut || program.date}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{program.heure_debut || program.time}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        program.type_programme === "Keynote" || program.type === "Keynote" ? "bg-purple-100 text-purple-700" :
                        program.type_programme === "Workshop" || program.type === "Workshop" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {program.type_programme || program.type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Documents récents */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon d={ICONS.doc} size={18} className="text-[#1a7a3c]" />
                <h2 className="font-semibold text-gray-900">Documents récents</h2>
              </div>
              <button 
                onClick={() => navigate("/documents")}
                className="text-xs text-[#1a7a3c] hover:underline font-medium"
              >
                Voir tout
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentDocuments.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400">
                  Aucun document disponible
                </div>
              ) : (
                recentDocuments.map((doc, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Icon d={ICONS.doc} size={14} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{doc.nom_document || doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{doc.created_at || doc.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${doc.activated !== undefined ? (doc.activated ? "text-green-600" : "text-gray-400") : (doc.online ? "text-green-600" : "text-gray-400")}`}>
                          {doc.activated !== undefined ? (doc.activated ? "Actif" : "Inactif") : (doc.online ? "Actif" : "Inactif")}
                        </span>
                        <Icon d={ICONS.download} size={14} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activités récentes */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Icon d={ICONS.clock} size={18} className="text-[#1a7a3c]" />
                <h2 className="font-semibold text-gray-900">Activités récentes</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Type</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Élément</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Utilisateur</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((activity, idx) => (
                    <tr key={activity.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          activity.type === "page" ? "bg-blue-100 text-blue-700" :
                          activity.type === "program" ? "bg-green-100 text-green-700" :
                          activity.type === "speaker" ? "bg-purple-100 text-purple-700" :
                          activity.type === "sponsor" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {activity.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{activity.action}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{activity.item}</td>
                      <td className="px-4 py-3 text-gray-600">{activity.user}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {activity.date} à {activity.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats rapides */}
          
        </div>
      </div>
    </div>
  );
}