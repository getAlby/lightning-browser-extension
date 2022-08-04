import { MouseEventHandler } from "react";

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
  return (
    <div className="p-2 pb-4">
      <div className="flex flex-row">
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
    </div>
  );
}
