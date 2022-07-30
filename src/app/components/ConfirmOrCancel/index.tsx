import { MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";

import Button from "../Button";

export type Props = {
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  onConfirm: MouseEventHandler;
  onCancel: MouseEventHandler;
};

export default function ConfirmOrCancel({
  disabled = false,
  loading = false,
  label = "Confirm",
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation("components", {
    keyPrefix: "confirmOrCancel",
  });
  return (
    <div className="text-center">
      <div className="flex flex-row mb-4">
        <Button onClick={onCancel} label={"Cancel"} halfWidth />
        <Button
          onClick={onConfirm}
          label={label}
          primary
          disabled={disabled}
          loading={loading}
          halfWidth
        />
      </div>

      <p className="mb-2 text-sm text-gray-400">{t("only_trusted")}</p>
    </div>
  );
}
