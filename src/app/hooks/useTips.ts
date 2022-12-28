import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { TIPS } from "~/common/constants";

export const isAlbyAccount = (alias = "") => {
  return alias === "🐝 getalby.com";
};

export const isChrome = (): boolean => {
  return !!window.chrome;
};

export const filterTips = (tips: TIPS[], alias = "") => {
  return tips.filter((tip: string) => {
    if (tip === TIPS.TOP_UP_WALLET && !isAlbyAccount(alias)) return false;

    if (tip === TIPS.PIN && !isChrome()) return false;
    return true;
  });
};

export const useTips = () => {
  const { settings, updateSetting } = useSettings();
  const { account } = useAccount();

  const tips = filterTips(settings.tips, account?.alias);

  const filterTip = (tip: TIPS) => {
    updateSetting({
      tips: tips.filter((currentTip) => currentTip !== tip),
    });
  };
  return {
    tips,
    filterTip,
  };
};
