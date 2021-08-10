import React, { useState } from "react";
import Input from "../../../components/Form/input";
import Button from "../../../components/button";
import { useHistory } from "react-router-dom";

import utils from "../../../../common/lib/utils";

const initialFormData = Object.freeze({
  url: "",
  macaroon: "",
});

export default function ConnectLnd() {
  const history = useHistory();
  const [formData, setFormData] = useState(initialFormData);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const { url, macaroon } = formData;
    const account = {
      name: "LND",
      config: {
        macaroon,
        url,
      },
      connector: "lnd",
    };

    try {
      const addResult = await utils.call("addAccount", account);
      console.log(addResult);
      if (addResult.accountId) {
        const selectResult = await utils.call("selectAccount", {
          id: addResult.accountId,
        });
        history.push("/test-connection");
      }
    } catch (e) {
      // TODO: do something with the error, for e.g. display the message to the user.
      console.log(e.message);
    }
  }

  return (
    <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8">
      <div className="relative">
        <div className="h-32">
          <img className="mb-12" src="https://i.ibb.co/3F3mCkR/logox.png" />
        </div>
        <h1 className="text-3xl font-bold mt-4">Connect to your remote node</h1>
        <p className="text-gray-500 mt-6">
          You will need to retreive the node url and an admin macaroon. Not sure
          where to find these details?
        </p>
        <p className="text-orange-bitcoin mt-2">Check out this guides.</p>
        <form onSubmit={handleSubmit}>
          <div className="w-4/5">
            <div className="mt-6">
              <label className="block font-medium text-gray-700">Address</label>
              <div>
                <Input
                  name="url"
                  placeholder="https://"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block font-medium text-gray-700">
                Macaroon
              </label>
              <div className="mt-1">
                <Input name="macaroon" onChange={handleChange} required />
              </div>
            </div>
          </div>
          <div className="mt-8 w-2/5">
            <Button type="submit" label="Continue" />
          </div>
        </form>
      </div>

      <div
        className="mt-10 -mx-4 relative lg:mt-0 lg:flex lg:items-center"
        aria-hidden="true"
      >
        <img src="https://i.ibb.co/QfF1PP6/Frame-20.png" />
      </div>
    </div>
  );
}
