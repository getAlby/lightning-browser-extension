import Features from "./features";
import Button from "@components/Button";
import {
  CodeIcon,
  KeyIcon,
  LightningIcon,
  ShieldIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { useNavigate } from "react-router-dom";
import i18n from "~/i18n/i18nConfig";
import { useTranslation } from "react-i18next";

const features = [
  {
    name: i18n.t("welcome.intro.send"),
    description: i18n.t("welcome.intro.send_description"),
    icon: LightningIcon,
  },
  {
    name: i18n.t("welcome.intro.paywall"),
    description: i18n.t("welcome.intro.paywall_description"),
    icon: KeyIcon,
  },
  {
    name: i18n.t("welcome.intro.privacy"),
    description: i18n.t("welcome.intro.privacy_description"),
    icon: ShieldIcon,
  },
  {
    name: i18n.t("welcome.intro.foss"),
    description: i18n.t("welcome.intro.foss_description"),
    icon: CodeIcon,
  },
];

export default function Intro() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div>
      <div className="relative lg:grid lg:grid-cols-3 lg:gap-x-8 mt-14 bg-white dark:bg-surface-02dp px-10 py-12 items-center">
        <div className="lg:col-span-1">
          <div className="max-w-xs">
            <img src="assets/icons/satsymbol.svg" alt="sat" className="w-64" />
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
          label={t("welcome.intro.actions.get_started")}
          primary
        />
      </div>
    </div>
  );
}
