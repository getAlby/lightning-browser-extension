import { useSettings } from "~/app/context/SettingsContext";
import { TIPS } from "~/common/constants";

const DEFAULT_TIPS = [TIPS.MNEMONIC];

export const filterTips = (closedTips: TIPS[]) => {
  return DEFAULT_TIPS.filter((tip: TIPS) => {
    if (closedTips.includes(tip)) return false;

    return true;
  });
};

export const useTips = () => {
  const { settings, updateSetting } = useSettings();
  const tips = filterTips(settings.closedTips);

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
