import React, { useState } from "react";
import Input from "../../../components/Form/input";
import Button from "../../../components/button";
import { useHistory } from "react-router-dom";

import utils from "../../../../common/lib/utils";

const initialFormData = Object.freeze({
  url: "https://regtest-bob.nomadiclabs.net",
  macaroon:
    "0201036C6E6402F801030A10A20DB3BCABE52F0186FAFB6CD5A79FED1201301A160A0761646472657373120472656164120577726974651A130A04696E666F120472656164120577726974651A170A08696E766F69636573120472656164120577726974651A210A086D616361726F6F6E120867656E6572617465120472656164120577726974651A160A076D657373616765120472656164120577726974651A170A086F6666636861696E120472656164120577726974651A160A076F6E636861696E120472656164120577726974651A140A057065657273120472656164120577726974651A180A067369676E6572120867656E657261746512047265616400000620AE1050A1B1EDA68D723F2AE0EC4561552E1F2507EFB552F86C3D7DE708BC7E1A",
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
        <p className="text-base text-gray-500 mt-6">
          You will need to retreive the node url and an admin macaroon. Not sure
          where to find these details?
        </p>
        <p className="text-base text-orange-bitcoin mt-2">
          Check out this guides.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="w-4/5">
            <div className="mt-6">
              <label className="block text-base font-medium text-gray-700">
                Address
              </label>
              <div>
                <Input name="url" onChange={handleChange} required />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-base font-medium text-gray-700">
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
