import { useTranslation } from "react-i18next";

type RangeLabelProps = {
  min?: number | string | undefined;
  max?: number | string | undefined;
};
export function RangeLabel({ min, max }: RangeLabelProps) {
  const { t } = useTranslation("common");

  if (min && max) {
    return <>{t("range.between", { min, max })}</>;
  } else if (min) {
    return <>{t("range.greaterThan", { min })}</>;
  } else if (max) {
    return <>{t("range.lessThan", { max })}</>;
  } else {
    return null;
  }
}
