import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import { useEffect, useState } from "react";

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
        <VisibleIcon className="h-6 w-6" />
      ) : (
        <HiddenIcon className="h-6 w-6" />
      )}
    </button>
  );
}
