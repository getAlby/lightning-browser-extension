import Button from "@components/Button";
import CloseableCard from "@components/CloseableCard";
import { Fragment } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTips } from "~/app/hooks/useTips";
import { TIPS } from "~/common/constants";

export default function Tips() {
  const { t } = useTranslation("translation", {
    keyPrefix: "discover.tips",
  });

  const navigate = useNavigate();

  const { tips, closeTip } = useTips();

  function hasTip(id: TIPS) {
    return tips.includes(id);
  }

  const tipElements = [] as JSX.Element[];

  if (hasTip(TIPS.TOP_UP_WALLET)) {
    tipElements.push(
      <CloseableCard
        key={TIPS.TOP_UP_WALLET}
        handleClose={() => closeTip(TIPS.TOP_UP_WALLET)}
        title={t("top_up_wallet.title")}
        description={t("top_up_wallet.description")}
        buttons={[
          <Button
            key={1}
            label={t("top_up_wallet.label1")}
            primary
            onClick={() => {
              navigate("/receive");
            }}
          />,
          <a
            key={2}
            href="https://getalby.com/topup"
            target="_blank"
            rel="noreferrer"
          >
            <Button label={t("top_up_wallet.label2")} />
          </a>,
        ]}
      />
    );
  }
  if (hasTip(TIPS.PIN)) {
    tipElements.push(
      <CloseableCard
        key={TIPS.PIN}
        handleClose={() => closeTip(TIPS.PIN)}
        title={t("pin.title")}
        description={[
          // eslint-disable-next-line react/jsx-key
          <Trans i18nKey={"pin.description1"} t={t}>
            <Fragment />
            <img
              src="assets/icons/puzzle.svg"
              className="w-5 inline align-bottom dark:invert"
            />
            <Fragment />
          </Trans>,
          t("pin.description2"),
          t("pin.description3"),
        ]}
      />
    );
  }

  if (hasTip(TIPS.DEMO)) {
    tipElements.push(
      <CloseableCard
        key={TIPS.DEMO}
        handleClose={() => closeTip(TIPS.DEMO)}
        title={t("demo.title")}
        description={t("demo.description")}
        buttons={[
          <a
            key={1}
            href="https://getalby.com/demo"
            target="_blank"
            rel="noreferrer"
          >
            <Button label={t("demo.label1")} primary />
          </a>,
        ]}
      />
    );
  }

  if (hasTip(TIPS.ADDRESS)) {
    tipElements.push(
      <CloseableCard
        key={TIPS.ADDRESS}
        handleClose={() => closeTip(TIPS.ADDRESS)}
        title={t("address.title")}
        description={t("address.description")}
        buttons={[
          <a key={1} href="https://getalby.com/demo">
            <Button label={t("address.label1")} primary />
          </a>,
        ]}
      />
    );
  }

  return <>{tipElements}</>;
}
