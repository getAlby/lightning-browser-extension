import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useTheme } from "~/app/utils";

export default function PinExtension() {
  const [keysPressed, setKeysPressed] = useState({
    alt: false,
    a: false,
  });

  const { t } = useTranslation("translation", {
    keyPrefix: "welcome.pin_extension",
  });

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

  // Keyboard shortcut highlighting logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        // eslint-disable-next-line no-console
        console.log("ALT PRESSED");
        setKeysPressed((prev) => ({ ...prev, alt: true }));
      } else if (e.key.toLowerCase() === "a") {
        // eslint-disable-next-line no-console
        console.log("A PRESSED");
        setKeysPressed((prev) => ({ ...prev, a: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        // eslint-disable-next-line no-console
        console.log("ALT UNPRESSED");
        setKeysPressed((prev) => ({ ...prev, alt: false }));
      } else if (e.key.toLowerCase() === "a") {
        // eslint-disable-next-line no-console
        console.log("A UNPRESSED");
        setKeysPressed((prev) => ({ ...prev, a: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="flex flex-col items-center text-lg">
      <div className="shadow-lg rounded-xl bg-white dark:bg-surface-02dp p-10 max-w-xl">
        <h1 className="text-2xl font-bold dark:text-white text-center">
          {t("title")}
        </h1>
        <div className="mt-4 w-full flex justify-center">{getImage()}</div>
        <p className="text-gray-500 mt-6 dark:text-gray-400 text-sm">
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
              <div className="h-4" />,
              // eslint-disable-next-line react/jsx-key
              <img
                src="assets/icons/keyboard.svg"
                className="w-5 inline dark:invert mr-2"
              />,
            ]}
          />
        </p>

        {/* keyboard shortcut */}
        <div className="flex justify-center gap-3 mt-6">
          <div
            className={`text-black dark:text-white rounded-xl py-3 px-5 border-4 border-gray-300 font-bold ${
              keysPressed.alt ? "border-primary dark:text-primary" : ""
            }`}
          >
            {t("keyboard_shortcut.first_key")}
          </div>
          <div
            className={`text-black dark:text-white rounded-xl py-3 px-5 border-4 border-gray-300 font-bold ${
              keysPressed.a ? "border-primary dark:text-primary" : ""
            }`}
          >
            {t("keyboard_shortcut.second_key")}
          </div>
        </div>
      </div>
    </div>
  );
}
