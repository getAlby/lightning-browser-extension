import { Account, Accounts } from "~/types";

export const UNLOCK_PASSWORD_MIN_LENGTH = 8;

export type PasswordError =
  | ""
  | "enter_password"
  | "password_too_short"
  | "password_numeric_only";

export type PasswordConfirmationError =
  | ""
  | "confirm_password"
  | "mismatched_password";

export function getPasswordError(
  password: string,
  minLength = UNLOCK_PASSWORD_MIN_LENGTH
): PasswordError {
  if (!password) return "enter_password";
  if (password.length < minLength) return "password_too_short";
  if (/^\d+$/.test(password)) return "password_numeric_only";
  return "";
}

export function isValidUnlockPassword(
  password: string,
  minLength = UNLOCK_PASSWORD_MIN_LENGTH
): boolean {
  return getPasswordError(password, minLength) === "";
}

export const validate = (formData: Record<string, string>) => {
  const password = getPasswordError(formData.password);
  let passwordConfirmation: PasswordConfirmationError = "";

  if (!formData.passwordConfirmation) {
    passwordConfirmation = "confirm_password";
  } else if (formData.password !== formData.passwordConfirmation) {
    passwordConfirmation = "mismatched_password";
  }

  return {
    password,
    passwordConfirmation,
  };
};

export function getUniqueAccountName(name: string, accounts: Accounts): string {
  const accountNames = Object.values(accounts).map((el: Account) => el.name);

  let count = 1;
  let uniqueName = name;

  while (accountNames.includes(uniqueName)) {
    const match = uniqueName.match(/\((\d+)\)$/);

    if (match) {
      const currentCount = parseInt(match[1]);
      count = currentCount + 1;
      uniqueName = uniqueName.replace(/\(\d+\)$/, `(${count})`);
    } else {
      uniqueName = `${name} (${count})`;
    }
  }

  return uniqueName;
}
