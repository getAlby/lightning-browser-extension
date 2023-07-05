import { RefreshIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import Container from "@components/Container";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "~/app/context/AccountContext";

function ConnectionError() {
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation");
  const { account, selectAccount } = useAccount();
  const [loading, setLoading] = useState<boolean>(false);

  const reload = () => {
    if (account) {
      setLoading(true);
      selectAccount(account.id);
    }
  };

  useEffect(() => {
    // account property "error" is only available when loading is finished
    if (account?.error) {
      setLoading(false);
    }
  }, [account]);

  return (
    <Container classNames="h-full flex flex-col">
      <div className="flex justify-center">
        <div className="w-32 dark:text-white">
          <img src="assets/icons/alby-x-head.svg" className="w-full" />
        </div>
      </div>
      <div className="text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-900 p-4 text-sm rounded-md">
        {t("connection_error.info")}
      </div>
      <div className="grow"></div>
      <div>
        <Button
          label={tCommon("actions.try_again")}
          icon={!loading && <RefreshIcon className="w-6" />}
          fullWidth
          primary
          loading={loading}
          onClick={() => {
            reload();
          }}
        />
      </div>
    </Container>
  );
}

export default ConnectionError;
