import React, { useState } from "react";
import Input from "../../../components/Form/input";
import Button from "../../../components/button";
import { useHistory } from "react-router-dom";

import utils from "../../../../common/lib/utils";

export default function ConnectLndHub() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    uri: "",
  });

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const match = formData.uri.match(/lndhub:\/\/(\S+):(\S+)@(\S+)/i);
    if (!match) {
      alert("Invalid LNDHub URI");
      return;
    }
    const login = match[1];
    const password = match[2];
    const url = match[3];
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
          const selectResult = await utils.call("selectAccount", {
            id: addResult.accountId,
          });
          history.push("/test-connection");
        }
      } else {
        console.log(validation);
        alert(`Connection failed (${validation.error})`);
      }
    } catch (e) {
      console.log(e.message);
      alert(`Connection failed (${e.message})`);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative mt-24 lg:flex space-x-8">
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold">Connect to LNDHub (BlueWallet)</h1>
          <p className="text-gray-500 mt-6"></p>
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
                  onChange={handleChange}
                />
                <small>
                  BlueWallet users find the Backup/Export URI in the lightning
                  wallet settings.
                </small>
              </div>
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
            <Button type="submit" label="Continue" primary />
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
