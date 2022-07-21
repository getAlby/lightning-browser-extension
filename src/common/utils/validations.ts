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
