// Clés identiques à config('backup.modules') côté backend — modifier les deux
// ensemble si la liste des modules sauvegardables/restaurables change.
export const BACKUP_MODULES = [
  { key: "pages", label: "Pages" },
  { key: "menus", label: "Menus" },
  {
    key: "participants",
    label: "Participants",
    warning: "Peut échouer si des inscriptions existent déjà pour les participants concernés — dans ce cas la restauration est annulée sans rien modifier.",
  },
  {
    key: "program",
    label: "Program",
    warning: "Peut échouer si des soumissions (papiers) existent déjà pour les événements concernés — dans ce cas la restauration est annulée sans rien modifier.",
  },
  { key: "speakers", label: "Speakers / Committees" },
  { key: "sponsors", label: "Sponsors / Partners" },
  {
    key: "documents",
    label: "Documents",
    warning: "Peut réinitialiser les logos, photos et plannings actuellement utilisés par d'autres modules (Sponsors, Speakers, Program, Pages).",
  },
  {
    key: "users_roles",
    label: "Users & Roles",
    warning: "Peut vous déconnecter si votre propre compte est modifié — reconnectez-vous si nécessaire après la restauration.",
  },
];
