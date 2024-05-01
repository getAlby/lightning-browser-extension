import { PopiconsShieldCheckLine } from "@popicons/react";
import { Trans, useTranslation } from "react-i18next";
import { PermissionOption } from "~/types";

type Props = {
  onChange: () => void;
  i18nKey: PermissionOption;
  values: { permission: string };
};

export default function PermissionSelector({
  i18nKey,
  values,
  onChange,
}: Props) {
  const { t } = useTranslation("components", {
    keyPrefix: "permissions_modal",
  });

  return (
    <div className="flex gap-2 justify-center items-center text-gray-400 dark:text-neutral-600 hover:text-gray-600 dark:hover:text-neutral-400 text-sm">
      <div className="shrink-0">
        <PopiconsShieldCheckLine className="w-4 h-4"></PopiconsShieldCheckLine>
      </div>
      <button type="button" onClick={() => onChange()}>
        <Trans i18nKey={i18nKey} t={t} values={values} components={[]} />
      </button>
    </div>
  );
}
