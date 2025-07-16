import { useTheme } from "~/app/utils";

function PinMeCard() {
  const theme = useTheme();

  const iconSrc =
    theme === "light"
      ? "assets/icons/alby_icon_yellow.svg"
      : "assets/icons/alby_icon_yellow_dark.svg";

  return (
    <div
      className="flex items-center justify-between gap-3 px-8
                 text-black dark:text-white rounded-br-2xl rounded-bl-2xl
                 border border-[#E4E6EA] dark:border-surface-01dp bg-white dark:bg-surface-02dp"
    >
      <img src={iconSrc} alt="Pin your Alby extension" className="w-5 h-5" />

      <p className="text-sm font-medium">Pin me here!</p>

      <img
        src="assets/icons/up_arrow.svg"
        alt="Pin your Alby extension"
        className="w-4 h-4 dark:invert"
      />
    </div>
  );
}

export default PinMeCard;
