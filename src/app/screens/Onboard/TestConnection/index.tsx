import Button from "@components/Button";
import Card from "@components/Card";
import Loading from "@components/Loading";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSettings } from "~/app/context/SettingsContext";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import type { AccountInfo } from "~/types";

export default function TestConnection() {
  const [accountInfo, setAccountInfo] = useState<{
    alias: AccountInfo["alias"];
    name: AccountInfo["name"];
    balance: AccountInfo["balance"];
    currency: AccountInfo["currency"];
  }>();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { getFormattedInCurrency } = useSettings();

  const { t } = useTranslation("translation", {
    keyPrefix: "welcome.test_connection",
  });
  const { t: tCommon } = useTranslation("common");

  const navigate = useNavigate();

  async function handleEdit(event: React.MouseEvent<HTMLButtonElement>) {
    await msg.request("removeAccount");
    navigate(-1);
  }

  async function loadAccountInfo() {
    setLoading(true);
    const timer = setTimeout(() => {
      setErrorMessage(t("connection_taking_long"));
    }, 45000);
    try {
      const response = await api.getAccountInfo();
      const name = response.name;
      const { alias } = response.info;
      const { balance: resBalance, currency } = response.balance;
      const balance =
        typeof resBalance === "number" ? resBalance : parseInt(resBalance);

      setAccountInfo({ alias, balance, name, currency });
    } catch (e) {
      const message = e instanceof Error ? `(${e.message})` : "";
      console.error(message);
      setErrorMessage(message);
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
    <div className="relative mt-14 lg:grid lg:grid-cols-2 gap-8 bg-white dark:bg-surface-02dp p-10 shadow rounded-lg">
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
                <img src="assets/icons/star.svg" alt="image" className="w-8" />
              </div>
              <p className="mt-6 dark:text-white">{t("ready")}</p>

              <div className="mt-6">
                <Card
                  color="bg-gray-100"
                  alias={`${accountInfo.name} - ${accountInfo.alias}`}
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
              <div>
                <p className="mt-8 dark:text-white">{t("tutorial")}</p>
                <div className="mt-8">
                  <a href="https://getalby.com/demo">
                    <Button label={t("try_tutorial")} primary />
                  </a>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div>
              <Loading />
              <p className="text-gray-500 dark:text-white mt-6">
                {t("initializing")}
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
  );
}
