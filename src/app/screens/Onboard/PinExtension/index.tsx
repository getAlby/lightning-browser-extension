import Button from "@components/Button";
import { Trans, useTranslation } from "react-i18next";
import { getBrowserType, useTheme } from "~/app/utils";
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
    const imageType = getBrowserType();

    return (
      <img
        src={`assets/images/pin_your_alby_extension_${imageType}_${theme}.png`}
        alt="Pin your Alby extension"
        className="h-28"
      />
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="shadow-lg rounded-xl bg-white dark:bg-surface-02dp p-12 max-w-lg">
        <h1 className="text-2xl font-bold dark:text-white max-sm:text-center">
          {t("title")}
        </h1>

        <p className="text-gray-500 my-6 dark:text-gray-400">
          {t("description")}
        </p>
        <div className="mt-4 w-full flex justify-center">{getImage()}</div>
        <p className="text-gray-500 mt-6 dark:text-gray-400">
          <Trans
            i18nKey={"explanation"}
            t={t}
            components={[
              // eslint-disable-next-line react/jsx-key
              <img
                src="assets/icons/puzzle.svg"
                className="w-5 inline align-bottom dark:invert"
              />,
              // eslint-disable-next-line react/jsx-key
              <br />,
              // eslint-disable-next-line react/jsx-key
              <img
                src="assets/icons/alby_icon_yellow.svg"
                className="w-5 inline align-bottom"
              />,
            ]}
          />
        </p>
      </div>
      <div className="my-8 flex justify-center">
        <Button
          label={t("next_btn", { icon: "🐝" })}
          primary
          onClick={onNext}
        />
      </div>
    </div>
  );
}
