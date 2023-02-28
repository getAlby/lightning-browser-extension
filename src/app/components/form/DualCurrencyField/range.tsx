import { useTranslation } from "react-i18next";

type RangeProps = {
  min?: number | string | undefined;
  max?: number | string | undefined;
};
export function Range({ min, max }: RangeProps): React.ReactElement {
  const { t } = useTranslation("common");

  if (min && max) {
    return <>{t("range.between", { min, max })}</>;
  } else if (min) {
    return <>{t("range.greaterThan", { min })}</>;
  } else if (max) {
    return <>{t("range.lessThan", { max })}</>;
  }

  return <></>;
}
