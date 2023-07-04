import { Navigate, useLocation } from "react-router-dom";
import { useAccount } from "~/app/context/AccountContext";

function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAccount();
  const location = useLocation();

  if (auth.statusLoading) {
    return null;
  }

  if (!auth.account) {
    return <Navigate to="/unlock" state={{ from: location }} />;
  }

  return children;
}

export default RequireAuth;
