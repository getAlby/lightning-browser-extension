import db from "~/extension/background-script/db";
import {
  ALWAYS_CONFIRMED_EVENT_KINDS,
  REASONABLE_PRESET_EVENT_KINDS,
} from "~/common/utils/nostrPresets";
import type { MessageAllowanceEnable, Sender } from "~/types";
import { NostrPermissionPreset, PermissionMethodNostr } from "~/types";

import enable from "../enable";

console.error = jest.fn();
console.info = jest.fn();

let preset = NostrPermissionPreset.REASONABLE;
const openPromptMock = jest.fn(async (_message?: unknown) => ({
  data: { enabled: true, remember: true, preset },
}));
jest.mock("~/common/lib/utils", () => ({
  openPrompt: (m: unknown) => openPromptMock(m),
}));

jest.mock("~/extension/background-script/state", () => ({
  getState: () => ({
    isUnlocked: jest.fn(async () => true),
    getAccount: jest.fn(async () => ({ nostrPrivateKey: "11".repeat(32) })),
    currentAccountId: "account-1",
    settings: { browserNotifications: false },
  }),
}));

const HOST = "example.com";
const sender = { origin: `https://${HOST}` } as Sender;

const connect = async () => {
  await enable(
    {
      application: "LBE",
      prompt: true,
      action: "enable",
      args: {},
      origin: { host: HOST, name: "Example", icon: "" },
    } as unknown as MessageAllowanceEnable,
    sender
  );
  return (await db.permissions.toArray()).map((p) => p.method);
};

beforeEach(async () => {
  await db.allowances.clear();
  await db.permissions.clear();
  openPromptMock.mockClear();
});

describe("nostr enable presets", () => {
  test("the reasonable preset grants posting kinds only", async () => {
    preset = NostrPermissionPreset.REASONABLE;
    const granted = await connect();

    for (const kind of REASONABLE_PRESET_EVENT_KINDS) {
      expect(granted).toContain(
        `${PermissionMethodNostr.NOSTR_SIGNMESSAGE}/${kind}`
      );
    }
    expect(granted).toContain(PermissionMethodNostr.NOSTR_GETPUBLICKEY);
  });

  test("the reasonable preset grants neither decryption nor encryption", async () => {
    preset = NostrPermissionPreset.REASONABLE;
    const granted = await connect();

    expect(granted).not.toContain(PermissionMethodNostr.NOSTR_DECRYPT);
    expect(granted).not.toContain(PermissionMethodNostr.NOSTR_ENCRYPT);
  });

  test("the reasonable preset grants no identity or authentication kind", async () => {
    preset = NostrPermissionPreset.REASONABLE;
    const granted = await connect();

    for (const kind of ALWAYS_CONFIRMED_EVENT_KINDS) {
      expect(granted).not.toContain(
        `${PermissionMethodNostr.NOSTR_SIGNMESSAGE}/${kind}`
      );
    }
  });

  test("no preset grants decryption, including trust fully", async () => {
    preset = NostrPermissionPreset.TRUST_FULLY;
    const granted = await connect();

    expect(granted).not.toContain(PermissionMethodNostr.NOSTR_DECRYPT);
    expect(granted).toContain(PermissionMethodNostr.NOSTR_ENCRYPT);
  });

  test("the paranoid preset grants nothing", async () => {
    preset = NostrPermissionPreset.PARANOID;
    const granted = await connect();

    expect(granted).toEqual([]);
  });

  test("every granted permission is persisted before enable resolves", async () => {
    preset = NostrPermissionPreset.REASONABLE;
    // no waiting: the grants must be awaited, not left running after the return
    const granted = await connect();

    expect(granted).toHaveLength(REASONABLE_PRESET_EVENT_KINDS.length + 1);
  });
});
