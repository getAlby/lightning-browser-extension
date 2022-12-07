import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import AlbyLogo from "@components/AlbyLogo";
import Button from "@components/Button";
import Input from "@components/form/Input";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "~/app/context/AccountContext";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";

function Unlock() {
  const [password, setPassword] = useState("");
  const [passwordView, setPasswordView] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as {
    state: { from?: { pathname?: string } };
  };
  const auth = useAccount();
  const { t } = useTranslation("translation", { keyPrefix: "unlock" });
  const { t: tCommon } = useTranslation("common");
  const from = location.state.from?.pathname || "/";

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setPassword(event.target.value);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    unlock();
    event.preventDefault();
  }

  async function reset(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    await msg.request("reset");
    utils.openPage("welcome.html");
  }

  function unlock() {
    setLoading(true);
    auth
      .unlock(password, () => {
        navigate(from, { replace: true });
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }

  return (
    <div className="p-8">
      <div className="flex justify-center">
        <div className="w-40 dark:text-white">
          <AlbyLogo />
        </div>
      </div>
      <p className="text-center text-xl font-normal font-serif mt-8 mb-5 dark:text-white">
        {t("unlock_to_continue")}
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <Input
            placeholder={t("unlock_password")}
            type={passwordView ? "text" : "password"}
            autoFocus
            value={password}
            onChange={handlePasswordChange}
            endAdornment={
              <button
                type="button"
                className="flex justify-center items-center w-10 h-8"
                onClick={() => {
                  setPasswordView(!passwordView);
                }}
              >
                {passwordView ? (
                  <HiddenIcon className="h-6 w-6" />
                ) : (
                  <VisibleIcon className="h-6 w-6" />
                )}
              </button>
            }
          />
          {error && (
            <>
              <p className="mt-1 text-red-500">{error}</p>
              <p className="mt-1 text-gray-500">{t("unlock_error.help")}</p>
              <p className="mt-1">
                <a
                  href="#"
                  className="text-gray-500 underline "
                  onClick={reset}
                >
                  {t("unlock_error.link")}
                </a>
              </p>
            </>
          )}
        </div>
        <Button
          type="submit"
          label={tCommon("actions.unlock")}
          fullWidth
          primary
          loading={loading}
          disabled={loading || password === ""}
        />

        <div className="flex justify-center space-x-1 mt-5">
          <span className="text-gray-500">{t("help_contact.part1")} </span>
          <a
            className="text-orange-bitcoin font-semibold"
            href="mailto:support@getalby.com"
          >
            {t("help_contact.part2")}
          </a>
        </div>
      </form>
    </div>
  );
}

export default Unlock;
