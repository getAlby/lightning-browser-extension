import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Button from "../../../components/button";
import Card from "../../../components/card";
import utils from "../../../../common/lib/utils";

export default function TestConnection() {
  const [accountInfo, setAccountInfo] = useState({});
  const [errorMessage, setErrorMessage] = useState();

  const history = useHistory();

  function handleEdit(event) {
    utils.call("removeAccount").then(() => {
      history.goBack();
    });
  }

  function loadAccountInfo() {
    utils
      .call("accountInfo")
      .then((response) => {
        console.log(response);
        const { alias } = response.info;
        const balance = parseInt(response.balance.balance);

        setAccountInfo({ alias, balance });
      })
      .catch((e) => {
        console.log(e);
        setErrorMessage(e.message);
      });
  }

  useEffect(() => {
    loadAccountInfo();
  }, []);

  return (
    <div>
      <div className="relative lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="relative">
          <div>
            {errorMessage && (
              <div>
                <h1 className="text-3xl font-bold">Connection Error</h1>
                <p>{errorMessage}</p>
                <Button label="Edit" onClick={handleEdit} primary />
              </div>
            )}

            {accountInfo && accountInfo.alias && (
              <div>
                <h1 className="text-3xl font-bold">Success! 🎉</h1>
                <p className="text-gray-500 mt-6">
                  Awesome, you're ready to go!
                </p>

                <div className="mt-6 shadow p-4 rounded-lg">
                  <Card
                    color="bg-green-bitcoin"
                    alias={accountInfo.alias}
                    satoshis={
                      typeof accountInfo.balance === "number"
                        ? `${accountInfo.balance} Sats`
                        : ""
                    }
                  />
                </div>
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
