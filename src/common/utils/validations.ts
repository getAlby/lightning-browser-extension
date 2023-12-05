import { Account, Accounts } from "~/types";

export const validate = (formData: Record<string, string>) => {
  let password = "";
  let passwordConfirmation = "";

  if (!formData.password) password = "enter_password";
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
