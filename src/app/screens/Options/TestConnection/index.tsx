import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import utils from "../../../../common/lib/utils";
import api from "../../../../common/lib/api";
import { useAuth } from "../../../context/AuthContext";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import Loading from "../../../components/Loading";

export default function TestConnection() {
  const auth = useAuth();
  const [accountInfo, setAccountInfo] =
    useState<{ alias: string; balance: number }>();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleEdit(event: React.MouseEvent<HTMLButtonElement>) {
    utils.call("removeAccount").then(() => {
      navigate(-1);
    });
  }

  async function loadAccountInfo() {
    setLoading(true);
    api
      .getAccountInfo()
      .then(async (response) => {
        const { alias } = response.info;
        const balance = parseInt(response.balance.balance);
        setAccountInfo({ alias, balance });

        // Update AuthContext so the app is aware of the new active account.
        const { currentAccountId } = await api.getStatus();
        auth.setAccountId(currentAccountId);
        auth.fetchAccountInfo(currentAccountId);
      })
      .catch((e) => {
        console.log(e);
        setErrorMessage(e.message);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAccountInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="relative lg:mt-14 lg:grid lg:grid-cols-2 lg:gap-8 bg-white dark:bg-gray-800 px-10 py-12">
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
                  <img
                    src="assets/icons/star.svg"
                    alt="image"
                    className="w-8"
                  />
                </div>

                <p className="mt-6 dark:text-gray-400">
                  Awesome, you&apos;re ready to go!
                </p>

                <div className="mt-6 shadow-lg p-4 rounded-xl">
                  <Card
                    color="bg-gray-100"
                    alias={accountInfo.alias}
                    satoshis={
                      typeof accountInfo.balance === "number"
                        ? `${accountInfo.balance} sat`
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
                  Initializing your account. Please wait, this can take a minute
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
