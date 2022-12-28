import Button from "@components/Button";
import CloseableCard from "@components/CloseableCard";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTips } from "~/app/hooks/useTips";
import { TIPS } from "~/common/constants";

export default function Tips() {
  const { t } = useTranslation("translation", {
    keyPrefix: "publishers",
  });

  const navigate = useNavigate();

  const { tips, filterTip } = useTips();

  function hasTip(id: TIPS) {
    return tips.includes(id);
  }

  const tipElements = [] as JSX.Element[];

  if (hasTip(TIPS.TOP_UP_WALLET)) {
    tipElements.push(
      <CloseableCard
        key={TIPS.TOP_UP_WALLET}
        handleClose={() => filterTip(TIPS.TOP_UP_WALLET)}
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
  if (hasTip(TIPS.PIN)) {
    tipElements.push(
      <CloseableCard
        key={TIPS.PIN}
        handleClose={() => filterTip(TIPS.PIN)}
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
        key={TIPS.DEMO}
        handleClose={() => filterTip(TIPS.DEMO)}
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
        key={TIPS.ADDRESS}
        handleClose={() => filterTip(TIPS.ADDRESS)}
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
