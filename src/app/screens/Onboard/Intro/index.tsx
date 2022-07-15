import {
  CodeIcon,
  KeyIcon,
  LightningIcon,
  ShieldIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import i18n from "~/i18n/i18nConfig";
import { translationI18nNamespace } from "~/i18n/namespaces";

import Features from "./features";

function getFeatures() {
  return [
    {
      name: i18n.t("welcome.intro.send", translationI18nNamespace),
      description: i18n.t(
        "welcome.intro.send_description",
        translationI18nNamespace
      ),
      icon: LightningIcon,
    },
    {
      name: i18n.t("welcome.intro.paywall", translationI18nNamespace),
      description: i18n.t(
        "welcome.intro.paywall_description",
        translationI18nNamespace
      ),
      icon: KeyIcon,
    },
    {
      name: i18n.t("welcome.intro.privacy", translationI18nNamespace),
      description: i18n.t(
        "welcome.intro.privacy_description",
        translationI18nNamespace
      ),
      icon: ShieldIcon,
    },
    {
      name: i18n.t("welcome.intro.foss", translationI18nNamespace),
      description: i18n.t(
        "welcome.intro.foss_description",
        translationI18nNamespace
      ),
      icon: CodeIcon,
    },
  ];
}

let features = getFeatures();

export default function Intro() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  i18n.on("languageChanged", () => {
    features = getFeatures();
  });

  return (
    <div>
      <div className="relative lg:grid lg:grid-cols-3 lg:gap-x-8 mt-14 bg-white dark:bg-surface-02dp px-10 py-12 items-center">
        <div className="lg:col-span-1">
          <div className="max-w-xs mx-auto">
            <img
              src="assets/icons/alby_logo.svg"
              alt="Alby"
              className="block dark:hidden w-64"
            />
            <img
              src="assets/icons/alby_logo_dark.svg"
              alt="Alby"
              className="hidden dark:block w-64"
            />
          </div>
        </div>
        <div className="mt-10 lg:mt-0 lg:col-span-2">
          <Features features={features} />
        </div>
      </div>
      <div className="my-8 flex justify-center">
        <Button
          onClick={() => navigate("/set-password")}
          type="button"
          label={t("welcome.intro.actions.get_started")}
          primary
        />
      </div>
    </div>
  );
}
