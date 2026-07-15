import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSuperAdmin } from '../utils/roles';

// Second niveau de garde, imbriqué dans ProtectedRoute (déjà authentifié) :
// redirige les admins non super-admin loin de la page Sauvegarde. La vraie
// protection reste le middleware `super.admin` côté backend — ceci n'est
// qu'une redirection UX, pas une frontière de sécurité.
const SuperAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default SuperAdminRoute;
