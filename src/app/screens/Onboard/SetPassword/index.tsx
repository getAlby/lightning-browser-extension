import Button from "@components/Button";
import PasswordForm from "@components/PasswordForm";
import {
  PopiconsCircleExclamationLine,
  PopiconsLockOpenLine,
} from "@popicons/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "~/app/components/Toast";
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
    <img src="assets/images/unlock_passcode.png" alt="Unlock screen" />
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-xl rounded-2xl mx-auto relative lg:flex lg:space-x-8 bg-white dark:bg-surface-02dp pt-10 pb-10 px-10 border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-center">
            {t("title")}
          </h1>

          <div className="w-full flex justify-center my-8 short:hidden">
            {unlockScreenshot}
          </div>

          <div className="flex flex-row text-gray-500 my-4 dark:text-gray-400">
            <PopiconsLockOpenLine className="w-6 h-6 mr-2"></PopiconsLockOpenLine>
            {t("description1")}
          </div>
          <div className="flex flex-row text-gray-500 my-4 dark:text-gray-400">
            <PopiconsCircleExclamationLine className="w-6 h-6 mr-2"></PopiconsCircleExclamationLine>
            {t("description2")}
          </div>

          <div>
            <PasswordForm
              i18nKeyPrefix="welcome.set_password"
              formData={formData}
              setFormData={setFormData}
            />
          </div>
          <div className="mt-8 flex justify-center">
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
        </div>
      </div>
    </form>
  );
}
