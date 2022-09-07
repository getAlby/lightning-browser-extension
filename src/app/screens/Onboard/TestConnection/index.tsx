import Button from "@components/Button";
import Card from "@components/Card";
import Loading from "@components/Loading";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "~/common/lib/api";
import utils from "~/common/lib/utils";

export default function TestConnection() {
  const [accountInfo, setAccountInfo] = useState<{
    alias: string;
    name: string;
    balance: number;
  }>();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("translation", {
    keyPrefix: "welcome.test_connection",
  });
  const { t: tCommon } = useTranslation("common");

  const navigate = useNavigate();

  async function handleEdit(event: React.MouseEvent<HTMLButtonElement>) {
    await utils.call("removeAccount");
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
      const { balance: resBalance } = response.balance;
      const balance =
        typeof resBalance === "number" ? resBalance : parseInt(resBalance);

      setAccountInfo({ alias, balance, name });
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
  }, []);

  return (
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
                <img src="assets/icons/star.svg" alt="image" className="w-8" />
              </div>
              <p className="mt-6 dark:text-white">{t("ready")}</p>

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
