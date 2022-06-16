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
import { welcomeI18nNamespace } from "~/i18n/namespaces";
import Features from "./features";

function getFeatures() {
  return [
    {
      name: i18n.t("intro.send", welcomeI18nNamespace),
      description: i18n.t("intro.send_description", welcomeI18nNamespace),
      icon: LightningIcon,
    },
    {
      name: i18n.t("intro.paywall", welcomeI18nNamespace),
      description: i18n.t("intro.paywall_description", welcomeI18nNamespace),
      icon: KeyIcon,
    },
    {
      name: i18n.t("intro.privacy", welcomeI18nNamespace),
      description: i18n.t("intro.privacy_description", welcomeI18nNamespace),
      icon: ShieldIcon,
    },
    {
      name: i18n.t("intro.foss", welcomeI18nNamespace),
      description: i18n.t("intro.foss_description", welcomeI18nNamespace),
      icon: CodeIcon,
    },
  ];
}

let features = getFeatures();

export default function Intro() {
  const navigate = useNavigate();
  const { t } = useTranslation(["welcome"]);

  i18n.on("languageChanged", () => {
    features = getFeatures();
  });

  return (
    <div>
      <div className="relative lg:grid lg:grid-cols-3 lg:gap-x-8 mt-14 bg-white dark:bg-surface-02dp px-10 py-12 items-center">
        <div className="lg:col-span-1">
          <div className="max-w-xs">
            <img src="assets/icons/satsymbol.svg" alt="sats" className="w-64" />
          </div>
        </div>
        <div className="mt-10 lg:mt-0 lg:col-span-2">
          <Features features={features} />
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <Button
          onClick={() => navigate("/set-password")}
          type="button"
          label={t("intro.actions.get_started")}
          primary
        />
      </div>
    </div>
  );
}
