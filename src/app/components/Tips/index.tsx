import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
import TipCard from "~/app/components/TipCard";
import { useAccount } from "~/app/context/AccountContext";
import { useTips } from "~/app/hooks/useTips";
import BuyBitcoinTipCardIcon from "~/app/icons/BuyBitcoinTipCardIcon";
import DemoTipCardIcon from "~/app/icons/DemoTipCardIcon";
import MnemonicTipCardIcon from "~/app/icons/MnemonicTipCardIcon";
import { classNames } from "~/app/utils";
import { TIPS } from "~/common/constants";

export default function Tips() {
  const { t } = useTranslation("translation", {
    keyPrefix: "discover.tips",
  });
  const accountContext = useAccount();
  const accountId = accountContext?.account?.id;

  const tipCardConfigs = useMemo(
    () =>
      ({
        [TIPS.TOP_UP_WALLET]: {
          background:
            "bg-white dark:bg-surface-02dp hover:bg-orange-50 dark:hover:bg-orange-900",
          border: "border-orange-500",
          arrow: "text-orange-500",
          backgroundIcon: <BuyBitcoinTipCardIcon />,
          link: "https://getalby.com/topup",
        },
        [TIPS.DEMO]: {
          background:
            "bg-white dark:bg-surface-02dp hover:bg-yellow-50 dark:hover:bg-yellow-900",
          border: "border-yellow-500",
          arrow: "text-yellow-500",
          backgroundIcon: <DemoTipCardIcon />,
          link: "https://getalby.com/demo",
        },
        [TIPS.MNEMONIC]: {
          background:
            "bg-white dark:bg-surface-02dp hover:bg-purple-50 dark:hover:bg-purple-900",
          border: "border-purple-500",
          arrow: "text-purple-500",
          backgroundIcon: <MnemonicTipCardIcon />,
          link: `/accounts/${accountId}/secret-key/generate`,
        },
      } as const),
    [accountId]
  );

  // const navigate = useNavigate();

  const { tips, closeTip } = useTips();

  function hasTip(id: TIPS) {
    return tips.includes(id);
  }

  const tipElements = Object.values(TIPS)
    .filter(hasTip)
    .map((tip) => {
      const config = tipCardConfigs[tip];
      const isExternal = config.link.startsWith("http");
      return (
        <Link
          key={tip}
          to={config.link}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
        >
          <TipCard
            handleClose={(e) => {
              closeTip(tip);
              e.preventDefault();
            }}
            title={t(`${tip}.title`)}
            description={t(`${tip}.description`)}
            className={classNames(config.background, config.border)}
            arrowClassName={config.arrow}
            backgroundIcon={config.backgroundIcon}
          />
        </Link>
      );
    });

  return <>{tipElements}</>;
}
