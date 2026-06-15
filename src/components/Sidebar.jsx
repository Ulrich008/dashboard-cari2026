import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
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
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  pages:     "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  users:     "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  program:   "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  speakers:  "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-1.5-3.1M15 3a4 4 0 0 1 0 7.7",
  sponsors:  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  docs:      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  roles:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  site:      "M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z",
  logout:    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  menu:      "M3 12h18M3 6h18M3 18h18",
  close:     "M6 18L18 6M6 6l12 12",
};

const NAV_ITEMS = [
  { label: "Tableau de bord",       icon: "dashboard", path: "/dashboard" },
  { label: "Pages",                 icon: "pages",     path: "/pages" },
  { label: "Menus",                 icon: "menu",      path: "/menus" },
  { label: "Participants",          icon: "users",     path: "/participants" },
  { label: "Program",               icon: "program",   path: "/program" },
  { label: "Speakers / Committees", icon: "speakers",  path: "/speakers" },
  { label: "Sponsors / Partners",   icon: "sponsors",  path: "/sponsors" },
  { label: "Documents",             icon: "docs",      path: "/documents" },
  { label: "Users & Roles",         icon: "roles",     path: "/roles" },
  { label: "Site Info",             icon: "site",      path: "/site" },
];

export default function Sidebar({ activeItem = "Pages", onNavigate }) {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter la taille de l'écran
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Empêcher le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const handleNavigation = (path) => {
    onNavigate?.(path);
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1a7a3c] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="font-semibold text-gray-800 text-sm tracking-wide">
            CARI 2026
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 md:px-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === activeItem;
          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#1a7a3c] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
              title={isMobile && !isMobileOpen ? item.label : undefined}
            >
              <Icon d={ICONS[item.icon]} size={18} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User block */}
      <div className="px-2 md:px-3 pb-4 space-y-2">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3">
          <div className="w-9 h-9 rounded-full bg-[#1a7a3c] flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Utilisateur'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button 
          onClick={() => {
            Swal.fire({
              title: 'Se déconnecter ?',
              text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#1a7a3c',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Oui, me déconnecter',
              cancelButtonText: 'Annuler'
            }).then((result) => {
              if (result.isConfirmed) {
                logout();
              }
            });
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
        >
          <Icon d={ICONS.logout} size={16} />
          <span>Se déconnecter</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Bouton menu mobile */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200"
        aria-label="Menu"
      >
        <Icon d={isMobileOpen ? ICONS.close : ICONS.menu} size={20} />
      </button>

      {/* Overlay pour mobile */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm
          transition-transform duration-300 ease-in-out z-40
          ${isMobile ? 'w-64' : 'w-[272px] shrink-0'}
          ${isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Espace réservé pour le contenu sur mobile quand le sidebar est ouvert */}
      {isMobile && isMobileOpen && (
        <div className="fixed inset-0 z-30" aria-hidden="true" />
      )}
    </>
  );
}