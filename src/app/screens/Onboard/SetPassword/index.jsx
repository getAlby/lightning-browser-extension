import React, { useState } from "react";
import Input from "../../../components/Form/Input";
import Button from "../../../components/Button";
import { useHistory } from "react-router-dom";
import utils from "../../../../common/lib/utils";

const initialFormData = Object.freeze({
  password: "",
  passwordConfirmation: "",
});

const initialErrors = Object.freeze({
  password: "",
  passwordConfirmation: "",
});

export default function SetPassword() {
  const history = useHistory();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });

    if (event.target.name === "password" && errors.password) {
      setErrors({ ...errors, password: "" });
    } else if (
      event.target.name === "passwordConfirmation" &&
      errors.passwordConfirmation &&
      formData.password === event.target.value.trim()
    ) {
      setErrors({ ...errors, passwordConfirmation: "" });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await utils.call("setPassword", { password: formData.password });
      history.push("/choose-connector");
    } catch (e) {
      console.log(e.message);
    }
  }

  function validate() {
    let password = "";
    let passwordConfirmation = "";

    if (!formData.password) password = "Please enter a password.";
    if (!formData.passwordConfirmation) {
      passwordConfirmation = "Please confirm your password.";
    } else if (formData.password !== formData.passwordConfirmation) {
      passwordConfirmation = "Passwords don't match.";
    }
    setErrors({
      password,
      passwordConfirmation,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative mt-24 lg:flex space-x-8">
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold dark:text-white">
            Protect your wallet
          </h1>
          <p className="text-gray-500 mt-6">
            Your wallet is securely encrypted with a password and needs to be
            unlocked before usage.
          </p>
          <div className="w-4/5">
            <div className="mt-6">
              <label
                htmlFor="password"
                className="block font-medium text-gray-700 dark:text-white"
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
                {errors.password && (
                  <div className="mt-1 text-red-500">{errors.password}</div>
                )}
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor="passwordConfirmation"
                className="block font-medium text-gray-700 dark:text-white"
              >
                Lets confirm you typed it correct:
              </label>
              <div className="mt-1">
                <Input
                  name="passwordConfirmation"
                  type="password"
                  required
                  onChange={handleChange}
                  onBlur={validate}
                />
                {errors.passwordConfirmation && (
                  <div className="mt-1 text-red-500">
                    {errors.passwordConfirmation}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Button
              label="Next"
              type="submit"
              primary
              disabled={
                !formData.password ||
                formData.password !== formData.passwordConfirmation
              }
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
