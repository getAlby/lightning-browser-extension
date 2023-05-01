import { saveNostrPrivateKey } from "~/app/utils/saveNostrPrivateKey";
import { deriveNostrPrivateKey } from "~/common/lib/mnemonic";
import msg from "~/common/lib/msg";

export async function saveMnemonic(accountId: string, mnemonic: string) {
  const priv = (await msg.request("nostr/getPrivateKey", {
    id: accountId,
  })) as string;
  const hasNostrPrivateKey = !!priv;

  if (hasNostrPrivateKey) {
    alert(
      "This account already has a nostr private key set and will not be derived from this secret key. You can manage your nostr key from your account settings."
    );
  }
  await msg.request("setMnemonic", {
    id: accountId,
    mnemonic,
  });

  if (!hasNostrPrivateKey) {
    const nostrPrivateKey = await deriveNostrPrivateKey(mnemonic);
    await saveNostrPrivateKey(accountId, nostrPrivateKey);
  }
}
