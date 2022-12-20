import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import TextField from "@components/form/TextField";
import type { KeyPrefix } from "i18next";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export type PasswordFormData = {
  password: string;
  passwordConfirmation: string;
};

export type Props<T extends PasswordFormData = PasswordFormData> = {
  i18nKeyPrefix: KeyPrefix<"translation">;
  children?: React.ReactNode;
  formData: T;
  setFormData: (formData: T) => void;
  minLength?: number;
  confirm?: boolean;
  autoFocus?: boolean;
};

type errorMessage =
  | ""
  | "enter_password"
  | "confirm_password"
  | "mismatched_password";

const initialErrors: Record<string, errorMessage> = {
  passwordErrorMessage: "",
  passwordConfirmationErrorMessage: "",
};

export default function PasswordForm<
  T extends PasswordFormData = PasswordFormData
>({
  formData,
  setFormData,
  i18nKeyPrefix,
  minLength,
  confirm = true,
  autoFocus = true,
}: Props<T>) {
  const [errors, setErrors] = useState(initialErrors);
  const [passwordView, setPasswordView] = useState(false);
  const [passwordConfirmationView, setPasswordConfirmationView] =
    useState(false);
  const { t } = useTranslation("translation", {
    keyPrefix: i18nKeyPrefix,
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (
      event.target.name === "password" ||
      event.target.name === "passwordConfirmation"
    ) {
      setFormData({
        ...formData,
        [event.target.name]: event.target.value.trim(),
      });
    }

    if (event.target.name === "password" && errors.passwordErrorMessage) {
      setErrors({ ...errors, passwordErrorMessage: "" });
    } else if (
      event.target.name === "passwordConfirmation" &&
      errors.passwordConfirmationErrorMessage &&
      formData.password === event.target.value.trim()
    ) {
      setErrors({ ...errors, passwordConfirmationErrorMessage: "" });
    }
  }

  function validate() {
    let passwordErrorMessage: errorMessage = "";
    let passwordConfirmationErrorMessage: errorMessage = "";

    if (!formData.password) passwordErrorMessage = "enter_password";
    if (confirm && !formData.passwordConfirmation) {
      passwordConfirmationErrorMessage = "confirm_password";
    } else if (confirm && formData.password !== formData.passwordConfirmation) {
      passwordConfirmationErrorMessage = "mismatched_password";
    }
    setErrors({
      passwordErrorMessage,
      passwordConfirmationErrorMessage,
    });
  }

  return (
    <>
      <div className="w-full mb-6">
        <TextField
          autoFocus={autoFocus}
          id="password"
          label={t("choose_password.label")}
          type={passwordView ? "text" : "password"}
          required
          onChange={handleChange}
          tabIndex={0}
          minLength={minLength}
          pattern={minLength ? `.{${minLength},}` : undefined}
          title={
            minLength
              ? `at least ${minLength} characters`
              : undefined /*TODO: i18n */
          }
          onBlur={validate}
          endAdornment={
            <button
              type="button"
              tabIndex={-1}
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
        {errors.passwordErrorMessage && (
          <p className="mt-1 text-red-500">
            {t(`errors.${errors.passwordErrorMessage}`)}
          </p>
        )}
      </div>
      {confirm && (
        <div className="w-full">
          <TextField
            id="passwordConfirmation"
            label={t("confirm_password.label")}
            type={passwordConfirmationView ? "text" : "password"}
            required
            onChange={handleChange}
            onBlur={validate}
            tabIndex={1}
            endAdornment={
              <button
                type="button"
                className="flex justify-center items-center w-10 h-8"
                tabIndex={-1}
                onClick={() =>
                  setPasswordConfirmationView(!passwordConfirmationView)
                }
              >
                {passwordConfirmationView ? (
                  <HiddenIcon className="h-6 w-6" />
                ) : (
                  <VisibleIcon className="h-6 w-6" />
                )}
              </button>
            }
          />
          {errors.passwordConfirmationErrorMessage && (
            <p className="mt-1 text-red-500">
              {t(`errors.${errors.passwordConfirmationErrorMessage}`)}
            </p>
          )}
        </div>
      )}
    </>
  );
}
