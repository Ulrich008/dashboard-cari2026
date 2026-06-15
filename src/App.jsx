import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import PagesListContent from "./pages/PagesListContent";
import CreatePageContent from "./pages/CreatePageContent";
import Program from "./pages/Program";
import CreateProgramContent from "./pages/CreateProgramContent";
import Speakers from "./pages/Speakers";
import CreateSpeaker from "./pages/CreateSpeaker";
import Sponsors from "./pages/Sponsors";
import CreateSponsor from "./pages/CreateSponsor";
import Documents from "./pages/Documents";
import CreateDocument from "./pages/CreateDocument";
import UsersRoles from "./pages/UsersRoles";
import CreateUser from "./pages/CreateUser";
import SiteInfo from "./pages/SiteInfo";
import Participants from "./pages/Participants";
import CreateParticipant from "./pages/CreateParticipant";
import MenusPage from "./pages/MenusPage";
import CreateMenuContent from "./pages/CreateMenuContent";
import Login from "./pages/Login";
import Register from "./pages/Register";

const PATH_TO_LABEL = {
  "/dashboard":           "Tableau de bord",
  "/pages":               "Pages",
  "/pages/create":        "Pages",
  "/pages/edit":          "Pages",
  "/participants":        "Participants",
  "/participants/create": "Participants",
  "/participants/edit":   "Participants",
  "/program":             "Program",
  "/program/create":      "Program",
  "/program/edit":        "Program",
  "/speakers":            "Speakers / Committees",
  "/speakers/create":     "Speakers / Committees",
  "/speakers/edit":       "Speakers / Committees",
  "/sponsors":            "Sponsors / Partners",
  "/sponsors/create":     "Sponsors / Partners",
  "/sponsors/edit":       "Sponsors / Partners",
  "/documents":           "Documents",
  "/documents/create":    "Documents",
  "/documents/edit":      "Documents",
  "/roles":               "Users & Roles",
  "/roles/create":        "Users & Roles",
  "/roles/edit":          "Users & Roles",
  "/menus":               "Menus",
  "/menus/create":        "Menus",
  "/menus/edit":          "Menus",
  "/site":                "Site Info",
};

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeItem =
    PATH_TO_LABEL[location.pathname] ??
    (location.pathname.startsWith("/pages") ? "Pages" :
     location.pathname.startsWith("/program") ? "Program" :
     location.pathname.startsWith("/speakers") ? "Speakers / Committees" :
     location.pathname.startsWith("/sponsors") ? "Sponsors / Partners" :
     location.pathname.startsWith("/documents") ? "Documents" :
     location.pathname.startsWith("/roles") ? "Users & Roles" :
     location.pathname.startsWith("/participants") ? "Participants" :
     location.pathname.startsWith("/menus") ? "Menus" : "Tableau de bord");

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <Sidebar
        activeItem={activeItem}
        onNavigate={(path) => navigate(path)}
      />

      <main className={`flex-1 ${!isMobile ? 'ml-0' : ''}`}>
        <Routes>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} />

          {/* Pages */}
          <Route path="/pages" element={<PagesListContent />} />
          <Route path="/pages/create" element={
            <CreatePageContent
              onCancel={() => navigate("/pages")}
              onSave={(data) => { console.log("Enregistré", data); navigate("/pages"); }}
            />
          } />
          <Route path="/pages/edit/:id" element={
            <CreatePageContent
              onCancel={() => navigate("/pages")}
              onSave={(data) => { console.log("Mis à jour", data); navigate("/pages"); }}
            />
          } />

          {/* Program */}
          <Route path="/program" element={<Program />} />
          <Route path="/program/create" element={<CreateProgramContent />} />
          <Route path="/program/edit/:id" element={<CreateProgramContent />} />

          {/* Speakers / Committees */}
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/speakers/create" element={<CreateSpeaker />} />
          <Route path="/speakers/edit/:id" element={<CreateSpeaker />} />

          {/* Sponsors / Partners */}
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/sponsors/create" element={<CreateSponsor />} />
          <Route path="/sponsors/edit/:id" element={<CreateSponsor />} />

          {/* Documents */}
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/create" element={<CreateDocument />} />
          <Route path="/documents/edit/:id" element={<CreateDocument />} />

          {/* Users & Roles */}
          <Route path="/roles" element={<UsersRoles />} />
          <Route path="/roles/create" element={<CreateUser />} />
          <Route path="/roles/edit/:id" element={<CreateUser />} />

          {/* Participants */}
          <Route path="/participants" element={<Participants />} />
          <Route path="/participants/create" element={<CreateParticipant />} />
          <Route path="/participants/edit/:id" element={<CreateParticipant />} />

          {/* Menus de navigation */}
          <Route path="/menus" element={<MenusPage />} />
          <Route path="/menus/create" element={<CreateMenuContent />} />
          <Route path="/menus/edit/:id" element={<CreateMenuContent />} />

          {/* Site Info */}
          <Route path="/site" element={<SiteInfo />} />

          <Route path="*" element={<RedirectToPages />} />
        </Routes>
      </main>
    </div>
  );
}

function RedirectToPages() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/dashboard", { replace: true }); }, [navigate]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}