import { utils } from "elliptic";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import api, { StatusRes } from "~/common/lib/api";

export function StatusLoader() {
  const { setAccountId, setStatusLoaded } = useAccount();

  const handleGetStatus = (status: StatusRes) => {
    const onWelcomePage = window.location.pathname.indexOf("welcome.html") >= 0;
    if (!status.configured && !onWelcomePage) {
      utils.openPage("welcome.html");
      window.close();
    } else if (status.unlocked) {
      setAccountId(status.currentAccountId);
      if (status.configured && onWelcomePage) {
        utils.redirectPage("options.html");
      }
    }
    setStatusLoaded();
  };

  // Invoked only on on mount.
  useEffect(() => {
    api
      .getStatus()
      .then((status: StatusRes) => handleGetStatus(status))
      .catch((e) => toast.error(`An unexpected error occurred (${e.message})`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
