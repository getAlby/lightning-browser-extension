import { saveNostrPrivateKey } from "~/app/utils/saveNostrPrivateKey";
import { deriveNostrPrivateKey } from "~/common/lib/mnemonic";
import msg from "~/common/lib/msg";

export async function saveMnemonic(accountId: string, mnemonic: string) {
  const priv = (await msg.request("nostr/getPrivateKey", {
    id: accountId,
  })) as string;
  const hasNostrPrivateKey = !!priv;

  await msg.request("setMnemonic", {
    id: accountId,
    mnemonic,
  });

  if (!hasNostrPrivateKey) {
    const nostrPrivateKey = await deriveNostrPrivateKey(mnemonic);
    await saveNostrPrivateKey(accountId, nostrPrivateKey);
  }
}
