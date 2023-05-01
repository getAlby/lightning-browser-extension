import Button from "@components/Button";
import PasswordForm from "@components/PasswordForm";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import msg from "~/common/lib/msg";

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
      await msg.request("setPassword", { password: formData.password });
      navigate("/choose-path");
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        toast.error(`Error: ${e.message}`);
      }
    }
  }

  const unlockScreenshot = (
    <img
      src="assets/images/unlock_screenshot.png"
      alt="Unlock screen"
      className="w-64"
    />
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative shadow-lg rounded-xl mt-14 lg:flex lg:space-x-8 bg-white dark:bg-surface-02dp pt-12 pb-4 lg:py-12 px-10">
        <div className="lg:w-1/2">
          <h1 className="text-2xl font-bold dark:text-white max-sm:text-center">
            {t("title")}
          </h1>
          <div className="lg:hidden mt-4 w-full flex justify-center">
            {unlockScreenshot}
          </div>
          <p className="text-gray-500 my-6 dark:text-gray-400">
            {t("description")}
          </p>
          <div className="lg:w-4/5 mb-6">
            <PasswordForm
              i18nKeyPrefix="welcome.set_password"
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        </div>
        <div className="hidden lg:flex w-1/2 justify-center items-center self-center">
          {unlockScreenshot}
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
          className="max-sm:w-full"
        />
      </div>
    </form>
  );
}
