import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import { useEffect, useState } from "react";

type Props = {
  passwordViewSuccessCallback: (passwordView: boolean) => void;
  isRevealed?: boolean;
};

export default function PasswordViewAdornment({
  passwordViewSuccessCallback,
  isRevealed,
}: Props) {
  const [passwordView, setPasswordView] = useState(false);

  // toggle the button if password view is handled by component itself
  useEffect(() => {
    if (typeof isRevealed !== "undefined") {
      setPasswordView(isRevealed);
    }
  }, [isRevealed]);

  return (
    <button
      type="button"
      tabIndex={-1}
      className="flex justify-center items-center w-10 h-8"
      onClick={() => {
        setPasswordView(!passwordView);
        passwordViewSuccessCallback(!passwordView);
      }}
    >
      {passwordView ? (
        <HiddenIcon className="h-6 w-6" />
      ) : (
        <VisibleIcon className="h-6 w-6" />
      )}
    </button>
  );
}
