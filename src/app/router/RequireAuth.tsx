import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return <Loading />;
  }

  if (!auth.account) {
    return <Navigate to="/unlock" state={{ from: location }} />;
  }

  return children;
}

export default RequireAuth;
