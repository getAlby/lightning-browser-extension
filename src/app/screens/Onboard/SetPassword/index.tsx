import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import Button from "@components/Button";
import TextField from "@components/form/TextField";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import utils from "~/common/lib/utils";

const initialFormData = {
  password: "",
  passwordConfirmation: "",
};

const initialErrors = {
  password: "",
  passwordConfirmation: "",
};

export default function SetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const [passwordView, setPasswordView] = useState(false);
  const [passwordConfirmationView, setPasswordConfirmationView] =
    useState(false);
  const { t } = useTranslation("translation", {
    keyPrefix: "welcome.set_password",
  });
  const { t: tCommon } = useTranslation("common");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await utils.call("setPassword", { password: formData.password });
      navigate("/choose-connector");
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
    }
  }

  function validate() {
    let password = "";
    let passwordConfirmation = "";

    if (!formData.password) password = t("enter_password");
    if (!formData.passwordConfirmation) {
      passwordConfirmation = t("confirm_password");
    } else if (formData.password !== formData.passwordConfirmation) {
      passwordConfirmation = t("mismatched_password");
    }
    setErrors({
      password,
      passwordConfirmation,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative mt-14 lg:flex space-x-8 bg-white dark:bg-surface-02dp py-12 px-10">
        <div className="lg:w-1/2">
          <h1 className="text-2xl font-bold dark:text-white">{t("title")}</h1>
          <p className="text-gray-500 mt-6 dark:text-gray-400">
            {t("description")}
          </p>
          <div className="w-4/5">
            <div className="mt-6">
              <TextField
                id="password"
                label={t("choose_password_label")}
                type={passwordView ? "text" : "password"}
                autoFocus
                required
                onChange={handleChange}
                endAdornment={
                  <button
                    type="button"
                    className="mr-1 flex justify-center items-center w-10 h-8"
                    onClick={() => setPasswordView(!passwordView)}
                  >
                    {passwordView ? (
                      <HiddenIcon className="h-6 w-6" />
                    ) : (
                      <VisibleIcon className="h-6 w-6" />
                    )}
                  </button>
                }
              />
              {errors.password && (
                <div className="mt-1 text-red-500">{errors.password}</div>
              )}
            </div>
            <div className="mt-6">
              <TextField
                id="passwordConfirmation"
                label={t("confirm_password_label")}
                type={passwordConfirmationView ? "text" : "password"}
                required
                onChange={handleChange}
                onBlur={validate}
                endAdornment={
                  <button
                    type="button"
                    className="mr-1 flex justify-center items-center w-10 h-8"
                    onClick={() =>
                      setPasswordConfirmationView(!passwordConfirmationView)
                    }
                  >
                    {passwordConfirmationView ? (
                      <HiddenIcon className="h-6 w-6" />
                    ) : (
                      <VisibleIcon className="h-6 w-6" />
                    )}
                  </button>
                }
              />
              {errors.passwordConfirmation && (
                <div className="mt-1 text-red-500">
                  {errors.passwordConfirmation}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-16 lg:mt-0 lg:w-1/2">
          <div className="lg:flex h-full justify-center items-center">
            <img src="assets/icons/satsymbol.svg" alt="sats" className="w-64" />
          </div>
        </div>
      </div>
      <div className="my-8 flex justify-center">
        <Button
          label={tCommon("actions.next")}
          type="submit"
          primary
          disabled={
            !formData.password ||
            formData.password !== formData.passwordConfirmation
          }
        />
      </div>
    </form>
  );
}
