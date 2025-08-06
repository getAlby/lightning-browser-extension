import Button from "@components/Button";
import { Trans, useTranslation } from "react-i18next";
import { useTheme } from "~/app/utils";
import utils from "~/common/lib/utils";

export default function PinExtension() {
  const { t } = useTranslation("translation", {
    keyPrefix: "welcome.pin_extension",
  });

  const onNext = () => {
    utils.redirectPage("options.html#/wallet");
  };

  const theme = useTheme();

  const getImage = () => {
    return (
      <img
        src={
          theme === "dark"
            ? "assets/icons/alby_logo_dark.svg"
            : "assets/icons/alby_logo.svg"
        }
        alt="Pin your Alby extension"
        className="h-32"
      />
    );
  };

  return (
    <div className="flex flex-col items-center text-lg ">
      <div className="shadow-lg rounded-xl bg-white dark:bg-surface-02dp p-10 md:max-w-2xl">
        <h1 className="text-2xl  font-bold dark:text-white text-center">
          {t("title")}
        </h1>
        <div className="mt-4 w-full flex justify-center">{getImage()}</div>
        <div className="text-gray-500 mt-6 dark:text-gray-400 text-sm">
          <Trans
            i18nKey={"explanation"}
            t={t}
            components={[
              // eslint-disable-next-line react/jsx-key
              <img
                src="assets/icons/extension.svg"
                className="w-5 inline dark:invert mr-2"
              />,
              // eslint-disable-next-line react/jsx-key
              <span className="block h-4" />,
              // eslint-disable-next-line react/jsx-key
              <img
                src="assets/icons/keyboard.svg"
                className="w-5 inline dark:invert mr-2"
              />,
            ]}
          />
        </div>

        {/* keyboard shortcut */}
        <div className="flex justify-center gap-3 mt-6">
          <div className="text-black dark:text-white text-xl rounded-xl py-4 px-5 border-2 border-primary font-bold">
            {t("keyboard_shortcut.windows_modifier_key")} /{" "}
            {t("keyboard_shortcut.mac_modifier_key")}
          </div>

          <div className="text-black dark:text-white text-xl rounded-xl py-4 px-5 border-2 border-[#F8C455] font-bold">
            {t("keyboard_shortcut.second_key")}
          </div>
        </div>
      </div>

      <div className="flex md:hidden my-8 justify-center">
        <Button
          label={t("next_btn", { icon: "🐝" })}
          primary
          onClick={onNext}
        />
      </div>
    </div>
  );
}
