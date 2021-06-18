import React, { useState } from "react";
import Input from "../../../components/Form/input";
import Button from "../../../components/button";
import { useHistory } from "react-router-dom";
import { encryptData } from "../../../../common/lib/crypto";
import Accounts from "../../../../common/lib/accounts";
import Allowances from "../../../../common/lib/allowances";
import Settings from "../../../../common/lib/settings";

const initialFormData = Object.freeze({
  password: "",
  passwordConfirmation: "",
});

const accounts = new Accounts();
const settings = new Settings();
const allowances = new Allowances();

export default function SetPassword() {
  const history = useHistory();
  const [formData, setFormData] = useState(initialFormData);

  function createAccount(password) {
    return Promise.all([
      accounts.reset(),
      allowances.reset(),
      settings.reset(),
    ]).then(() => {
      const account = {
        name: "LND-DEV",
        config: {
          macaroon:
            "0201036C6E6402F801030A10A20DB3BCABE52F0186FAFB6CD5A79FED1201301A160A0761646472657373120472656164120577726974651A130A04696E666F120472656164120577726974651A170A08696E766F69636573120472656164120577726974651A210A086D616361726F6F6E120867656E6572617465120472656164120577726974651A160A076D657373616765120472656164120577726974651A170A086F6666636861696E120472656164120577726974651A160A076F6E636861696E120472656164120577726974651A140A057065657273120472656164120577726974651A180A067369676E6572120867656E657261746512047265616400000620AE1050A1B1EDA68D723F2AE0EC4561552E1F2507EFB552F86C3D7DE708BC7E1A",
          url: "https://regtest-bob.nomadiclabs.net",
        },
        connector: "lnd",
      };
      account.config = encryptData(account.config, password, settings.salt);
      return accounts.setAccount(account, true).then(() => {
        alert(`Test account is saved. Your password is: ${password}`);
      });
    });
  }

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function handleSubmit(event) {
    const { password, passwordConfirmation } = formData;
    if (password !== passwordConfirmation) {
      alert("Passwords don't match.");
    } else {
      createAccount(password).then(() => {
        history.push("/connect-lnd");
      });
    }
    event.preventDefault();
  }

  return (
    <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8">
      <div className="relative">
        <div className="h-32">
          <img className="mb-12" src="https://i.ibb.co/3F3mCkR/logox.png" />
        </div>
        <h1 className="text-3xl font-bold mt-4">Secure the bag!</h1>
        <p className="text-base text-gray-500 mt-6">
          You need to set a password so we can lock the wallet when it’s not
          being used. The browser is not the most secure environment and access
          to your node needs to be kept private when not in use.
        </p>
        <p className="text-base text-orange-bitcoin mt-2">
          Check out this guides.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="w-4/5">
            <div className="mt-6">
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700"
              >
                Set a password
              </label>
              <div>
                <Input
                  name="password"
                  type="password"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700"
              >
                Lets confirm you typed it correct.
              </label>
              <div className="mt-1">
                <Input
                  name="passwordConfirmation"
                  type="password"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 w-2/5">
            <Button label="Let's GOO!" type="submit" />
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
