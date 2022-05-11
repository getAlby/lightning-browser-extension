import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@components/Button";
import Card from "@components/Card";
import utils from "~/common/lib/utils";
import api from "~/common/lib/api";
import Loading from "@components/Loading";

export default function TestConnection() {
  const [accountInfo, setAccountInfo] = useState<{
    alias: string;
    name: string;
    balance: number;
  }>();
  const [errorMessage, setErrorMessage] = useState();
  const [loading, setLoading] = useState(false);

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
                Connection Error
              </h1>
              <p className="dark:text-gray-500">{errorMessage}</p>
              <Button label="Edit" onClick={handleEdit} primary />
            </div>
          )}

          {accountInfo && accountInfo.alias && (
            <div>
              <div className="flex space-x-2">
                <h1 className="text-2xl font-bold text-green-bitcoin">
                  Success!
                </h1>
                <img src="assets/icons/star.svg" alt="image" className="w-8" />
              </div>
              <p className="mt-6 dark:text-white">
                Awesome, you&apos;re ready to go!
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
                  Now you’ve connected your node would you like to go through a
                  tutorial?
                </p>
                <div className="mt-8">
                  <a href="https://getalby.com/demo">
                    <Button label="Give it a try now" primary />
                  </a>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div>
              <Loading />
              <p className="text-gray-500 dark:text-white mt-6">
                Initializing your account. Please wait, this can take a
                minute...
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
