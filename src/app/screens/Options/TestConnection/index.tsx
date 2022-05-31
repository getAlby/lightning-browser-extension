import Button from "@components/Button";
import Card from "@components/Card";
import Loading from "@components/Loading";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccounts } from "~/app/context/AccountsContext";
import { useAuth } from "~/app/context/AuthContext";
import api from "~/common/lib/api";
import utils from "~/common/lib/utils";

export default function TestConnection() {
  const auth = useAuth();
  const { getAccounts } = useAccounts();
  const [accountInfo, setAccountInfo] = useState<{
    alias: string;
    name: string;
    balance: number;
  }>();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleEdit(event: React.MouseEvent<HTMLButtonElement>) {
    utils.call("deleteAccount").then(() => {
      navigate(-1);
    });
  }

  async function loadAccountInfo() {
    setLoading(true);
    // show an error message after 45 seconds. Then probably something is wrong
    const timer = setTimeout(() => {
      setErrorMessage(
        "Trying to connect takes longer than expected... Are your details correct? Is your node reachable?"
      );
    }, 45000);
    try {
      const { currentAccountId } = await api.getStatus();
      auth.setAccountId(currentAccountId);
      const accountInfo = await auth.fetchAccountInfo(currentAccountId);
      if (accountInfo) {
        setAccountInfo({
          alias: accountInfo.alias,
          balance: accountInfo.balance,
          name: accountInfo.name,
        });
      }
      getAccounts();
    } catch (e) {
      console.log(e);
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
      <div className="relative lg:mt-14 lg:grid lg:grid-cols-2 lg:gap-8 bg-white dark:bg-surface-02dp px-10 py-12">
        <div className="relative">
          <div>
            {errorMessage && (
              <div>
                <h1 className="text-3xl font-bold dark:text-white">
                  Connection Error
                </h1>
                <p className="text-gray-500 dark:text-white">
                  Please review your connection details.
                </p>

                <p className="text-gray-500 dark:text-grey-500 mt-4 mb-4">
                  <i>{errorMessage}</i>
                </p>

                <Button
                  label="Delete invalid account and edit again"
                  onClick={handleEdit}
                  primary
                />
                <p className="text-gray-500 dark:text-white">
                  If you need help please contact support@getalby.com
                </p>
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
                    alias={`${accountInfo.name} - ${accountInfo.alias}`}
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
                  Initializing your account. <br />
                  Please wait, this can take a minute
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
