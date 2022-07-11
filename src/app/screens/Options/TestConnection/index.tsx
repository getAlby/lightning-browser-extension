import Button from "@components/Button";
import Card from "@components/Card";
import Loading from "@components/Loading";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAccount } from "~/app/context/AccountContext";
import { useAccounts } from "~/app/context/AccountsContext";
import api from "~/common/lib/api";
import utils from "~/common/lib/utils";

export default function TestConnection() {
  const auth = useAccount();
  const { getAccounts } = useAccounts();
  const [accountInfo, setAccountInfo] = useState<{
    alias: string;
    name: string;
    balance: number;
  }>();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "welcome.test_connection",
  });
  const { t: tCommon } = useTranslation("common");

  async function handleEdit(event: React.MouseEvent<HTMLButtonElement>) {
    await utils.call("removeAccount");
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
      auth.setAccountId(currentAccountId);
      const accountInfo = await auth.fetchAccountInfo({
        accountId: currentAccountId,
      });
      if (accountInfo) {
        setAccountInfo({
          alias: accountInfo.alias,
          balance: accountInfo.balance,
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
      <div className="relative mt-14 lg:grid lg:grid-cols-2 lg:gap-8 bg-white dark:bg-surface-02dp px-10 py-12">
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
                <div className="flex space-x-2">
                  <h1 className="text-2xl font-bold text-green-bitcoin">
                    {tCommon("success")}
                  </h1>
                  <img
                    src="assets/icons/star.svg"
                    alt="image"
                    className="w-8"
                  />
                </div>

                <p className="mt-6 dark:text-gray-400"></p>
                <p className="mt-6 dark:text-neutral-400">{t("ready")}</p>

                <div className="mt-6 shadow-lg p-4 rounded-xl">
                  <Card
                    color="bg-gray-100"
                    alias={`${accountInfo.name} - ${accountInfo.alias}`}
                    satoshis={
                      typeof accountInfo.balance === "number"
                        ? `${accountInfo.balance} sats`
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

        <div
          className="mt-10 -mx-4 relative lg:mt-0 lg:flex lg:items-center"
          aria-hidden="true"
        ></div>
      </div>
    </div>
  );
}
