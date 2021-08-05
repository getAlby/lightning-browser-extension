import React, { useState } from "react";
import Input from "../../../components/Form/input";
import Button from "../../../components/button";
import { useHistory } from "react-router-dom";

import utils from "../../../../common/lib/utils";

export default function ConnectLnbits() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    readkey: "",
    adminkey: "",
    url: "https://lnbits.com",
  });

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const { readkey, adminkey, url } = formData;
    const account = {
      name: "LNBits",
      config: {
        readkey,
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
      <div className="relative lg:grid lg:grid-cols-3 lg:gap-x-8 mt-20">
        <div className="lg:col-span-1 ml-12 mt-8">
          <div className="h-32 max-w-xs">
            <img
              src="assets/icons/satsymbol.svg"
              alt="Sats"
              className="max-w-xs"
            />
          </div>
          <h2 className="mt-10 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            The power of lightning in your browser
          </h2>
        </div>
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mt-4">Connect to LNbits</h1>
          <p className="text-gray-500 mt-6"></p>
          <div className="w-4/5">
            <div className="mt-6">
              <label
                htmlFor="readkey"
                className="block font-medium text-gray-700"
              >
                LNbits Read Key
              </label>
              <div>
                <Input
                  name="readkey"
                  type="text"
                  required
                  autoFocus
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor="adminkey"
                className="block font-medium text-gray-700"
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
              <label htmlFor="url" className="block font-medium text-gray-700">
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
        </div>
      </div>
      <div className="sm:py-16 sm:px-6 lg:px-8 float-right">
        <Button label="Next" type="submit" />
      </div>
    </form>
  );
}
