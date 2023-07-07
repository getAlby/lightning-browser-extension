import { classNames, isAlbyLNDHubAccount, isAlbyOAuthAccount } from "./index";

test("joins classNames together", () => {
  const largeText = true;
  const smallText = false;
  expect(
    classNames(
      "p-4 block",
      "bg-blue-200",
      largeText && "text-3xl",
      smallText && "text-xs",
      "flex flex-col"
    )
  ).toBe("p-4 block bg-blue-200 text-3xl flex flex-col");
});

test("isAlbyLNDHubAccount", () => {
  expect(isAlbyLNDHubAccount("🐝 getalby.com", "alby")).toBe(false);
  expect(isAlbyLNDHubAccount("🐝 getalby.com", "")).toBe(false);
  expect(isAlbyLNDHubAccount("🐝 getalby.com", "lndhub")).toBe(true);
});

test("isAlbyOAuthAccount", () => {
  expect(isAlbyOAuthAccount("lndhub")).toBe(false);
  expect(isAlbyOAuthAccount("")).toBe(false);
  expect(isAlbyOAuthAccount("alby")).toBe(true);
});
