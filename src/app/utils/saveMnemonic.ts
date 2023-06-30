import { saveNostrPrivateKey } from "~/app/utils/savePrivateKey";
import { deriveNostrPrivateKey } from "~/common/lib/mnemonic";
import msg from "~/common/lib/msg";

export async function saveMnemonic(accountId: string, mnemonic: string) {
  const nostrPriv = (await msg.request("nostr/getPrivateKey", {
    id: accountId,
  })) as string;

  const hasNostrPrivateKey = !!nostrPriv;

  await msg.request("setMnemonic", {
    id: accountId,
    mnemonic,
  });

  if (!hasNostrPrivateKey) {
    const nostrPrivateKey = deriveNostrPrivateKey(mnemonic);
    await saveNostrPrivateKey(accountId, nostrPrivateKey);
  }
}
