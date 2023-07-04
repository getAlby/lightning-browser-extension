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
      src="assets/images/unlock_passcode.png"
      alt="Unlock screen"
      className="h-44"
    />
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-xl shadow-lg rounded-xl mx-auto relative lg:flex lg:space-x-8 bg-white dark:bg-surface-02dp pt-10 pb-10 px-10">
        <div>
          <h1 className="text-2xl font-bold dark:text-white max-sm:text-center">
            {t("title")}
          </h1>

          <p className="text-gray-500 mt-4 dark:text-gray-400">
            {t("description")}
          </p>
          <div className="my-6 w-full flex justify-center">
            {unlockScreenshot}
          </div>
          <div>
            <PasswordForm
              i18nKeyPrefix="welcome.set_password"
              formData={formData}
              setFormData={setFormData}
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
          className="w-64"
        />
      </div>
    </form>
  );
}
