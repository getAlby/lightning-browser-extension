import Button from "@components/Button";
import CloseableCard from "@components/CloseableCard";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { TIPS } from "~/common/constants";

export const isAlbyAccount = (alias = "") => {
  return alias === "🐝 getalby.com";
};

export const isChrome = (): boolean => {
  return !!window.chrome;
};

export default function Tips() {
  const { t } = useTranslation("translation", {
    keyPrefix: "publishers",
  });

  const { settings, updateSetting } = useSettings();
  const { account } = useAccount();

  const navigate = useNavigate();

  const tips = settings.tips || [];

  function hasTip(id: TIPS) {
    return tips.includes(id);
  }

  const tipElements = [] as JSX.Element[];

  if (hasTip(TIPS.TOP_UP_WALLET) && isAlbyAccount(account?.alias)) {
    tipElements.push(
      <CloseableCard
        handleClose={() =>
          updateSetting({
            tips: tips.filter((tip) => tip !== TIPS.TOP_UP_WALLET),
          })
        }
        title={t("tips.top_up_wallet.title")}
        description={t("tips.top_up_wallet.description")}
        buttons={[
          <Button
            key={1}
            label={t("tips.top_up_wallet.label1")}
            primary
            onClick={() => {
              navigate("/receive");
            }}
          />,
          <a key={2} href="https://getalby.com/topup">
            <Button label={t("tips.top_up_wallet.label2")} />
          </a>,
        ]}
      />
    );
  }
  if (hasTip(TIPS.PIN) && isChrome()) {
    tipElements.push(
      <CloseableCard
        handleClose={() =>
          updateSetting({
            tips: tips.filter((tip) => tip !== TIPS.PIN),
          })
        }
        title={t("tips.pin.title")}
        description={[
          t("tips.pin.description1"),
          t("tips.pin.description2"),
          t("tips.pin.description3"),
        ]}
      />
    );
  }

  if (hasTip(TIPS.DEMO)) {
    tipElements.push(
      <CloseableCard
        handleClose={() =>
          updateSetting({
            tips: tips.filter((tip) => tip !== TIPS.DEMO),
          })
        }
        title={t("tips.demo.title")}
        description={t("tips.demo.description")}
        buttons={[
          <a key={1} href="https://getalby.com/demo">
            <Button label={t("tips.demo.label1")} primary />
          </a>,
        ]}
      />
    );
  }

  if (hasTip(TIPS.ADDRESS)) {
    tipElements.push(
      <CloseableCard
        handleClose={() =>
          updateSetting({
            tips: tips.filter((tip) => tip !== TIPS.ADDRESS),
          })
        }
        title={t("tips.address.title")}
        description={t("tips.address.description")}
        buttons={[
          <a key={1} href="https://getalby.com/demo">
            <Button label={t("tips.address.label1")} primary />
          </a>,
        ]}
      />
    );
  }

  return <>{tipElements}</>;
}
