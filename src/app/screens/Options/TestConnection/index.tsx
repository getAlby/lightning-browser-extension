import Button from "@components/Button";
import Loading from "@components/Loading";
import {
  PopiconsBadgeCheckSolid,
  PopiconsCircleExclamationLine,
} from "@popicons/react";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Alert from "~/app/components/Alert";
import Hyperlink from "~/app/components/Hyperlink";
import { useAccount } from "~/app/context/AccountContext";
import { useAccounts } from "~/app/context/AccountsContext";
import { useSettings } from "~/app/context/SettingsContext";
import TestConnectionResultCard from "~/app/screens/Options/TestConnection/card";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import type { AccountInfo } from "~/types";

export default function TestConnection() {
  const { getFormattedInCurrency } = useSettings();
  const { account, setAccountId, fetchAccountInfo } = useAccount();
  const { getAccounts } = useAccounts();

  const [accountInfo, setAccountInfo] = useState<{
    alias: AccountInfo["alias"];
    name: AccountInfo["name"];
    balance: AccountInfo["balance"];
    currency: AccountInfo["currency"];
  }>();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "welcome.test_connection",
  });
  const { t: tCommon } = useTranslation("common");

  async function handleEdit(event: React.MouseEvent<HTMLButtonElement>) {
    await msg.request("removeAccount");
    navigate(-1);
  }

  async function loadAccountInfo() {
    setLoading(true);
    // show an error message after 45 seconds. Then probably something is wrong
    const timer = setTimeout(() => {
      setErrorMessage(t("connection_taking_long"));
    }, 45000);
    try {
      const { currentAccountId } = await api.getStatus();
      setAccountId(currentAccountId);

      const accountInfo = await fetchAccountInfo({
        accountId: currentAccountId,
      });

      if (accountInfo) {
        setAccountInfo({
          alias: accountInfo.alias,
          balance: accountInfo.balance,
          currency: accountInfo.currency,
          name: accountInfo.name,
        });
      }
      getAccounts();
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setErrorMessage(e.message);
      }
    } finally {
      setLoading(false);
      clearTimeout(timer);
    }
  }

  useEffect(() => {
    loadAccountInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="relative mt-14 lg:grid lg:grid-cols-1 lg:gap-8 bg-white dark:bg-surface-02dp p-12 shadow rounded-lg">
        <div className="relative">
          <div>
            {errorMessage && (
              <div>
                <h1 className="text-3xl font-bold dark:text-white">
                  {t("connection_error")}
                </h1>
                <p className="text-gray-500 dark:text-white">
                  {t("review_connection_details")}
                </p>

                <p className="text-gray-500 dark:text-grey-500 mt-4 mb-4">
                  <i>{errorMessage}</i>
                </p>

                <Button
                  label={t("actions.delete_edit_account")}
                  onClick={handleEdit}
                  primary
                />
                <p className="text-gray-500 dark:text-white">
                  {t("contact_support")}
                </p>
              </div>
            )}

            {accountInfo && accountInfo.alias && (
              <div>
                <div className="flex space-x-2 items-center text-green-bitcoin">
                  <PopiconsBadgeCheckSolid className="w-8 h-8" />
                  <h1 className="text-2xl font-bold">{tCommon("success")}</h1>
                </div>

                <p className="mt-6 dark:text-gray-400"></p>
                {account?.nodeRequired ? (
                  <div className="mt-6">
                    <Alert type="info">
                      <div className="flex items-center gap-2">
                        <div className="shrink-0">
                          <PopiconsCircleExclamationLine className="w-5 h-5" />
                        </div>
                        <span className="text-sm">
                          <Trans
                            i18nKey={"node_required"}
                            t={tCommon}
                            components={[
                              // eslint-disable-next-line react/jsx-key
                              <Hyperlink
                                className="underline"
                                href="https://getalby.com/onboarding/node/new"
                                target="_blank"
                                rel="noopener nofollow"
                              />,

                              // eslint-disable-next-line react/jsx-key
                              <Hyperlink
                                className="underline"
                                href="https://guides.getalby.com/user-guide/alby-account-and-browser-extension/alby-account/faqs-alby-account/what-are-fee-credits-in-my-alby-account"
                                target="_blank"
                                rel="noopener nofollow"
                              />,
                            ]}
                          />
                        </span>
                      </div>
                    </Alert>
                  </div>
                ) : (
                  <p className="mt-6 dark:text-neutral-400">{t("ready")}</p>
                )}

                <div className="mt-6 lg:grid lg:grid-cols-2">
                  <TestConnectionResultCard
                    color="bg-gray-100"
                    accountName={accountInfo.name}
                    alias={accountInfo.alias}
                    satoshis={
                      typeof accountInfo.balance === "number"
                        ? getFormattedInCurrency(
                            accountInfo.balance,
                            accountInfo.currency
                          )
                        : ""
                    }
                  />
                </div>
              </div>
            )}
            {loading && (
              <div>
                <Loading />
                <p className="text-gray-500 dark:text-white mt-6">
                  {t("initializing")} <br />
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
