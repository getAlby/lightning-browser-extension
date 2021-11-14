import React, { useState } from "react";
import Input from "../../../components/Form/Input";
import Button from "../../../components/Button";
import { useHistory } from "react-router-dom";

import utils from "../../../../common/lib/utils";

export default function ConnectLnbits() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    adminkey: "",
    url: "https://demo.lnbits.com",
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
    const { adminkey, url } = formData;
    const account = {
      name: "LNBits",
      config: {
        adminkey,
        url,
      },
      connector: "lnbits",
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
          `Connection failed. Do you have the correct URL and Admin Key? \n\n(${validation.error})`
        );
      }
    } catch (e) {
      console.error(e);
      let message =
        "Connection failed. Do you have the correct URL and Admin Key?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      alert(message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative lg:flex mt-24">
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold dark:text-white">
            Connect to LNbits
          </h1>
          <p className="text-gray-500 mt-6"></p>
          <div className="w-4/5">
            <div className="mt-6">
              <label
                htmlFor="adminkey"
                className="block font-medium text-gray-700 dark:text-gray-400"
              >
                LNbits Admin Key
              </label>
              <div className="mt-1">
                <Input
                  name="adminkey"
                  type="text"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor="url"
                className="block font-medium text-gray-700 dark:text-gray-400"
              >
                LNbits URL
              </label>
              <div className="mt-1">
                <Input
                  name="url"
                  type="text"
                  value={formData.url}
                  required
                  onChange={handleChange}
                />
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
            <Button
              type="submit"
              label="Continue"
              primary
              loading={loading}
              disabled={formData.adminkey === "" || formData.url === ""}
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
