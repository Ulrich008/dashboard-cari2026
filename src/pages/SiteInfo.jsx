import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  save:        "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  globe:       "M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9",
  calendar:    "M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01",
  location:    "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  phone:       "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  mail:        "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  facebook:    "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  twitter:     "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
  linkedin:    "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  youtube:     "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM10 14.75l5.5-3-5.5-3v6z",
  instagram:   "M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.5 7.5h.01",
  settings:    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
  upload:      "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  check:       "M20 6L9 17l-5-5",
};

export default function SiteInfo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  // Informations générales
  const [generalInfo, setGeneralInfo] = useState({
    siteName: "CARI 2026",
    siteTagline: "Conférence Africaine sur la Recherche en Informatique",
    siteDescription: "La conférence de référence en Afrique pour les technologies de l'information et la recherche en informatique",
    contactEmail: "contact@cari2026.org",
    contactPhone: "+229 21 00 00 00",
    address: "Cotonou, Bénin",
    timezone: "Africa/Porto-Novo",
    language: "fr",
  });

  // Dates importantes
  const [importantDates, setImportantDates] = useState({
    conferenceStart: "2026-10-21",
    conferenceEnd: "2026-10-23",
    abstractDeadline: "2026-06-15",
    paperDeadline: "2026-07-30",
    notificationDate: "2026-08-30",
    registrationDeadline: "2026-09-15",
  });

  // Réseaux sociaux
  const [socialLinks, setSocialLinks] = useState({
    facebook: "https://facebook.com/cari2026",
    twitter: "https://twitter.com/cari2026",
    linkedin: "https://linkedin.com/company/cari2026",
    youtube: "https://youtube.com/cari2026",
    instagram: "https://instagram.com/cari2026",
  });

  // SEO
  const [seoInfo, setSeoInfo] = useState({
    metaTitle: "CARI 2026 - Conférence Africaine sur la Recherche en Informatique",
    metaDescription: "Rejoignez la plus grande conférence en informatique d'Afrique. Participez aux keynotes, workshops et panels avec les experts internationaux.",
    metaKeywords: "CARI, conférence, informatique, Afrique, recherche, IA, data science, Bénin",
    googleAnalyticsId: "",
  });

  // Apparence
  const [appearance, setAppearance] = useState({
    primaryColor: "#1a7a3c",
    secondaryColor: "#2d5a3f",
    headerStyle: "solid",
    footerStyle: "solid",
  });

  useEffect(() => {
    loadSiteInfo();
  }, []);

  const loadSiteInfo = () => {
    const savedGeneral = localStorage.getItem("siteInfo_general");
    const savedDates = localStorage.getItem("siteInfo_dates");
    const savedSocial = localStorage.getItem("siteInfo_social");
    const savedSeo = localStorage.getItem("siteInfo_seo");
    const savedAppearance = localStorage.getItem("siteInfo_appearance");
    const savedLogo = localStorage.getItem("siteInfo_logo");
    const savedFavicon = localStorage.getItem("siteInfo_favicon");

    if (savedGeneral) setGeneralInfo(JSON.parse(savedGeneral));
    if (savedDates) setImportantDates(JSON.parse(savedDates));
    if (savedSocial) setSocialLinks(JSON.parse(savedSocial));
    if (savedSeo) setSeoInfo(JSON.parse(savedSeo));
    if (savedAppearance) setAppearance(JSON.parse(savedAppearance));
    if (savedLogo) setLogoPreview(savedLogo);
    if (savedFavicon) setFaviconPreview(savedFavicon);
  };

  const handleSave = () => {
    setIsLoading(true);
    
    localStorage.setItem("siteInfo_general", JSON.stringify(generalInfo));
    localStorage.setItem("siteInfo_dates", JSON.stringify(importantDates));
    localStorage.setItem("siteInfo_social", JSON.stringify(socialLinks));
    localStorage.setItem("siteInfo_seo", JSON.stringify(seoInfo));
    localStorage.setItem("siteInfo_appearance", JSON.stringify(appearance));
    
    setTimeout(() => {
      setIsLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Le fichier ne doit pas dépasser 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        localStorage.setItem("siteInfo_logo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert("Le favicon ne doit pas dépasser 500KB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result);
        localStorage.setItem("siteInfo_favicon", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: "general", label: "Général", icon: "globe" },
    { id: "dates", label: "Dates", icon: "calendar" },
    { id: "social", label: "Réseaux sociaux", icon: "facebook" },
    { id: "seo", label: "SEO", icon: "settings" },
    { id: "appearance", label: "Apparence", icon: "settings" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      {/* En-tête */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Informations du site
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gérez les paramètres généraux de votre site web
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                <Icon d={ICONS.check} size={16} />
                <span>Enregistré !</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm disabled:opacity-50"
            >
              <Icon d={ICONS.save} size={15} />
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="px-8">
        <div className="flex gap-1 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "text-[#1a7a3c] border-b-2 border-[#1a7a3c]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon d={ICONS[tab.icon]} size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="flex-1 px-8 pb-8 pt-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Onglet Général */}
          {activeTab === "general" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 space-y-8">
                {/* Logo et Favicon */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                    Logo et favicon
                  </h2>
                  <div className="flex gap-8">
                    {/* Logo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                      <div className="relative">
                        <div className="w-32 h-32 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <Icon d={ICONS.upload} size={24} className="text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-400">Aucun logo</p>
                            </div>
                          )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-full shadow-md cursor-pointer border border-gray-200">
                          <Icon d={ICONS.upload} size={14} className="text-gray-600" />
                          <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                        </label>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">PNG, JPG. Max 2MB</p>
                    </div>
                    {/* Favicon */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                      <div className="relative">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                          {faviconPreview ? (
                            <img src={faviconPreview} alt="Favicon" className="w-full h-full object-cover" />
                          ) : (
                            <Icon d={ICONS.upload} size={20} className="text-gray-400" />
                          )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-full shadow-md cursor-pointer border border-gray-200">
                          <Icon d={ICONS.upload} size={12} className="text-gray-600" />
                          <input type="file" accept="image/*" onChange={handleFaviconChange} className="hidden" />
                        </label>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">ICO, PNG. Max 500KB</p>
                    </div>
                  </div>
                </div>

                {/* Informations du site */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                    Informations générales
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">Nom du site</label>
                      <input
                        type="text"
                        value={generalInfo.siteName}
                        onChange={(e) => setGeneralInfo({...generalInfo, siteName: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">Slogan</label>
                      <input
                        type="text"
                        value={generalInfo.siteTagline}
                        onChange={(e) => setGeneralInfo({...generalInfo, siteTagline: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c]"
                      />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">Description</label>
                      <textarea
                        value={generalInfo.siteDescription}
                        onChange={(e) => setGeneralInfo({...generalInfo, siteDescription: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] resize-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">Email de contact</label>
                      <div className="relative">
                        <Icon d={ICONS.mail} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={generalInfo.contactEmail}
                          onChange={(e) => setGeneralInfo({...generalInfo, contactEmail: e.target.value})}
                          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">Téléphone</label>
                      <div className="relative">
                        <Icon d={ICONS.phone} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={generalInfo.contactPhone}
                          onChange={(e) => setGeneralInfo({...generalInfo, contactPhone: e.target.value})}
                          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">Adresse</label>
                      <div className="relative">
                        <Icon d={ICONS.location} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={generalInfo.address}
                          onChange={(e) => setGeneralInfo({...generalInfo, address: e.target.value})}
                          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">Langue</label>
                      <select
                        value={generalInfo.language}
                        onChange={(e) => setGeneralInfo({...generalInfo, language: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c]"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Dates importantes */}
          {activeTab === "dates" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Dates importantes
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Début de la conférence</label>
                    <input
                      type="date"
                      value={importantDates.conferenceStart}
                      onChange={(e) => setImportantDates({...importantDates, conferenceStart: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Fin de la conférence</label>
                    <input
                      type="date"
                      value={importantDates.conferenceEnd}
                      onChange={(e) => setImportantDates({...importantDates, conferenceEnd: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Date limite des résumés</label>
                    <input
                      type="date"
                      value={importantDates.abstractDeadline}
                      onChange={(e) => setImportantDates({...importantDates, abstractDeadline: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Date limite des articles</label>
                    <input
                      type="date"
                      value={importantDates.paperDeadline}
                      onChange={(e) => setImportantDates({...importantDates, paperDeadline: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Date de notification</label>
                    <input
                      type="date"
                      value={importantDates.notificationDate}
                      onChange={(e) => setImportantDates({...importantDates, notificationDate: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Date limite d'inscription</label>
                    <input
                      type="date"
                      value={importantDates.registrationDeadline}
                      onChange={(e) => setImportantDates({...importantDates, registrationDeadline: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Réseaux sociaux */}
          {activeTab === "social" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Liens des réseaux sociaux
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon d={ICONS.facebook} size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={socialLinks.facebook}
                        onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                        placeholder="https://facebook.com/..."
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                      <Icon d={ICONS.twitter} size={20} className="text-sky-600" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={socialLinks.twitter}
                        onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                        placeholder="https://twitter.com/..."
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-800 flex items-center justify-center">
                      <Icon d={ICONS.linkedin} size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={socialLinks.linkedin}
                        onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                        placeholder="https://linkedin.com/..."
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                      <Icon d={ICONS.youtube} size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={socialLinks.youtube}
                        onChange={(e) => setSocialLinks({...socialLinks, youtube: e.target.value})}
                        placeholder="https://youtube.com/..."
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-pink-600 flex items-center justify-center">
                      <Icon d={ICONS.instagram} size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={socialLinks.instagram}
                        onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                        placeholder="https://instagram.com/..."
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet SEO */}
          {activeTab === "seo" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Optimisation SEO
                </h2>
                <div className="space-y-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Meta titre</label>
                    <input
                      type="text"
                      value={seoInfo.metaTitle}
                      onChange={(e) => setSeoInfo({...seoInfo, metaTitle: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                    <p className="text-xs text-gray-400">Recommandé : 50-60 caractères</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Meta description</label>
                    <textarea
                      value={seoInfo.metaDescription}
                      onChange={(e) => setSeoInfo({...seoInfo, metaDescription: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none"
                    />
                    <p className="text-xs text-gray-400">Recommandé : 150-160 caractères</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Meta keywords</label>
                    <input
                      type="text"
                      value={seoInfo.metaKeywords}
                      onChange={(e) => setSeoInfo({...seoInfo, metaKeywords: e.target.value})}
                      placeholder="mot-clé1, mot-clé2, mot-clé3"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                    <p className="text-xs text-gray-400">Séparez les mots-clés par des virgules</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Google Analytics ID</label>
                    <input
                      type="text"
                      value={seoInfo.googleAnalyticsId}
                      onChange={(e) => setSeoInfo({...seoInfo, googleAnalyticsId: e.target.value})}
                      placeholder="UA-XXXXXXXX-X"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Apparence */}
          {activeTab === "appearance" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Personnalisation
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Couleur primaire</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={appearance.primaryColor}
                        onChange={(e) => setAppearance({...appearance, primaryColor: e.target.value})}
                        className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={appearance.primaryColor}
                        onChange={(e) => setAppearance({...appearance, primaryColor: e.target.value})}
                        className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Couleur secondaire</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={appearance.secondaryColor}
                        onChange={(e) => setAppearance({...appearance, secondaryColor: e.target.value})}
                        className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={appearance.secondaryColor}
                        onChange={(e) => setAppearance({...appearance, secondaryColor: e.target.value})}
                        className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Style de l'en-tête</label>
                    <select
                      value={appearance.headerStyle}
                      onChange={(e) => setAppearance({...appearance, headerStyle: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    >
                      <option value="solid">Solide</option>
                      <option value="transparent">Transparent</option>
                      <option value="glass">Glassmorphism</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Style du pied de page</label>
                    <select
                      value={appearance.footerStyle}
                      onChange={(e) => setAppearance({...appearance, footerStyle: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    >
                      <option value="solid">Solide</option>
                      <option value="dark">Sombre</option>
                      <option value="light">Clair</option>
                    </select>
                  </div>
                </div>

                {/* Aperçu */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-3">Aperçu des couleurs</p>
                  <div className="flex gap-3">
                    <div className="w-20 h-10 rounded" style={{ backgroundColor: appearance.primaryColor }}></div>
                    <div className="w-20 h-10 rounded" style={{ backgroundColor: appearance.secondaryColor }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}