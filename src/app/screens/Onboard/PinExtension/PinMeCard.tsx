import { useTranslation } from "react-i18next";
import { useTheme } from "~/app/utils";

function PinMeCard() {
  const theme = useTheme();

  const { t } = useTranslation("translation", {
    keyPrefix: "welcome.pin_extension",
  });

  const iconSrc =
    theme === "light"
      ? "assets/icons/alby_icon_yellow.svg"
      : "assets/icons/alby_icon_yellow_dark.svg";

  return (
    <div
      className="flex items-center justify-between gap-3 px-4
                 text-black dark:text-white rounded-br-2xl rounded-bl-2xl
                 border border-gray-300 dark:border-surface-01dp bg-white dark:bg-surface-02dp cursor-pointer"
    >
      <img src={iconSrc} alt="Pin your Alby extension" className="w-6 h-6" />

      <p className="text-lg font-thin">{t("cta")}</p>

      <img
        src="assets/icons/up_arrow.svg"
        alt="Pin your Alby extension"
        className="w-4 h-4 dark:invert"
      />
    </div>
  );
}

export default PinMeCard;
