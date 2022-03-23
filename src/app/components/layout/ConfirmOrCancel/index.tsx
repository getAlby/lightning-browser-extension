import { MouseEventHandler } from "react";

import Button from "../../Button";

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
      <div className="mb-5">
        <Button
          onClick={onConfirm}
          label="Confirm"
          fullWidth
          primary
          disabled={disabled}
          loading={loading}
        />
      </div>

      <p className="mb-3 underline text-sm text-gray-300">
        Only connect with sites you trust.
      </p>

      <a
        className="underline text-sm text-gray-500 dark:text-gray-400"
        href="#"
        onClick={onCancel}
      >
        Cancel
      </a>
    </div>
  );
}

export default ConfirmOrCancel;
