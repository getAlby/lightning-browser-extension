import React, { useState } from "react";
import Input from "../../../components/Form/input";
import Button from "../../../components/button";
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
          <h1 className="text-3xl font-bold mt-4">Create your password</h1>
          <p className="text-gray-500 mt-6">
            You need to set a password so we can lock the wallet when it’s not
            being used. Payments are never made without decrypting your secure
            credentials.
          </p>
          <div className="w-4/5">
            <div className="mt-6">
              <label
                htmlFor="email"
                className="block font-medium text-gray-700"
              >
                Set a password
              </label>
              <div>
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
        </div>
      </div>
      <div className="sm:py-16 sm:px-6 lg:px-8 float-right">
        <Button label="Next" type="submit" />
      </div>
    </form>
  );
}
