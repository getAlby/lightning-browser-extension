import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "~/app/context/AuthContext";

function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return null;
  }

  if (!auth.account) {
    return <Navigate to="/unlock" state={{ from: location }} />;
  }

  return children;
}

export default RequireAuth;
