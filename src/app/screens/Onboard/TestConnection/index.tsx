import Button from "@components/Button";
import Loading from "@components/Loading";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";

export default function TestConnection() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation("translation", {
    keyPrefix: "welcome.test_connection",
  });

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
      if (response.name) {
        navigate("/pin-extension");
      } else {
        setErrorMessage(t("connection_error"));
      }
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
