import { PopiconsEyeLine } from "@popicons/react";
import { useEffect, useState } from "react";
import EyeCrossedIcon from "~/app/icons/EyeCrossedIcon";

type Props = {
  onChange: (viewingPassword: boolean) => void;
  isRevealed?: boolean;
};

export default function PasswordViewAdornment({ onChange, isRevealed }: Props) {
  const [_isRevealed, setRevealed] = useState(false);

  // toggle the button if password view is handled by component itself
  useEffect(() => {
    if (typeof isRevealed !== "undefined") {
      setRevealed(isRevealed);
    }
  }, [isRevealed]);

  return (
    <button
      type="button"
      tabIndex={-1}
      className="flex justify-center items-center w-10 h-8"
      onClick={() => {
        setRevealed(!_isRevealed);
        onChange(!_isRevealed);
      }}
    >
      {_isRevealed ? (
        <EyeCrossedIcon className="h-6 w-6 text-gray-800 dark:text-neutral-200" />
      ) : (
        <PopiconsEyeLine className="h-5 w-5 text-gray-800 dark:text-neutral-200" />
      )}
    </button>
  );
}
