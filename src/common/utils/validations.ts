import { Account, Accounts } from '~/types';

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
  // get all accounts names to avoid duplicate names
  const accountNames = Object.values(accounts).map((el: Account) => el.name);

  // increase nameSuffix number recursively
  while (accountNames.includes(name)) {
    // get number in between (1) and increase by 1
    const bracketsValue = +name.substring(name.indexOf("(") + 1, name.lastIndexOf(")"));
    const accountNameCount = bracketsValue + 1;
    const nameContainsSuffix = name.match(/\(\d\)/);
    // if name already contains a suffix, remove it to add the increased
    if (nameContainsSuffix) {
      const suffixIndex = name.lastIndexOf('(');
      name = name.substring(0, suffixIndex);
    }
    const nameSuffix = ` (${accountNameCount})`;
    name = `${name}${nameSuffix}`;
    name = name.replace("  ", " ");
  }
  return name;
}
