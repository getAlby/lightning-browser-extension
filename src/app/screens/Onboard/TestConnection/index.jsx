import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import Modal from "react-modal";
import CrossIcon from "@bitcoin-design/bitcoin-icons/svg/outline/cross.svg";
import Input from "../../../components/Form/Input";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import utils from "../../../../common/lib/utils";
import Loading from "../../../components/Loading";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

const faucetURL = process.env.FAUCET_URL;
const faucetK = process.env.FAUCET_K;
const faucetAmount = 210;
const faucetMemo = "LN Faucet";

export default function TestConnection() {
  const [accountInfo, setAccountInfo] = useState({});
  const [errorMessage, setErrorMessage] = useState();
  const [faucetEmail, setFaucetEmail] = useState();
  const [showFaucet, setShowFaucet] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  function handleEdit(event) {
    utils.call("removeAccount").then(() => {
      history.goBack();
    });
  }

  function handleEmailChange(event) {
    setFaucetEmail(event.target.value.trim());
  }

  function closeFaucet() {
    setShowFaucet(false);
  }

  function claimSats(event) {
    event.preventDefault();
    setFaucetLoading(true);
    utils
      .call("makeInvoice", { amount: faucetAmount, memo: faucetMemo })
      .then((invoice) => {
        axios
          .post(faucetURL, {
            k: faucetK,
            payment_request: invoice.paymentRequest,
            email: faucetEmail,
          })
          .then((response) => {
            if (response.data.ok) {
              loadAccountInfo();
              alert(`We've sent you ${faucetAmount} Satoshi`);
              setFaucetLoading(false);
              setShowFaucet(false);
            }
          })
          .catch((r) => {
            console.log(r.response);
            if (r.response && r.response.data) {
              alert(r.response.data.error);
            } else {
              alert("An error ocurred. Did you already use the faucet?");
            }
          });
      });
  }

  function loadAccountInfo() {
    setLoading(true);
    utils
      .call("accountInfo")
      .then((response) => {
        const { alias } = response.info;
        const balance = parseInt(response.balance.balance);

        setAccountInfo({ alias, balance });
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

  function renderFaucet() {
    return (
      <Modal
        closeTimeoutMS={200}
        isOpen={showFaucet}
        onRequestClose={closeFaucet}
        contentLabel="Allowance Options"
        style={customStyles}
        overlayClassName="bg-black bg-opacity-25 fixed inset-0"
        className="absolute rounded-lg bg-white w-full max-w-lg"
      >
        <div className="p-5 flex justify-between">
          <h2 className="text-2xl font-bold">Get some Satoshi</h2>
          <button onClick={closeFaucet}>
            <img
              className="w-6 h-6"
              src={CrossIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>
        <div className="p-5 border-t border-b border-gray-200">
          <p className="mb-2">
            To get started we send {faucetAmount} Satoshi to your wallet.
            <br />
            Please provide your email. We will notify you of updates (don't
            worry, we also hate spam)
          </p>
          <div className="w-60">
            <Input
              name="uri"
              type="text"
              onChange={handleEmailChange}
              required
              placeholder="you@email.com"
            />
          </div>
        </div>
        <div className="flex justify-end p-5">
          {faucetLoading ? (
            <Loading />
          ) : (
            <Button onClick={claimSats} label="Get Sats" primary />
          )}
        </div>
      </Modal>
    );
  }

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
                <div>
                  {faucetURL && accountInfo.balance === 0 && (
                    <div className="text-gray-500">
                      You're wallet is currently empty. &nbsp;
                      <a
                        href="#"
                        className="underline"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowFaucet(true);
                        }}
                      >
                        To get started we can send you some Sats...
                      </a>
                      {renderFaucet()}
                    </div>
                  )}
                </div>

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
                <div>
                  <p className="text-gray-500 mt-8">
                    Now you’ve connected your node would you like to go through
                    a tutorial?
                  </p>

                  <div className="mt-8">
                    <a href="https://getalby.com/demo">
                      <Button label="Give it a try now" primary />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {loading && <Loading />}
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
