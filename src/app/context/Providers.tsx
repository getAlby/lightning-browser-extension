import { AccountProvider } from "~/app/context/AccountContext";
import { AccountsProvider } from "~/app/context/AccountsContext";
import { SettingsProvider } from "~/app/context/SettingsContext";
import { StatusLoader } from "~/app/context/StatusLoader";

type Props = {
  children: React.ReactNode;
};

const Providers = (props: Props) => {
  return (
    <SettingsProvider>
      <AccountProvider>
        <StatusLoader />
        <AccountsProvider>{props.children}</AccountsProvider>
      </AccountProvider>
    </SettingsProvider>
  );
};

export default Providers;
