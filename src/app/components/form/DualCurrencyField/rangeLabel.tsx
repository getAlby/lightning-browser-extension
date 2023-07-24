import { useTranslation } from "react-i18next";
import { useSettings } from "~/app/context/SettingsContext";

type RangeLabelProps = {
  min?: number | string | undefined;
  max?: number | string | undefined;
};
export function RangeLabel({ min, max }: RangeLabelProps) {
  const { t } = useTranslation("common");
  const { getFormattedNumber } = useSettings();

  if (min && max) {
    return (
      <>
        {t("range.between", {
          min: getFormattedNumber(min),
          max: getFormattedNumber(max),
        })}
      </>
    );
  } else if (min) {
    return <>{t("range.greaterOrEqual", { min: getFormattedNumber(min) })}</>;
  } else if (max) {
    return <>{t("range.lessThanOrEqual", { max: getFormattedNumber(max) })}</>;
  } else {
    return null;
  }
}
