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
  const [errorMessage, setErrorMessage] = useState();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(["welcome"]);

  const navigate = useNavigate();

  function handleEdit(event: React.MouseEvent<HTMLButtonElement>) {
    utils.call("removeAccount").then(() => {
      navigate(-1);
    });
  }

  function loadAccountInfo() {
    setLoading(true);
    api
      .getAccountInfo()
      .then((response) => {
        const name = response.name;
        const { alias } = response.info;
        const balance = parseInt(response.balance.balance);

        setAccountInfo({ alias, balance, name });
      })
      .catch((e) => {
        console.error(e);
        setErrorMessage(e.message);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAccountInfo();
  }, []);

  return (
    <div className="relative lg:mt-14 lg:grid lg:grid-cols-2 lg:gap-8 bg-white dark:bg-surface-02dp px-10 py-12">
      <div className="relative">
        <div>
          {errorMessage && (
            <div>
              <h1 className="text-3xl font-bold dark:text-white">
                {t("test_connection.connection_error")}
              </h1>
              <p className="dark:text-neutral-500">{errorMessage}</p>
              <Button
                label={t("test_connection.edit")}
                onClick={handleEdit}
                primary
              />
            </div>
          )}

          {accountInfo && accountInfo.alias && (
            <div>
              <div className="flex space-x-2">
                <h1 className="text-2xl font-bold text-green-bitcoin">
                  {t("test_connection.success")}
                </h1>
                <img src="assets/icons/star.svg" alt="image" className="w-8" />
              </div>
              <p className="mt-6 dark:text-white">
                {t("test_connection.ready")}
              </p>

              <div className="mt-6 shadow-lg p-4 rounded-xl">
                <Card
                  color="bg-gray-100"
                  alias={`${accountInfo.name} - ${accountInfo.alias}`}
                  satoshis={
                    typeof accountInfo.balance === "number"
                      ? `${accountInfo.balance} sat`
                      : ""
                  }
                />
              </div>
              <div>
                <p className="mt-8 dark:text-white">
                  {t("test_connection.tutorial")}
                </p>
                <div className="mt-8">
                  <a href="https://getalby.com/demo">
                    <Button label={t("test_connection.try_tutorial")} primary />
                  </a>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div>
              <Loading />
              <p className="text-gray-500 dark:text-white mt-6">
                {t("loading")}
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
