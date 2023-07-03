import {
  AlertIcon,
  RefreshIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import Container from "@components/Container";
import { useTranslation } from "react-i18next";
import { useAccount } from "~/app/context/AccountContext";

function ConnectionError() {
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation");
  const { account, selectAccount, accountLoading } = useAccount();

  const reload = () => {
    account && selectAccount(account.id);
  };
  return (
    <Container classNames="h-full flex flex-col">
      <div className="flex justify-center">
        <div className="w-32 dark:text-white">
          <img src="assets/icons/alby-x-head.svg" className="w-full" />
        </div>
      </div>
      <div className="text-red-500 bg-red-50 p-4 text-sm rounded-md">
        <AlertIcon className="inline h-6 w-6 text-red-500 -ml-2" />
        {t("connection_error.info")}
      </div>
      <div className="grow"></div>
      <div>
        <Button
          label={tCommon("actions.try_again")}
          icon={!accountLoading && <RefreshIcon className="w-6 mr-2" />}
          fullWidth
          primary
          loading={accountLoading}
          onClick={() => {
            reload();
          }}
        />
      </div>
    </Container>
  );
}

export default ConnectionError;
