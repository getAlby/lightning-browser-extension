import { MouseEventHandler } from "react";

import Button from "../Button";

type Props = {
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  onConfirm: MouseEventHandler;
  onCancel: MouseEventHandler;
};

function ConfirmOrCancel({
  disabled = false,
  loading = false,
  label = "Confirm",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="text-center">
      <div className="mb-4">
        <Button
          onClick={onConfirm}
          label={label}
          fullWidth
          primary
          disabled={disabled}
          loading={loading}
        />
      </div>

      <p className="mb-2 text-sm text-gray-400">
        <em>Only connect with sites you trust.</em>
      </p>

      <a
        className="underline text-sm text-gray-600 dark:text-neutral-400"
        href="#"
        onClick={onCancel}
      >
        Cancel
      </a>
    </div>
  );
}

export default ConfirmOrCancel;
