import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import { useState } from "react";

type Props = {
  passwordViewSuccessCallback: (passwordView: boolean) => void;
};

export default function PasswordViewAdornment({
  passwordViewSuccessCallback,
}: Props) {
  const [passwordView, setPasswordView] = useState(false);
  return (
    <button
      type="button"
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
