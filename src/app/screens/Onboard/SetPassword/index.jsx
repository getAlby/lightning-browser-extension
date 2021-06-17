import React from "react";
import Input from "../../../components/Shared/input";
import Button from "../../../components/Shared/button";
import { useHistory } from "react-router-dom";

export default function SetPassword() {
  const history = useHistory();

  return (
    <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
      <div className="relative">
        <img className="mb-12" src="https://i.ibb.co/3F3mCkR/logox.png" />
        <h1 className="text-3xl font-bold mt-4">Secure the bag!</h1>
        <p className="text-base text-gray-500 mt-6">
          You need to set a password so we can lock the wallet when it’s not
          being used. The browser is not the most secure environment and access
          to your node needs to be kept private when not in use.
        </p>
        <p className="text-base text-orange-bitcoin mt-2">
          Check out this guides.
        </p>
        <div className="w-4/5">
          <div className="mt-6">
            <label
              htmlFor="email"
              className="block text-base font-medium text-gray-700"
            >
              Set a password
            </label>
            <div>
              <Input />
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
              <Input />
            </div>
          </div>
        </div>
        <div className="mt-8 w-2/5">
          <Button
            onClick={() => history.push("/connect-lnd")}
            label="Let's GOO!"
          />
        </div>
      </div>

      <div className="mt-10 -mx-4 relative lg:mt-0" aria-hidden="true">
        <img src="https://i.ibb.co/QfF1PP6/Frame-20.png" />
      </div>
    </div>
  );
}
