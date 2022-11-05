import { useRef, useEffect } from "react";
import type { MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import Button from "~/app/components/Button";
import i18n from "~/i18n/i18nConfig";
import { commonI18nNamespace } from "~/i18n/namespaces";

export type Props = {
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  onConfirm?: MouseEventHandler;
  onCancel: MouseEventHandler;
  isFocused?: boolean;
};

export default function ConfirmOrCancel({
  disabled = false,
  loading = false,
  label = i18n.t("actions.confirm", commonI18nNamespace) as string,
  onConfirm,
  onCancel,
  isFocused = true,
}: Props) {
  const { t: tCommon } = useTranslation("common");
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    isFocused && buttonRef?.current?.focus();
  }, [isFocused]);

  return (
    <div className="pt-2 pb-4">
      <div className="flex flex-row justify-between">
        <Button
          onClick={onCancel}
          label={tCommon("actions.cancel")}
          halfWidth
          disabled={loading}
        />
        <Button
          type="submit"
          ref={buttonRef}
          onClick={onConfirm}
          label={label}
          primary
          disabled={disabled}
          loading={loading}
          halfWidth
        />
      </div>
    </div>
  );
}
