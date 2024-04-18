import type { MouseEventHandler } from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Button from "~/app/components/Button";
import i18n from "~/i18n/i18nConfig";

export type Props = {
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  onSign?: MouseEventHandler;
  onDeny: MouseEventHandler;
  isFocused?: boolean;
};

export default function SignOrDeny({
  disabled = false,
  loading = false,
  label = i18n.t("common:actions.sign"),
  onSign,
  onDeny,
  isFocused = true,
}: Props) {
  const { t: tCommon } = useTranslation("common");
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    isFocused && buttonRef?.current?.focus();
  }, [isFocused]);

  return (
    <div className="flex flex-row justify-between">
      <Button
        onClick={onDeny}
        label={tCommon("actions.deny")}
        halfWidth
        className="text-red-700 dark:text-red-300"
        disabled={loading}
      />
      <Button
        type="submit"
        ref={buttonRef}
        onClick={onSign}
        label={label}
        primary
        disabled={disabled}
        loading={loading}
        halfWidth
      />
    </div>
  );
}
