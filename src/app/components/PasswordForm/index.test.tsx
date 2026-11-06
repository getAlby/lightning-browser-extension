import { fireEvent, render, screen } from "@testing-library/react";

import PasswordForm from "./index";

describe("PasswordForm", () => {
  test("keeps leading and trailing whitespace of the password", () => {
    const setFormData = jest.fn();
    render(
      <PasswordForm
        i18nKeyPrefix="welcome.set_password"
        formData={{ password: "", passwordConfirmation: "" }}
        setFormData={setFormData}
      />
    );

    fireEvent.change(screen.getByLabelText("Choose an unlock passcode:"), {
      target: { value: " secret " },
    });

    expect(setFormData).toHaveBeenCalledWith({
      password: " secret ",
      passwordConfirmation: "",
    });
  });
});
