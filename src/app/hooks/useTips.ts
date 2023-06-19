import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { isAlbyAccount } from "~/app/utils";
import { TIPS } from "~/common/constants";

const DEFAULT_TIPS = [TIPS.TOP_UP_WALLET, TIPS.MNEMONIC];

export const filterTips = (closedTips: TIPS[], connector = "") => {
  return DEFAULT_TIPS.filter((tip: TIPS) => {
    if (closedTips.includes(tip)) return false;

    if (tip === TIPS.TOP_UP_WALLET && !isAlbyAccount(connector)) return false;

    return true;
  });
};

export const useTips = () => {
  const { settings, updateSetting } = useSettings();
  const { account } = useAccount();

  const tips = filterTips(settings.closedTips, account?.connector);

  const closeTip = (tip: TIPS) => {
    updateSetting({
      closedTips: [...settings.closedTips, tip],
    });
  };
  return {
    tips,
    closeTip,
  };
};
