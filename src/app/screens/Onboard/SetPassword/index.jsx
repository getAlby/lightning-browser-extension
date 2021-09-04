import React, { useState } from "react";
import Input from "../../../components/Form/Input";
import Button from "../../../components/Button";
import { useHistory } from "react-router-dom";
import utils from "../../../../common/lib/utils";

const initialFormData = Object.freeze({
  password: "",
  passwordConfirmation: "",
});

export default function SetPassword() {
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
    const { password, passwordConfirmation } = formData;
    if (password !== passwordConfirmation) {
      alert("Passwords don't match.");
    } else {
      try {
        await utils.call("setPassword", { password });
        history.push("/choose-connector");
      } catch (e) {
        console.log(e.message);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative mt-24 lg:flex space-x-8">
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold">Protect your wallet</h1>
          <p className="text-gray-500 mt-6">
            Your wallet is securely encrypted with a password and needs to be
            unlocked before usage.
          </p>
          <div className="w-4/5">
            <div className="mt-6">
              <label
                htmlFor="email"
                className="block font-medium text-gray-700"
              >
                Choose a password:
              </label>
              <div className="mt-1">
                <Input
                  name="password"
                  type="password"
                  autoFocus
                  required
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor="email"
                className="block font-medium text-gray-700"
              >
                Lets confirm you typed it correct:
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
          <div className="mt-8">
            <Button label="Next" type="submit" primary />
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
