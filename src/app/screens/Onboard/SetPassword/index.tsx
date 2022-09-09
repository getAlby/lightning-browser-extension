import Button from "@components/Button";
import PasswordForm from "@components/PasswordForm";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import utils from "~/common/lib/utils";

const initialFormData = {
  password: "",
  passwordConfirmation: "",
};

export default function SetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const { t } = useTranslation("translation", {
    keyPrefix: "welcome.set_password",
  });
  const { t: tCommon } = useTranslation("common");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await utils.call("setPassword", { password: formData.password });
      navigate("/choose-connector");
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        toast.error(`Error: ${e.message}`);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative mt-14 lg:flex space-x-8 bg-white dark:bg-surface-02dp py-12 px-10">
        <div className="lg:w-1/2">
          <h1 className="text-2xl font-bold dark:text-white">{t("title")}</h1>
          <p className="text-gray-500 my-6 dark:text-gray-400">
            {t("description")}
          </p>
          <div className="w-4/5 mb-6">
            <PasswordForm
              i18nKeyPrefix="welcome.set_password"
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        </div>
        <div className="mt-16 lg:mt-0 lg:w-1/2">
          <div className="lg:flex h-full justify-center items-center">
            <img
              src="assets/images/unlock_screenshot.png"
              alt="Unlock screen"
              className="w-64"
            />
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
