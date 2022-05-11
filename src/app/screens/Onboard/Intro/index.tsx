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

const namespaceI18n = { ns: "welcome" };

const features = [
  {
    name: i18n.t("intro.send", namespaceI18n),
    description: i18n.t("intro.send_desc", namespaceI18n),
    icon: LightningIcon,
  },
  {
    name: i18n.t("intro.paywall", namespaceI18n),
    description: i18n.t("intro.paywall_desc", namespaceI18n),
    icon: KeyIcon,
  },
  {
    name: i18n.t("intro.privacy", namespaceI18n),
    description: i18n.t("intro.privacy_desc", namespaceI18n),
    icon: ShieldIcon,
  },
  {
    name: i18n.t("intro.foss", namespaceI18n),
    description: i18n.t("intro.foss_desc", namespaceI18n),
    icon: CodeIcon,
  },
];

export default function Intro() {
  const navigate = useNavigate();

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
          label={i18n.t("intro.get_started", namespaceI18n)}
          primary
        />
      </div>
    </div>
  );
}
