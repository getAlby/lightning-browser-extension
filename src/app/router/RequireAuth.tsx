import { Navigate, useLocation } from "react-router-dom";
import { useAccount } from "~/app/context/AccountContext";

function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAccount();
  const location = useLocation();

  if (auth.loading) {
    return null;
  }

  if (!auth.accountId) {
    return <Navigate to="/unlock" state={{ from: location }} />;
  }

  return children;
}

export default RequireAuth;
