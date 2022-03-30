import { classNames } from "./index";

test("joins classNames together", () => {
  const largeText = true;
  const smallText = false;
  expect(
    classNames(
      "p-4 block" || "",
      "bg-blue-200",
      largeText && "text-3xl",
      smallText && "text-xs",
      "flex flex-col"
    )
  ).toBe("p-4 block bg-blue-200 text-3xl flex flex-col");
});
