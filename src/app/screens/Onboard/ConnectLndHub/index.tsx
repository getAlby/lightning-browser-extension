import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import utils from "../../../../common/lib/utils";

import Input from "../../../components/Form/Input";
import Button from "../../../components/Button";
import QrcodeScanner from "../../../components/QrcodeScanner";

export default function ConnectLndHub() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    uri: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const match = formData.uri.match(/lndhub:\/\/(\S+):(\S+)@(\S+)/i);
    if (!match) {
      alert("Invalid LNDHub URI");
      setLoading(false);
      return;
    }
    const login = match[1];
    const password = match[2];
    const url = match[3].replace(/\/$/, "");
    const account = {
      name: "LNDHub",
      config: {
        login,
        password,
        url,
      },
      connector: "lndhub",
    };

    try {
      const validation = await utils.call("validateAccount", account);
      if (validation.valid) {
        const addResult = await utils.call("addAccount", account);
        if (addResult.accountId) {
          await utils.call("selectAccount", {
            id: addResult.accountId,
          });
          history.push("/test-connection");
        }
      } else {
        console.log(validation);
        alert(
          `Connection failed. Is your LNDHub URI correct? \n\n(${validation.error})`
        );
      }
    } catch (e) {
      console.error(e);
      let message = "Connection failed. Is your LNDHub URI correct?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      alert(message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative mt-24 lg:flex space-x-8">
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold">Connect to LNDHub (BlueWallet)</h1>
          <p className="text-gray-500 text-sm">
            in BlueWallet, choose the wallet you want to connect, open it, click
            on "...", click on Export/Backup to display the QR code and scan it
            with your webcam
          </p>
          <div className="w-4/5">
            <div className="mt-6">
              <label
                htmlFor="login"
                className="block font-medium text-gray-700"
              >
                LNDHub Export URI
              </label>
              <div className="mt-1">
                <Input
                  name="uri"
                  type="text"
                  required
                  placeholder="lndhub://..."
                  value={formData.uri}
                  onChange={handleChange}
                />
              </div>
              <p className="text-center my-4">OR</p>
              <QrcodeScanner
                fps={10}
                qrbox={250}
                qrCodeSuccessCallback={(decodedText: string) => {
                  if (formData.uri !== decodedText) {
                    setFormData({
                      ...formData,
                      uri: decodedText,
                    });
                  }
                }}
                qrCodeErrorCallback={console.error}
              />
            </div>
          </div>
          <div className="mt-8 flex space-x-4">
            <Button
              label="Back"
              onClick={(e) => {
                e.preventDefault();
                history.goBack();
                return false;
              }}
            />
            <Button
              type="submit"
              label="Continue"
              primary
              loading={loading}
              disabled={formData.uri === ""}
            />
          </div>
        </div>
        <div className="mt-16 lg:mt-0 lg:w-1/2">
          <div className="lg:flex h-full justify-center items-center">
            <img
              src="assets/icons/satsymbol.svg"
              alt="Sats"
              className="max-w-xs"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
