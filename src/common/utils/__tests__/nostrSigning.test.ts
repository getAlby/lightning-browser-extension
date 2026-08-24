import { isEventSerialization, parseDelegation } from "../nostrSigning";

const PUBKEY =
  "4f355bdcb7cc0af728ef3cceb9615d90684bb5b2ca5f859ab0f0b704075871aa";

describe("isEventSerialization", () => {
  test("recognises a NIP-01 serialization", () => {
    const serialized = JSON.stringify([
      0,
      PUBKEY,
      1785942594,
      0,
      [["p", PUBKEY]],
      '{"lud16":"someone@example.com"}',
    ]);

    expect(isEventSerialization(serialized)).toBe(true);
  });

  test.each([
    ["a plain string", "please sign in to example.com"],
    ["a hex digest", "a".repeat(64)],
    ["a JSON object", '{"kind":1,"content":"hello"}'],
    ["an array of the wrong length", JSON.stringify([0, PUBKEY, 1, 1, []])],
    [
      "an array with a non-zero prefix",
      JSON.stringify([1, PUBKEY, 1785942594, 0, [], ""]),
    ],
    [
      "an array whose pubkey is not 32 hex bytes",
      JSON.stringify([0, "not-a-pubkey", 1785942594, 0, [], ""]),
    ],
    [
      "an array whose tags are not a list",
      JSON.stringify([0, PUBKEY, 1785942594, 0, "tags", ""]),
    ],
  ])("does not flag %s", (_label, input) => {
    expect(isEventSerialization(input)).toBe(false);
  });
});

describe("parseDelegation", () => {
  test("splits delegatee and conditions", () => {
    expect(
      parseDelegation(`nostr:delegation:${PUBKEY}:kind=1&created_at<4102444800`)
    ).toEqual({
      delegatee: PUBKEY,
      conditions: "kind=1&created_at<4102444800",
    });
  });

  test("keeps colons that belong to the conditions", () => {
    expect(
      parseDelegation(`nostr:delegation:${PUBKEY}:kind=1&note=a:b`)?.conditions
    ).toBe("kind=1&note=a:b");
  });

  test("keeps an unconditional delegation, which is the widest one", () => {
    expect(parseDelegation(`nostr:delegation:${PUBKEY}:`)).toEqual({
      delegatee: PUBKEY,
      conditions: "",
    });
  });

  test.each([
    ["a plain message", "nostr is great"],
    ["a missing conditions part", `nostr:delegation:${PUBKEY}`],
    ["a delegatee that is not a pubkey", "nostr:delegation:someone:kind=1"],
  ])("returns undefined for %s", (_label, input) => {
    expect(parseDelegation(input)).toBeUndefined();
  });
});
